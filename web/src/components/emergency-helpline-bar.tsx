"use client";

import { Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";

// Official Indian emergency helplines — genuinely useful and gives the govt-portal feel.
const LINES: { num: string; key: TranslationKey }[] = [
  { num: "112", key: "helpline.emergency" },
  { num: "108", key: "helpline.ambulance" },
  { num: "101", key: "helpline.fire" },
  { num: "100", key: "helpline.police" },
  { num: "1098", key: "helpline.child" },
  { num: "1091", key: "helpline.women" },
  { num: "1078", key: "helpline.disaster" },
];

export function EmergencyHelplineBar() {
  const { t } = useLanguage();
  // Duplicate so the CSS marquee loops seamlessly.
  const looped = [...LINES, ...LINES];

  return (
    <div className="flex h-8 items-stretch overflow-hidden bg-[#0f2f56] text-xs text-white">
      <span className="z-10 flex shrink-0 items-center gap-1.5 bg-[#FF9933] px-3 font-bold uppercase tracking-wide">
        <Phone className="h-3 w-3" aria-hidden />
        <span className="hidden sm:inline">{t("helpline.label")}</span>
      </span>
      <div className="group flex min-w-0 flex-1 items-center whitespace-nowrap">
        <div className="flex shrink-0 animate-[marquee_40s_linear_infinite] gap-8 pl-4 group-hover:[animation-play-state:paused]">
          {looped.map((l, i) => (
            <a key={`${l.num}-${i}`} href={`tel:${l.num}`} className="inline-flex items-center gap-1.5 hover:text-[#FF9933]">
              <span className="font-bold">{l.num}</span>
              <span className="text-white/70">{t(l.key)}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
