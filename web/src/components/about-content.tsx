"use client";

import Link from "next/link";
import { HandHeart, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function AboutContent() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("about.heading")}</h1>
      <p className="mt-4 text-lg text-foreground/70">{t("about.intro")}</p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">{t("about.problemHeading")}</h2>
        <p className="mt-3 text-foreground/70">{t("about.problem1")}</p>
        <p className="mt-3 text-foreground/70">{t("about.problem2")}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">{t("about.believeHeading")}</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div className="flex gap-3">
            <ShieldCheck className="h-6 w-6 shrink-0 text-foreground/70" aria-hidden />
            <div>
              <h3 className="font-medium">{t("about.principle1Title")}</h3>
              <p className="mt-1 text-sm text-foreground/70">{t("about.principle1Desc")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Heart className="h-6 w-6 shrink-0 text-foreground/70" aria-hidden />
            <div>
              <h3 className="font-medium">{t("about.principle2Title")}</h3>
              <p className="mt-1 text-sm text-foreground/70">{t("about.principle2Desc")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <HandHeart className="h-6 w-6 shrink-0 text-foreground/70" aria-hidden />
            <div>
              <h3 className="font-medium">{t("about.principle3Title")}</h3>
              <p className="mt-1 text-sm text-foreground/70">{t("about.principle3Desc")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Sparkles className="h-6 w-6 shrink-0 text-foreground/70" aria-hidden />
            <div>
              <h3 className="font-medium">{t("about.principle4Title")}</h3>
              <p className="mt-1 text-sm text-foreground/70">{t("about.principle4Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">{t("about.liveHeading")}</h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-foreground/70">
          <li>{t("about.live1")}</li>
          <li>{t("about.live2")}</li>
          <li>{t("about.live3")}</li>
          <li>{t("about.live4")}</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">{t("about.nextHeading")}</h2>
        <p className="mt-3 text-foreground/70">{t("about.nextText")}</p>
      </section>

      <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-border pt-8">
        <Link
          href="/register"
          className="rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
        >
          {t("about.createAccount")}
        </Link>
        <Link href="/" className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface">
          {t("about.backHome")}
        </Link>
      </div>
    </div>
  );
}
