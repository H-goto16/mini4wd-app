import { AudioAnalyzer } from "@/utils/spectrumAnalize";
import { useRef, useEffect } from "react";

const useAudioVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioAnalyzer = new AudioAnalyzer();

  useEffect(() => {
    audioAnalyzer.getMicrophoneAudioStream(canvasRef);
    return () => {
      audioAnalyzer.close();
    };
  }, []);

  return { canvasRef };
};

export default useAudioVisualizer;
