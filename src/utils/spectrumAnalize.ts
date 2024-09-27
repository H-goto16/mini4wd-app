export class MovingAverageFilter {
  private windowSize: number;
  private window: number[] = [];

  constructor(windowSize: number) {
    this.windowSize = windowSize;
  }

  public apply(inputValue: number): number {
    this.window.push(inputValue);

    if (this.window.length > this.windowSize) {
      this.window.shift();
    }

    const sum = this.window.reduce((acc, val) => acc + val, 0);
    return sum / this.window.length;
  }

  public setWindowSize(windowSize: number) {
    this.windowSize = windowSize;
    this.window = [];
  }
}

export class LowPassFilter {
  private alpha: number;
  private previousValue: number;

  constructor(alpha: number) {
    this.alpha = alpha;
    this.previousValue = 0;
  }

  public apply(inputValue: number): number {
    const filteredValue =
      this.alpha * inputValue + (1 - this.alpha) * this.previousValue;
    this.previousValue = filteredValue;
    return filteredValue;
  }
  public setCoefficient(coefficient: number) {
    this.alpha = coefficient;
  }
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private dataArray: Uint8Array = new Uint8Array(0);
  private animationId: number = 0;

  private lowPassFilter: LowPassFilter;
  private movingAverageFilter: MovingAverageFilter;

  private applyLowPass: boolean = true;
  private applyMovingAverage: boolean = true;

  public config = {
    fft_size: 2048 * 2,
    sample_rate: 44100 * 2,
    canvas: {
      background_color: "white",
      line_color: "black",
      font: "10px Arial",
      font_color: "black",
      max_line_color: "red",
    },
  };

  constructor() {
    this.lowPassFilter = new LowPassFilter(0.1);
    this.movingAverageFilter = new MovingAverageFilter(5);
  }

  public getMicrophoneAudioStream = async (
    canvasRef: React.RefObject<HTMLCanvasElement>
  ) => {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.source = this.audioContext.createMediaStreamSource(this.stream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fft_size;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      this.source.connect(this.analyser);

      const canvas = canvasRef.current!;
      this.renderFrame(canvas, bufferLength);
    } catch (err) {
      throw "マイクの使用許可がありません";
    }
  };

  public setLowPassCoefficient(coefficient: number) {
    this.lowPassFilter.setCoefficient(coefficient);
  }

  public toggleLowPassFilter(apply: boolean) {
    this.applyLowPass = apply;
  }

  public setMovingAverageWindowSize(windowSize: number) {
    this.movingAverageFilter.setWindowSize(windowSize);
  }

  public toggleMovingAverageFilter(apply: boolean) {
    this.applyMovingAverage = apply;
  }

  public *getMaxFrequencyGenerator(): Generator<number | null, void, unknown> {
    while (true) {
      if (this.audioContext && this.analyser) {
        this.analyser.getByteFrequencyData(this.dataArray);

        const filteredDataArray = this.applyFilters(this.dataArray);

        const maxIndex = this.getMaxFrequencyIndex(filteredDataArray);
        const maxFrequency =
          (maxIndex * this.audioContext.sampleRate) / this.analyser.fftSize;
        yield maxFrequency;
      } else {
        yield null;
      }
    }
  }

  private applyFilters(dataArray: Uint8Array): Uint8Array {
    const filteredArray = new Uint8Array(dataArray.length);
    for (let i = 0; i < dataArray.length; i++) {
      let value = dataArray[i];

      if (this.applyLowPass) {
        value = this.lowPassFilter.apply(value);
      }

      if (this.applyMovingAverage) {
        value = this.movingAverageFilter.apply(value);
      }

      filteredArray[i] = value;
    }
    return filteredArray;
  }

