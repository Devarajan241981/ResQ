"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { PHOTOS } from "@/lib/media/stock-photos";

const TIMELINE: { titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { titleKey: "authShell.step1Title", descKey: "authShell.step1Desc" },
  { titleKey: "authShell.step2Title", descKey: "authShell.step2Desc" },
  { titleKey: "authShell.step3Title", descKey: "authShell.step3Desc" },
  { titleKey: "authShell.step4Title", descKey: "authShell.step4Desc" },
];

export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();

  return (
    <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className="relative hidden overflow-hidden rounded-2xl lg:block">
        <div className="relative aspect-[4/5]">
          <Image
            src={PHOTOS.volunteers}
            alt=""
            fill
            sizes="(max-width: 1024px) 0px, 40vw"
            className="object-cover"
            priority
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <h2 className="text-2xl font-bold">{t("authShell.welcomeHeading")}</h2>
          <p className="mt-2 text-sm text-white/80">{t("authShell.welcomeSubheading")}</p>

          <ol className="mt-6 flex flex-col gap-4">
            {TIMELINE.map((step, i) => (
              <li key={step.titleKey} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                    {i + 1}
                  </span>
                  {i < TIMELINE.length - 1 && <span aria-hidden className="mt-1 h-full w-px flex-1 bg-white/30" />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold">{t(step.titleKey)}</p>
                  <p className="text-xs text-white/70">{t(step.descKey)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
