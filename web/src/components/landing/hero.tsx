"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { HERO_SLIDES } from "@/lib/media/stock-photos";
import { HeroSearch } from "./hero-search";

const SLIDE_MS = 5000;

export function Hero() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSlide((i) => (i + 1) % HERO_SLIDES.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-[88vh] items-end justify-center overflow-hidden">
      {HERO_SLIDES.map((src, i) => (
        <div
          key={src}
          aria-hidden={i !== slide}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === slide ? 1 : 0 }}
        >
          <Image src={src} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
        </div>
      ))}
      <div aria-hidden className="absolute inset-0 bg-black/25" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-24 pt-24 text-center text-white">
        <h1 className="font-brand text-5xl font-extrabold tracking-tight drop-shadow-lg sm:text-7xl">{t("home.title")}</h1>
        <p className="mt-3 text-base font-medium text-white/90 drop-shadow sm:text-lg">{t("hero.tagline")}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/sos"
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-colors hover:bg-red-700"
            >
              <ShieldAlert className="h-5 w-5" aria-hidden />
              {t("hero.goToSos")}
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-colors hover:bg-[#e8892e]"
            >
              {t("hero.getStarted")}
            </Link>
          )}
          <Link
            href="/missing-persons"
            className="rounded-md border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20"
          >
            {t("hero.browseMissing")}
          </Link>
        </div>

        {/* Big search bar, sitting low in the hero so it reads right into the stats strip below */}
        <div className="mt-10 flex w-full justify-center">
          <HeroSearch />
        </div>
      </div>
    </section>
  );
}
