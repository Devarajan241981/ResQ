"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <label className="flex items-center gap-1 text-sm">
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
            {!lang.translated ? " (EN)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
