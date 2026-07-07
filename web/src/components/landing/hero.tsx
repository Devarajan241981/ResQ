"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { PHOTOS } from "@/lib/media/stock-photos";

export function Hero() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
      <Image
        src={PHOTOS.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-black/65" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/50" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-20 text-center text-white">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">{t("home.title")}</h1>
        <p className="mt-6 max-w-2xl text-balance text-lg text-white/85 sm:text-xl">{t("home.subtitle")}</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/sos"
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-colors hover:bg-red-700"
            >
              <ShieldAlert className="h-5 w-5" aria-hidden />
              Go to SOS
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-white px-7 py-3.5 text-base font-semibold text-black shadow-lg transition-opacity hover:opacity-90"
            >
              Get started — it&apos;s free
            </Link>
          )}
          <Link
            href="/missing-persons"
            className="rounded-md border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20"
          >
            Browse missing persons
          </Link>
        </div>

        <dl className="mt-16 grid w-full max-w-2xl grid-cols-2 gap-6 border-t border-white/20 pt-8 sm:grid-cols-4">
          {[
            ["24/7", "Emergency response"],
            ["12", "Community modules"],
            ["10", "Indian languages"],
            ["100%", "Community-powered"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="text-2xl font-bold sm:text-3xl">{value}</dd>
              <p className="mt-1 text-xs text-white/70 sm:text-sm">{label}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
