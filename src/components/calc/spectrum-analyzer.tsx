import useAudioVisualizer from "@/hooks/useAudioVisualizer";
import { useState } from "react";

const MicrophoneFrequencyVisualizer: React.FC = () => {
  const [maxFrequency, setMaxFrequency] = useState<number>(0);
  const { canvasRef, frequencyGen } = useAudioVisualizer();

  const displayFrequencies = async () => {
    for (const freq of frequencyGen as any) {
      if (freq) {
        setMaxFrequency(freq);
      }
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100msごとに取得
    }
  };
  displayFrequencies();
  return (
    <>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={window.innerWidth - 20}
          height={window.innerHeight / 2}
        />
      </div>
      <div className="text-center mt-8">Max Freq : {maxFrequency}Hz</div>
      <div className="text-center">RPM : {maxFrequency * 10}rpm</div>
    </>
  );
};

export default MicrophoneFrequencyVisualizer;
