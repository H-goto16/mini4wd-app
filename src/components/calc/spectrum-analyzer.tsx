import React, { useEffect, useRef } from "react";

const SpectrumAnalyzer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const startAudio = async () => {
    try {
      const audioContext = new AudioContext();
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256; // FFTサイズ
      analyserRef.current = analyserNode;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sourceNode = audioContext.createMediaStreamSource(stream);

      sourceNode.connect(analyserNode);
      analyserNode.connect(audioContext.destination);

      const bufferLength = analyserNode.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      const canvasCtx = canvas?.getContext("2d");
      if (canvasCtx) {
        const draw = () => {
          requestAnimationFrame(draw);
          analyserNode.getByteFrequencyData(dataArrayRef.current!);
          canvasCtx.fillStyle = "rgb(0, 0, 0)";
          canvasCtx.fillRect(0, 0, canvas!.width, canvas!.height);

          const barWidth = (canvas!.width / bufferLength) * 2.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArrayRef.current![i] / 2;
            canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
            canvasCtx.fillRect(
              x,
              canvas!.height - barHeight / 2,
              barWidth,
              barHeight
            );
            x += barWidth + 1;
          }
        };

        draw();
      }
    } catch (error) {
      console.error("Error setting up audio:", error);
    }
  };

  return (
    <div>
      <button onClick={startAudio}>Start Audio</button>
      <canvas ref={canvasRef} width={400} height={200} />
    </div>
  );
};

export default SpectrumAnalyzer;
