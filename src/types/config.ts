export type ConfigType = {
  gearRatio: number;
  tireDiameter: number;
  using_derivative: boolean;
  calcInterval: number;
  viewMode: "tachometer" | "graph";
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
