/** ResQ Bharath brand palette — mirrors the web app (saffron / navy / green + emergency red). */
export const RESQ = {
  saffron: "#FF9933",
  navy: "#123A6B",
  green: "#138808",
  red: "#DC2626",
  indigo: "#4F46E5",
} as const;

export interface Palette {
  background: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
}

export const LIGHT: Palette = {
  background: "#F5F6F8",
  surface: "#EEF0F3",
  card: "#FFFFFF",
  border: "#E3E6EA",
  text: "#171717",
  textMuted: "#5B6472",
  primary: RESQ.navy,
  onPrimary: "#FFFFFF",
};

export const DARK: Palette = {
  background: "#0B0F16",
  surface: "#141A24",
  card: "#161C27",
  border: "#26303E",
  text: "#ECEDEE",
  textMuted: "#9AA4B2",
  primary: "#3B82F6",
  onPrimary: "#0B0F16",
};

export function statusColor(status: string): string {
  switch (status) {
    case "found":
    case "fulfilled":
    case "resolved":
      return RESQ.green;
    case "critical":
    case "missing":
    case "active":
      return RESQ.red;
    case "urgent":
    case "verified":
      return RESQ.saffron;
    default:
      return RESQ.navy;
  }
}
