"use client";

import { useTheme } from "@/lib/theme/theme-context";
import { useLanguage } from "@/lib/i18n/language-context";

export function ThemeToggle({ variant = "solid" }: { variant?: "overlay" | "solid" }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")}
      className={`rounded-md px-2 py-1.5 text-sm ${
        variant === "overlay" ? "text-white hover:bg-white/10" : "hover:bg-surface"
      }`}
    >
      {theme === "dark" ? t("theme.light") : t("theme.dark")}
    </button>
  );
}
