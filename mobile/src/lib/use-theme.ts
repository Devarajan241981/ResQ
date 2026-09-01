import { useColorScheme } from "react-native";
import { DARK, LIGHT, type Palette } from "./theme";

export function usePalette(): Palette {
  return useColorScheme() === "dark" ? DARK : LIGHT;
}
