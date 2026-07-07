"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type LanguageCode, type TranslationKey, translate } from "./translations";

const STORAGE_KEY = "resq.language";
const DEFAULT_LANGUAGE: LanguageCode = "en";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    // Post-mount sync for the same reason as ThemeProvider: localStorage
    // isn't available during SSR, so the default language renders first and
    // is corrected after mount rather than mismatching server-rendered HTML.
    const stored = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setLanguageState(stored);
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => translate(language, key),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
