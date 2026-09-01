"use client";

import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n/translations";

export function LanguageSwitcher({ variant = "solid" }: { variant?: "overlay" | "solid" }) {
  const { language, setLanguage, t } = useLanguage();
  const isOverlay = variant === "overlay";

  return (
    <label className="relative flex items-center text-sm">
      <span className="sr-only">{t("language.srLabel")}</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        // field-sizing-content keeps the select as wide as the SELECTED label;
        // without it the browser sizes it to the longest option in the list,
        // leaving a big gap between the visible text and the chevron.
        className={`appearance-none rounded-md bg-transparent py-1.5 pl-1 pr-5 text-sm field-sizing-content ${isOverlay ? "text-white" : "text-foreground"}`}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-black">
            {lang.label}
            {!lang.translated ? " (EN)" : ""}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className={`pointer-events-none absolute right-0 h-3.5 w-3.5 ${isOverlay ? "text-white" : "text-foreground/60"}`}
      />
    </label>
  );
}