  private getMaxFrequencyIndex = (dataArray: Uint8Array): number => {
    let maxVal = -Infinity;
    let maxIndex = 0;

    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxVal) {
        maxVal = dataArray[i];
        maxIndex = i;
      }
    }

    return maxIndex;
  };

  public *getSharpestChangeGenerator(): Generator<
    { frequency: number | null; maxValue: number | null },
    void,
    unknown
  > {
    while (true) {
      if (this.audioContext && this.analyser) {
        this.analyser.getByteFrequencyData(this.dataArray);
        const derivatives = this.calculateDerivative(this.dataArray);
        const sharpestChangeIndex = this.getSharpestChangeIndex(derivatives);

        let frequency: number | null = null;
        let maxValue: number | null = null;

        if (sharpestChangeIndex !== null) {
          frequency =
            (sharpestChangeIndex * this.audioContext.sampleRate) /
            this.analyser.fftSize;
          maxValue = Math.abs(derivatives[sharpestChangeIndex]);
        }

        yield { frequency, maxValue };
      } else {
        yield { frequency: null, maxValue: null };
      }
    }
  }

  private calculateDerivative(dataArray: Uint8Array): number[] {
    const derivatives = [];
    for (let i = 1; i < dataArray.length; i++) {
      const currentValue = dataArray[i];
      const previousValue = dataArray[i - 1];
      const derivative = currentValue - previousValue;
      derivatives.push(derivative);
    }
    return derivatives;
  }

  private getSharpestChangeIndex(derivatives: number[]): number | null {
    let maxIndex: number | null = null;
    let maxValue = -Infinity;

    for (let i = 0; i < derivatives.length; i++) {
      if (Math.abs(derivatives[i]) > maxValue) {
        maxValue = Math.abs(derivatives[i]);
        maxIndex = i;
      }
    }

    return maxIndex;
  }

  private renderFrame(canvas: HTMLCanvasElement, bufferLength: number) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.dataArray);
      const derivatives = this.calculateDerivative(this.dataArray);
      const sharpestChangeIndex = this.getSharpestChangeIndex(derivatives);

      this.drawFrequencyData(
        canvas,
        this.dataArray,
        bufferLength,
        this.audioContext!.sampleRate
      );

      const canvasCtx = canvas.getContext("2d");
      if (canvasCtx && sharpestChangeIndex !== null) {
        const sliceWidth = canvas.width / bufferLength;
        const sharpX = sharpestChangeIndex * sliceWidth;

        canvasCtx.strokeStyle = "blue";
        canvasCtx.lineWidth = 2;
        canvasCtx.beginPath();
        canvasCtx.moveTo(sharpX, 0);
        canvasCtx.lineTo(sharpX, canvas.height);
        canvasCtx.stroke();
      }
    }
    this.animationId = requestAnimationFrame(() =>
      this.renderFrame(canvas, bufferLength)
    );
  }

  private drawFrequencyData = (
    canvas: HTMLCanvasElement,
    dataArray: Uint8Array,
    bufferLength: number,
    sampleRate: number
  ) => {
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.fillStyle = this.config.canvas.background_color;
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = this.config.canvas.line_color;
    canvasCtx.beginPath();

    const sliceWidth = WIDTH / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255.0;
      const y = HEIGHT - value * HEIGHT;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.stroke();

    canvasCtx.fillStyle = this.config.canvas.font_color;
    canvasCtx.font = this.config.canvas.font;
    canvasCtx.fillText("Frequency (Hz)", WIDTH - 100, HEIGHT - 10);
    canvasCtx.save();
    canvasCtx.translate(10, HEIGHT / 2);
    canvasCtx.rotate(-Math.PI / 2);
    canvasCtx.fillText("Amplitude (dB)", 0, 0);
    canvasCtx.restore();

    const nyquist = sampleRate / 2;
    for (let i = 0; i <= 10; i++) {
      const frequency = (i * nyquist) / 10;
      const labelX = (i * WIDTH) / 10;
      canvasCtx.fillText(frequency.toFixed(0) + "Hz", labelX, HEIGHT - 20);
    }

    const maxIndex = this.getMaxFrequencyIndex(dataArray);
    const maxX = maxIndex * sliceWidth;

    canvasCtx.strokeStyle = this.config.canvas.max_line_color || "red";
    canvasCtx.lineWidth = 2;
    canvasCtx.beginPath();
    canvasCtx.moveTo(maxX, 0);
    canvasCtx.lineTo(maxX, HEIGHT);
    canvasCtx.stroke();

    const maxFrequency = (maxIndex * sampleRate) / this.config.fft_size;
    canvasCtx.fillStyle = "red";
    canvasCtx.fillText(`Max Freq: ${maxFrequency.toFixed(2)} Hz`, maxX, 20);
  };

  public close(): void {
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    cancelAnimationFrame(this.animationId);
  }
}
