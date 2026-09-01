"use client";

import { BellRing, CircleCheck, ScanSearch, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";

const STEPS = [
  { icon: ScanSearch, titleKey: "howItWorks.step1Title", descKey: "howItWorks.step1Desc" },
  { icon: BellRing, titleKey: "howItWorks.step2Title", descKey: "howItWorks.step2Desc" },
  { icon: Users, titleKey: "howItWorks.step3Title", descKey: "howItWorks.step3Desc" },
  { icon: CircleCheck, titleKey: "howItWorks.step4Title", descKey: "howItWorks.step4Desc" },
] satisfies { icon: typeof ScanSearch; titleKey: TranslationKey; descKey: TranslationKey }[];

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section className="border-y border-border bg-surface/50">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">{t("howItWorks.heading")}</h2>

        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.titleKey} className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <step.icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="text-sm font-medium text-foreground/40">
                  {t("howItWorks.stepLabel")} {i + 1}
                </span>
              </div>
              <h3 className="mt-3 font-semibold">{t(step.titleKey)}</h3>
              <p className="mt-1 text-sm text-foreground/70">{t(step.descKey)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
