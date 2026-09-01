"use client";

import { Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";

const QUOTE_KEYS: TranslationKey[] = [
  "awareness.q1",
  "awareness.q2",
  "awareness.q3",
  "awareness.q4",
  "awareness.q5",
];

const SLIDE_MS = 6000;

/** Rotating public-awareness messages, styled like a govt outreach banner. */
export function AwarenessCarousel() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % QUOTE_KEYS.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-gradient-to-r from-[#123a6b] to-[#1d5a9e] text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-12 text-center">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#FF9933]">
          <Quote className="h-4 w-4" aria-hidden />
          {t("awareness.heading")}
        </h2>
        <div className="relative mt-4 min-h-20 w-full">
          {QUOTE_KEYS.map((key, i) => (
            <p
              key={key}
              aria-hidden={i !== index}
              className="absolute inset-0 text-balance text-xl font-medium leading-relaxed transition-opacity duration-700 sm:text-2xl"
              style={{ opacity: i === index ? 1 : 0 }}
            >
              “{t(key)}”
            </p>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          {QUOTE_KEYS.map((key, i) => (
            <button
              key={key}
              type="button"
              aria-label={`${t("carousel.goToSlide")} ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-[#FF9933]" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
