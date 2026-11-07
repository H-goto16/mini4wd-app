import { ConfigType } from "@/types/config";
import { atomWithStorage } from "jotai/utils";

export const configState = atomWithStorage<ConfigType>("config", {
  tireDiameter: 23,
  gearRatio: 3.5,
  using_derivative: false,
  calcInterval: 50,
  viewMode: "both",
  noiseGate: 100,
  minFrequency: 300,
  maxFrequency: 5000,
  lowPassConfig: {
    cofficient: 0.3,
    isUse: true,
  },
  movingAverageConfig: {
    windowSize: 3,
    isUse: true,
  },
});
