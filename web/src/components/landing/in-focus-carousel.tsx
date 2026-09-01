"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { PHOTOS } from "@/lib/media/stock-photos";

// Deliberately uses images distinct from the ModulesShowcase cards above so the
// homepage never shows the same photo twice.
const SLIDES = [
  {
    photo: PHOTOS.reliefTeam,
    titleKey: "carousel.slide1Title",
    descKey: "carousel.slide1Desc",
    href: "/missing-persons/new",
    ctaKey: "carousel.slide1Cta",
  },
  {
    photo: PHOTOS.ambulance,
    titleKey: "carousel.slide2Title",
    descKey: "carousel.slide2Desc",
    href: "/sos",
    ctaKey: "carousel.slide2Cta",
  },
  {
    photo: PHOTOS.hospitals,
    titleKey: "carousel.slide3Title",
    descKey: "carousel.slide3Desc",
    href: "/blood-donation",
    ctaKey: "carousel.slide3Cta",
  },
  {
    photo: PHOTOS.shelters,
    titleKey: "carousel.slide4Title",
    descKey: "carousel.slide4Desc",
    href: "/disaster-mode",
    ctaKey: "carousel.slide4Cta",
  },
] satisfies { photo: string; titleKey: TranslationKey; descKey: TranslationKey; href: string; ctaKey: TranslationKey }[];

const AUTO_ADVANCE_MS = 6000;

export function InFocusCarousel() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  return (
    <section aria-label={t("carousel.sectionLabel")} className="mx-auto w-full max-w-6xl px-4 py-16">
      <h2 className="text-center text-3xl font-bold tracking-tight">{t("carousel.heading")}</h2>

      <div className="relative mt-8 overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          <Image
            key={slide.photo}
            src={slide.photo}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 1152px"
            className="object-cover transition-opacity duration-500"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
            <h3 className="max-w-xl text-xl font-bold sm:text-3xl">{t(slide.titleKey)}</h3>
            <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">{t(slide.descKey)}</p>
            <Link
              href={slide.href}
              className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              {t(slide.ctaKey)}
            </Link>
          </div>
        </div>

        <button
          type="button"
          aria-label={t("carousel.prev")}
          onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={t("carousel.next")}
          onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.titleKey}
              type="button"
              aria-label={`${t("carousel.goToSlide")} ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
