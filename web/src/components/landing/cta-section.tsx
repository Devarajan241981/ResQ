"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";

export function CtaSection() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  if (isAuthenticated) return null;

  return (
    <section className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight">{t("cta.heading")}</h2>
        <p className="max-w-xl text-foreground/70">{t("cta.subheading")}</p>
        <Link
          href="/register"
          className="rounded-md bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
        >
          {t("cta.button")}
        </Link>
      </div>
    </section>
  );
}
