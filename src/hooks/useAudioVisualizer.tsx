import { AudioAnalyzer } from "@/utils/spectrumAnalize";
import { useRef, useEffect, useState } from "react";

const useAudioVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioAnalyzer = new AudioAnalyzer();

  const frequencyGen = audioAnalyzer.getMaxFrequencyGenerator();

  useEffect(() => {
    audioAnalyzer.getMicrophoneAudioStream(canvasRef);
    return () => {
      audioAnalyzer.close();
    };
  }, []);

  return { canvasRef, frequencyGen, audioAnalyzer };
};

export default useAudioVisualizer;
