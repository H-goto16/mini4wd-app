import { AudioAnalyzer } from "@/utils/spectrumAnalize";
import { config } from "process";
import { useRef, useEffect, useState } from "react";

const useAudioVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioAnalyzer = new AudioAnalyzer();

  useEffect(() => {
    audioAnalyzer.getMicrophoneAudioStream(canvasRef);
    return () => {
      audioAnalyzer.close();
    };
  }, []);

  return { canvasRef, audioAnalyzer };
};

export default useAudioVisualizer;
