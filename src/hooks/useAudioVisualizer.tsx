import { configState } from "@/jotai/configState";
import { themeState } from "@/jotai/themeState";
import { AudioAnalyzer, DARK_THEME, LIGHT_THEME } from "@/utils/spectrumAnalize";
import { useAtom, useAtomValue } from "jotai";
import { useRef, useEffect, useMemo } from "react";

const useAudioVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioAnalyzer = useMemo(() => new AudioAnalyzer(), []);
  const [config, setConfig] = useAtom(configState);
  const mode = useAtomValue(themeState);

  // 設定はストリームを再起動せずライブ反映する
  useEffect(() => {
    audioAnalyzer.setFrequencyRange(config.minFrequency, config.maxFrequency);
    audioAnalyzer.setNoiseGate(config.noiseGate ?? 100);
    audioAnalyzer.setLowPassCoefficient(config.lowPassConfig.cofficient);
    audioAnalyzer.toggleLowPassFilter(config.lowPassConfig.isUse);
    audioAnalyzer.setMovingAverageWindowSize(config.movingAverageConfig.windowSize);
    audioAnalyzer.toggleMovingAverageFilter(config.movingAverageConfig.isUse);
  }, [audioAnalyzer, config]);

  useEffect(() => {
    audioAnalyzer.theme = mode === "dark" ? DARK_THEME : LIGHT_THEME;
  }, [audioAnalyzer, mode]);

  useEffect(() => {
    audioAnalyzer.getMicrophoneAudioStream(canvasRef).catch(console.error);
    return () => audioAnalyzer.close();
  }, [audioAnalyzer]);

  return { canvasRef, audioAnalyzer, config, setConfig };
};

export default useAudioVisualizer;
