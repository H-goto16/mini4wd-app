import { ConfigType } from "@/types/config";
import { atomWithStorage } from "jotai/utils";

export const configState = atomWithStorage<ConfigType>("config", {
  tireDiameter: 23,
  gearRatio: 3.5,
  using_derivative: false,
  calcInterval: 250,
  viewMode: "tachometer",
  minFrequency: 0,
  maxFrequency: 5000,
  lowPassConfig: {
    cofficient: 0.25,
    isUse: false,
  },
  movingAverageConfig: {
    windowSize: 5,
    isUse: false,
  },
});
