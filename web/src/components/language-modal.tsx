"use client";

import { Check, Globe, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n/translations";

/** Full-grid language picker (govt-portal style) — replaces the plain dropdown
 * with a modal showing every language as a selectable card. */
export function LanguageModal({ variant = "solid" }: { variant?: "overlay" | "solid" }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const triggerClass =
    variant === "overlay"
      ? "text-white hover:bg-white/10"
      : "text-foreground hover:bg-surface";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("language.chooseTitle")}
        title={t("language.chooseTitle")}
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm ${triggerClass}`}
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.label.split(" ")[0]}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/50"
          />
          <div role="dialog" aria-label={t("language.chooseTitle")} className="relative w-full max-w-2xl rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Globe className="h-5 w-5 text-[color:var(--brand)]" aria-hidden />
                {t("language.chooseTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("a11y.close")}
                className="rounded-full p-1.5 text-foreground/60 hover:bg-surface"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SUPPORTED_LANGUAGES.map((l) => {
                const active = l.code === language;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code as LanguageCode);
                      setOpen(false);
                    }}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      active
                        ? "border-[var(--brand)] bg-[color:var(--brand)]/10 text-[color:var(--brand)]"
                        : "border-border hover:bg-surface"
                    }`}
                  >
                    <span className="truncate">{l.label}</span>
                    {active && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
