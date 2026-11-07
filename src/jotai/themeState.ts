import { atomWithStorage } from "jotai/utils";

export type ThemeMode = "dark" | "light";

export const themeState = atomWithStorage<ThemeMode>("theme", "dark");
