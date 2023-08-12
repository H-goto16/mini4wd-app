import React, { useEffect, useRef, useState } from "react";

const SpectrumAnalyzer: React.FC = () => {
  const [audioBarWidth, setAudioBarWidth] = useState(50);
  const [audioBarHeight, setAudioBarHeight] = useState(50);
  const [maxFrequency, setMaxFrequency] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const startAudio = async () => {
      try {
        const audioContext = new AudioContext();
        const analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 1024;
        analyserRef.current = analyserNode;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const sourceNode = audioContext.createMediaStreamSource(stream);

        // Disconnect the sourceNode from the destination to prevent audio output
        sourceNode.disconnect();

        sourceNode.connect(analyserNode);

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

            const barWidth =
              (canvas!.width / bufferLength) * (audioBarWidth / 10);
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const barHeight =
                dataArrayRef.current![i] / (1 / (audioBarHeight / 10));
              canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
              canvasCtx.fillRect(
                x,
                canvas!.height - barHeight / 2,
                barWidth,
                barHeight
              );
              x += barWidth + 1;
            }

            let maxFrequency = 0;
            for (let i = 0; i < bufferLength; i++) {
              if (dataArrayRef.current![i] > maxFrequency) {
                maxFrequency = dataArrayRef.current![i];
                setMaxFrequency(maxFrequency);
              }
            }

            // Draw frequency markers
            canvasCtx.fillStyle = "#ffffff";
            canvasCtx.font = "12px Arial";

            const markerCount = 5; // Adjust this to set the number of markers
            const freqStep = bufferLength / markerCount;
            const freqMax = audioContext.sampleRate / 2;

            for (let i = 0; i < markerCount; i++) {
              const freq = (freqStep * i * freqMax) / bufferLength;
              const xPos = (canvas!.width / freqMax) * freq;
              canvasCtx.fillText(
                freq.toFixed(1) + " Hz",
                xPos,
                canvas!.height - 10
              );
            }
          };

          draw();
        }

        return () => {
          audioContext.close();
        };
      } catch (error) {
        console.error("Error setting up audio:", error);
      }
    };

    startAudio();
  }, [audioBarWidth, audioBarHeight]);

  const width = document.body.clientWidth;

  return (
    <div>
      <canvas ref={canvasRef} width={width} height={width / 2} />
      <p className="text-xl">バーの幅</p>
      <input
        type="range"
        onChange={(e) => setAudioBarWidth(Number(e.target.value))}
      />
      <p className="text-xl">高さ (dB)</p>
      <input
        type="range"
        min={0}
        max={100}
        value={audioBarHeight}
        onChange={(e) => setAudioBarHeight(Number(e.target.value))}
      />
      <p className="text-xl">{maxFrequency}</p>
    </div>
  );
};

export default SpectrumAnalyzer;
