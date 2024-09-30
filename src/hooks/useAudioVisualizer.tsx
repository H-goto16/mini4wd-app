import { configState } from "@/jotai/configState";
import { AudioAnalyzer } from "@/utils/spectrumAnalize";
import { useAtom } from "jotai";
import { useRef, useEffect, useMemo } from "react";

const useAudioVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioAnalyzer = useMemo(() => new AudioAnalyzer(), []);
  const [config, setConfig] = useAtom(configState);

  useEffect(() => {
    audioAnalyzer.config.minFrequency = config.minFrequency;
    audioAnalyzer.config.maxFrequency = config.maxFrequency;
    audioAnalyzer.config.lowPassCoefficient = config.lowPassConfig.cofficient;
    audioAnalyzer.toggleLowPassFilter(config.lowPassConfig.isUse);
    audioAnalyzer.toggleMovingAverageFilter(config.movingAverageConfig.isUse);
    audioAnalyzer.config.movingAverageWindowSize =
      config.movingAverageConfig.windowSize;

    audioAnalyzer.getMicrophoneAudioStream(canvasRef);
    return () => {
      audioAnalyzer.close();
    };
  }, [
    audioAnalyzer,
    config.minFrequency,
    config.maxFrequency,
    config.lowPassConfig,
    config.movingAverageConfig,
  ]);

  return { canvasRef, audioAnalyzer, config, setConfig };
};

export default useAudioVisualizer;
