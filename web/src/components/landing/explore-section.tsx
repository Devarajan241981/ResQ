"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Droplet, Megaphone, Search, Users, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";
import type { GalleryImage, PaginatedResponse } from "@/lib/api/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import { PHOTOS } from "@/lib/media/stock-photos";

interface Slide {
  src: string;
  caption: string;
}

// Shown until the gallery loads (and as a fallback if it's empty).
const FALLBACK: { src: string; captionKey: TranslationKey }[] = [
  { src: PHOTOS.volunteers, captionKey: "explore.cap.volunteers" },
  { src: PHOTOS.reliefTeam, captionKey: "explore.cap.relief" },
  { src: PHOTOS.festival, captionKey: "explore.cap.community" },
];

const TILES: { icon: LucideIcon; labelKey: TranslationKey; href: string }[] = [
  { icon: Users, labelKey: "explore.tile.volunteer", href: "/community" },
  { icon: Droplet, labelKey: "explore.tile.donate", href: "/blood-donation" },
  { icon: Search, labelKey: "explore.tile.report", href: "/missing-persons/new" },
  { icon: Megaphone, labelKey: "explore.tile.awareness", href: "/campaigns" },
];

export function ExploreSection() {
  const { t } = useLanguage();
  const [slides, setSlides] = useState<Slide[]>(() => FALLBACK.map((f) => ({ src: f.src, caption: t(f.captionKey) })));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    apiFetch<PaginatedResponse<GalleryImage>>("/gallery/images/")
      .then((d) => {
        const withCaption = d.results.filter((g) => g.image);
        if (withCaption.length > 0) {
          setSlides(withCaption.slice(0, 6).map((g) => ({ src: g.image, caption: g.caption || t("explore.cap.community") })));
        }
      })
      .catch(() => {});
  }, [t]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length);
  const current = slides[index] ?? slides[0];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">{t("explore.heading")}</h2>
        <span aria-hidden className="mx-auto mt-3 block h-1 w-16 rounded bg-[color:var(--brand)]" />
        <p className="mx-auto mt-3 max-w-2xl text-foreground/70">{t("explore.subheading")}</p>
      </div>

      <div className="mt-10 grid items-stretch gap-4 overflow-hidden rounded-2xl bg-[color:var(--brand)] p-4 lg:grid-cols-2">
        {/* Image carousel */}
        <div className="relative aspect-[16/11] overflow-hidden rounded-xl">
          {current && (
            <Image src={current.src} alt="" fill sizes="(max-width:1024px) 100vw, 600px" className="object-cover" />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-sm font-medium text-white/80">{t("explore.slidesLabel")}</p>
            <p className="text-lg font-bold text-white">{current?.caption}</p>
          </div>
          {slides.length > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label={t("common.back")} className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow hover:bg-white">
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={t("common.next")} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow hover:bg-white">
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                {slides.map((s, i) => (
                  <span key={s.src + i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action tiles */}
        <div className="flex flex-col">
          <div className="grid flex-1 grid-cols-2 gap-4">
            {TILES.map((tile) => (
              <Link
                key={tile.labelKey}
                href={tile.href}
                className="group flex flex-col items-center justify-center gap-3 rounded-xl bg-white/95 p-6 text-center text-[color:var(--brand)] shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <tile.icon className="h-9 w-9" aria-hidden />
                <span className="font-bold">{t(tile.labelKey)}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/community" className="inline-block rounded-full bg-white px-6 py-2 font-semibold text-[color:var(--brand)] hover:bg-white/90">
              {t("explore.exploreAll")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
