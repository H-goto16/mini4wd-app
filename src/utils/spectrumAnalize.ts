/** 周波数ビンごとに時間方向の移動平均を取る (N フレーム) */
export class MovingAverageFilter {
  private windowSize: number;
  private history: Float32Array[] = [];
  private sum: Float32Array = new Float32Array(0);

  constructor(windowSize: number) {
    this.windowSize = Math.max(1, Math.round(windowSize));
  }

  public apply(input: ArrayLike<number>, out: Float32Array): void {
    const n = input.length;
    if (this.sum.length !== n) {
      this.sum = new Float32Array(n);
      this.history = [];
    }
    const frame = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      frame[i] = input[i];
      this.sum[i] += input[i];
    }
    this.history.push(frame);
    while (this.history.length > this.windowSize) {
      const old = this.history.shift()!;
      for (let i = 0; i < n; i++) this.sum[i] -= old[i];
    }
    const len = this.history.length;
    for (let i = 0; i < n; i++) out[i] = this.sum[i] / len;
  }

  public setWindowSize(windowSize: number) {
    const w = Math.max(1, Math.round(windowSize) || 1);
    if (w === this.windowSize) return;
    this.windowSize = w;
    this.reset();
  }

  public reset() {
    this.history = [];
    this.sum = new Float32Array(0);
  }
}

/** 周波数ビンごとに時間方向の一次 IIR ローパス (y = a*x + (1-a)*y_prev) */
export class LowPassFilter {
  private alpha: number;
  private prev: Float32Array = new Float32Array(0);

  constructor(alpha: number) {
    this.alpha = LowPassFilter.clamp(alpha);
  }

  private static clamp(a: number) {
    return Math.min(1, Math.max(0.01, Number.isFinite(a) ? a : 1));
  }

  public apply(input: ArrayLike<number>, out: Float32Array): void {
    const n = input.length;
    if (this.prev.length !== n) this.prev = Float32Array.from(input as any);
    const a = this.alpha;
    for (let i = 0; i < n; i++) {
      const y = a * input[i] + (1 - a) * this.prev[i];
      this.prev[i] = y;
      out[i] = y;
    }
  }

  public setCoefficient(coefficient: number) {
    this.alpha = LowPassFilter.clamp(coefficient);
  }

  public reset() {
    this.prev = new Float32Array(0);
  }
}

export type SpectrumTheme = {
  background: string;
  grid: string;
  text: string;
  raw: string;
  filtered: string;
  peak: string;
  diff: string;
  outOfRange: string;
};

export const DARK_THEME: SpectrumTheme = {
  background: "#0b0d12",
  grid: "rgba(255,255,255,0.07)",
  text: "rgba(255,255,255,0.55)",
  raw: "rgba(255,255,255,0.28)",
  filtered: "#ff8a1f",
  peak: "#ff3b30",
  diff: "#38bdf8",
  outOfRange: "rgba(255,59,48,0.08)",
};

