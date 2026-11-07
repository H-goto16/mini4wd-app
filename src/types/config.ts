export type ConfigType = {
  gearRatio: number;
  tireDiameter: number;
  using_derivative: boolean;
  calcInterval: number;
  viewMode: "tachometer" | "graph" | "both";
  /** この振幅 (0-255) 未満は無音扱い */
  noiseGate: number;
  minFrequency: number;
  maxFrequency: number;
  lowPassConfig: {
    cofficient: number;
    isUse: boolean;
  };
  movingAverageConfig: {
    windowSize: number;
    isUse: boolean;
  };
};
