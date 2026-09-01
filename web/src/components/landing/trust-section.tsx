"use client";

import { Lock, ShieldCheck, UserCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";

const PRINCIPLES = [
  { icon: ShieldCheck, titleKey: "trust.principle1Title", descKey: "trust.principle1Desc" },
  { icon: Lock, titleKey: "trust.principle2Title", descKey: "trust.principle2Desc" },
  { icon: UserCheck, titleKey: "trust.principle3Title", descKey: "trust.principle3Desc" },
] satisfies { icon: typeof ShieldCheck; titleKey: TranslationKey; descKey: TranslationKey }[];

export function TrustSection() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">{t("trust.heading")}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-foreground/70">{t("trust.subheading")}</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <div key={p.titleKey} className="rounded-xl border border-border p-6">
            <p.icon className="h-6 w-6" aria-hidden />
            <h3 className="mt-4 font-semibold">{t(p.titleKey)}</h3>
            <p className="mt-2 text-sm text-foreground/70">{t(p.descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