export const LIGHT_THEME: SpectrumTheme = {
  background: "#ffffff",
  grid: "rgba(0,0,0,0.08)",
  text: "rgba(0,0,0,0.55)",
  raw: "rgba(0,0,0,0.25)",
  filtered: "#e8590c",
  peak: "#d92d20",
  diff: "#0284c7",
  outOfRange: "rgba(255,0,0,0.06)",
};

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private rawData: Uint8Array = new Uint8Array(0);
  private filtered: Float32Array = new Float32Array(0);
  private scratch: Float32Array = new Float32Array(0);
  private denoised: Float32Array = new Float32Array(0);
  private noiseProfile: Float32Array | null = null;
  private learning: { until: number; sum: Float32Array; count: number } | null =
    null;
  /** この振幅 (0-255) 未満のピークは無音扱いにする */
  private noiseGate = 0;
  private animationId = 0;
  private canvas: HTMLCanvasElement | null = null;
  private generation = 0;

  private lowPassFilter = new LowPassFilter(0.25);
  private movingAverageFilter = new MovingAverageFilter(5);

  private applyLowPass = false;
  private applyMovingAverage = false;

  public theme: SpectrumTheme = DARK_THEME;

  public config = {
    fft_size: 2048 * 2,
    minFrequency: 0,
    maxFrequency: 5000,
  };

  /** 現在のフィルタ後スペクトル (0-255) */
  public getFilteredData() {
    return this.filtered;
  }

  public getMicrophoneAudioStream = async (
    canvasRef: React.RefObject<HTMLCanvasElement>
  ) => {
    this.canvas = canvasRef.current;
    const gen = ++this.generation;
    // ブラウザ標準のノイズ抑制/AGC/エコー除去は音程を歪めるので切る
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    if (gen !== this.generation) {
      // await 中に close() された
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    this.stream = stream;
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.source = this.audioContext.createMediaStreamSource(this.stream);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = this.config.fft_size;
    // 内蔵の時間平滑化を切る。切らないとフィルタ設定の効果が見えない
    this.analyser.smoothingTimeConstant = 0;
    const n = this.analyser.frequencyBinCount;
    this.rawData = new Uint8Array(n);
    this.filtered = new Float32Array(n);
    this.scratch = new Float32Array(n);
    this.denoised = new Float32Array(n);
    this.source.connect(this.analyser);

    this.loop();
  };

  public setLowPassCoefficient(coefficient: number) {
    this.lowPassFilter.setCoefficient(coefficient);
  }

  public toggleLowPassFilter(apply: boolean) {
    if (apply && !this.applyLowPass) this.lowPassFilter.reset();
    this.applyLowPass = apply;
  }

  public setMovingAverageWindowSize(windowSize: number) {
    this.movingAverageFilter.setWindowSize(windowSize);
  }

  public toggleMovingAverageFilter(apply: boolean) {
    if (apply && !this.applyMovingAverage) this.movingAverageFilter.reset();
    this.applyMovingAverage = apply;
  }

  public setNoiseGate(level: number) {
    this.noiseGate = Math.min(255, Math.max(0, Number.isFinite(level) ? level : 0));
  }

  /** 環境ノイズを ms 間平均してプロファイルにし、以後スペクトルから差し引く */
  public learnNoise(ms = 2000) {
    this.learning = {
      until: performance.now() + ms,
      sum: new Float32Array(this.rawData.length),
      count: 0,
    };
  }

  public clearNoise() {
    this.noiseProfile = null;
    this.learning = null;
  }

  public isLearning() {
    return this.learning !== null;
  }

  public hasNoiseProfile() {
    return this.noiseProfile !== null;
  }

  public setFrequencyRange(minFreq: number, maxFreq: number) {
    this.config.minFrequency = minFreq;
    this.config.maxFrequency = maxFreq;
  }

  /** 1フレーム分: 生データ取得 → LPF → 移動平均 → this.filtered */
  private processFrame() {
    if (!this.analyser) return;
    this.analyser.getByteFrequencyData(this.rawData);
    if (this.learning) {
      const L = this.learning;
      for (let i = 0; i < this.rawData.length; i++) L.sum[i] += this.rawData[i];
      L.count++;
      if (performance.now() >= L.until && L.count > 0) {
        this.noiseProfile = L.sum.map((v) => v / L.count);
        this.learning = null;
      }
    }
    let cur: ArrayLike<number> = this.rawData;
    if (this.noiseProfile && this.noiseProfile.length === this.rawData.length) {
      // スペクトル減算 (少し多めに引く)
      for (let i = 0; i < this.rawData.length; i++) {
        this.denoised[i] = Math.max(0, this.rawData[i] - this.noiseProfile[i] * 1.15);
      }
      cur = this.denoised;
    }
    if (this.applyLowPass) {
      this.lowPassFilter.apply(cur, this.scratch);
      cur = this.scratch;
    }
    if (this.applyMovingAverage) {
      this.movingAverageFilter.apply(cur, this.filtered);
    } else {
      for (let i = 0; i < cur.length; i++) this.filtered[i] = cur[i];
    }
  }

  private get binHz() {
    return this.audioContext && this.analyser
      ? this.audioContext.sampleRate / this.analyser.fftSize
      : 1;
  }

  private rangeIndices(): [number, number] {
    const n = this.filtered.length;
    const lo = Math.max(0, Math.floor(this.config.minFrequency / this.binHz));
    const hi = Math.min(n - 1, Math.ceil(this.config.maxFrequency / this.binHz));
    return [lo, hi];
  }

  private peakIndex(): number | null {
    const [lo, hi] = this.rangeIndices();
    let best = -Infinity;
    let idx: number | null = null;
    for (let i = lo; i <= hi; i++) {
      if (this.filtered[i] > best) {
        best = this.filtered[i];
        idx = i;
      }
    }
    return idx !== null && best >= this.noiseGate ? idx : null;
  }

  private sharpestIndex(): number | null {
    const [lo, hi] = this.rangeIndices();
    let best = -Infinity;
    let idx: number | null = null;
    for (let i = Math.max(1, lo); i <= hi; i++) {
      if (this.filtered[i] < this.noiseGate) continue;
      const d = this.filtered[i] - this.filtered[i - 1];
      if (d > best) {
        best = d;
        idx = i;
      }
    }
    return idx;
  }

  public *getMaxFrequencyGenerator(): Generator<number | null, void, unknown> {
    while (true) {
      const i = this.audioContext && this.analyser ? this.peakIndex() : null;
      yield i !== null ? i * this.binHz : null;
    }
  }

  public *getSharpestChangeGenerator(): Generator<
    { frequency: number | null; maxValue: number | null },
    void,
    unknown
  > {
    while (true) {
      const i =
        this.audioContext && this.analyser ? this.sharpestIndex() : null;
      yield i !== null
        ? {
            frequency: i * this.binHz,
            maxValue: this.filtered[i] - this.filtered[i - 1],
          }
        : { frequency: null, maxValue: null };
    }
  }

  private loop = () => {
    this.processFrame();
    if (this.canvas) this.draw(this.canvas);
    this.animationId = requestAnimationFrame(this.loop);
  };

  private draw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx || !this.audioContext) return;
    const t = this.theme;
    const W = canvas.width;
    const H = canvas.height;
    const padL = 36;
    const padB = 26;
    const plotW = W - padL - 8;
    const plotH = H - padB - 8;

    ctx.fillStyle = t.background;
    ctx.fillRect(0, 0, W, H);

    // 表示範囲 = 計測範囲 (0 は 1 ビン以上確保)
    const binHz = this.binHz;
    const fMin = Math.max(0, this.config.minFrequency);
    const fMax = Math.max(fMin + binHz * 4, this.config.maxFrequency);
    const n = this.filtered.length;
    const xOf = (f: number) => padL + ((f - fMin) / (fMax - fMin)) * plotW;
    const yOf = (v: number) => 8 + plotH - (v / 255) * plotH;

    // grid + labels
    ctx.font = "11px ui-monospace, monospace";
    ctx.fillStyle = t.text;
    ctx.strokeStyle = t.grid;
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    for (let i = 0; i <= 10; i++) {
      const f = fMin + ((fMax - fMin) * i) / 10;
      const x = Math.round(xOf(f)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 8);
      ctx.lineTo(x, 8 + plotH);
      ctx.stroke();
      const rpm = f * 10; // 1Hz = 10rpm (モーターの回転数 = 周波数 x 10)
      ctx.fillText(
        rpm >= 1000 ? (rpm / 1000).toFixed(rpm % 1000 ? 1 : 0) + "k" : rpm.toFixed(0),
        x,
        H - 8
      );
    }
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const y = Math.round(8 + (plotH * i) / 4) + 0.5;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.fillText(String(255 - Math.round((255 * i) / 4)), padL - 4, y + 4);
    }

    const iLo = Math.max(0, Math.floor(fMin / binHz));
    const iHi = Math.min(n - 1, Math.ceil(fMax / binHz));

    // raw (薄く) と filtered (濃く)
    const trace = (get: (i: number) => number, color: string, w: number) => {
      ctx.beginPath();
      for (let i = iLo; i <= iHi; i++) {
        const x = xOf(i * binHz);
        const y = yOf(get(i));
        if (i === iLo) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.lineJoin = "round";
      ctx.stroke();
    };
    trace((i) => this.rawData[i], t.raw, 1);
    const filterOn = this.applyLowPass || this.applyMovingAverage;
    // filtered の下を塗る
    ctx.beginPath();
    ctx.moveTo(xOf(iLo * binHz), yOf(0));
    for (let i = iLo; i <= iHi; i++) ctx.lineTo(xOf(i * binHz), yOf(this.filtered[i]));
    ctx.lineTo(xOf(iHi * binHz), yOf(0));
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 8, 0, 8 + plotH);
    grad.addColorStop(0, t.filtered + "55");
    grad.addColorStop(1, t.filtered + "00");
    ctx.fillStyle = grad;
    ctx.fill();
    trace((i) => this.filtered[i], t.filtered, filterOn ? 2 : 1.5);

    // ノイズゲート閾値
    if (this.noiseGate > 0) {
      const gy = yOf(this.noiseGate);
      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = t.text;
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(padL + plotW, gy);
      ctx.stroke();
      ctx.restore();
    }
    if (this.noiseProfile) {
      const prof = this.noiseProfile;
      trace((i) => prof[i], t.diff, 1);
    }

    // ピーク / 微分ピーク
    const marker = (idx: number | null, color: string, dash: number[]) => {
      if (idx === null) return;
      const x = xOf(idx * binHz);
      ctx.save();
      ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, 8);
      ctx.lineTo(x, 8 + plotH);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = color;
      ctx.textAlign = "left";
      ctx.fillText(`${Math.round(idx * binHz * 10).toLocaleString()} rpm`, x + 4, 20);
    };
    marker(this.peakIndex(), t.peak, []);
    marker(this.sharpestIndex(), t.diff, [4, 4]);

    // 凡例
    ctx.textAlign = "right";
    ctx.fillStyle = t.text;
    ctx.fillText(
      `${this.learning ? "LEARNING NOISE…  ·  " : this.noiseProfile ? "NOISE CUT  ·  " : ""}${filterOn ? "FILTERED" : "RAW"}  ·  RPM`,
      W - 12,
      20
    );
  }

  public close(): void {
    this.generation++;
    cancelAnimationFrame(this.animationId);
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.source?.disconnect();
    this.source = null;
    this.analyser = null;
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }
    this.audioContext = null;
  }
}
