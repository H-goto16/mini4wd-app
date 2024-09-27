export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private dataArray: Uint8Array = new Uint8Array(0);
  private animationId: number = 0;

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

  public *getMaxFrequencyGenerator(): Generator<number | null, void, unknown> {
    while (true) {
      if (this.audioContext && this.analyser) {
        this.analyser.getByteFrequencyData(this.dataArray);
        const maxIndex = this.getMaxFrequencyIndex(this.dataArray);
        const maxFrequency =
          (maxIndex * this.audioContext.sampleRate) / this.analyser.fftSize;
        yield maxFrequency;
      } else {
        yield null;
      }
    }
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

  private renderFrame(canvas: HTMLCanvasElement, bufferLength: number) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.dataArray);
      this.drawFrequencyData(
        canvas,
        this.dataArray,
        bufferLength,
        this.audioContext!.sampleRate
      );
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
