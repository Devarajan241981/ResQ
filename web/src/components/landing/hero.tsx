"use client";

import Link from "next/link";
import { ShieldAlert, Siren } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";

export function Hero() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(220,38,38,0.15),transparent)]"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground/70">
          <Siren className="h-3.5 w-3.5 text-red-600" aria-hidden />
          AI-powered emergency response for India
        </span>

        <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          {t("home.title")}
        </h1>
        <p className="mt-5 max-w-2xl text-balance text-lg text-foreground/70">{t("home.subtitle")}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/sos"
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
            >
              <ShieldAlert className="h-4 w-4" aria-hidden />
              Go to SOS
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-sm transition-opacity hover:opacity-90"
            >
              Get started — it&apos;s free
            </Link>
          )}
          <Link
            href="/missing-persons"
            className="rounded-md border border-border px-6 py-3 text-sm font-semibold hover:bg-surface"
          >
            Browse missing persons
          </Link>
        </div>

        <dl className="mt-14 grid w-full max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            ["24/7", "Emergency response"],
            ["12", "Community modules"],
            ["10", "Indian languages"],
            ["100%", "Community-powered"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="text-2xl font-bold">{value}</dd>
              <p className="mt-1 text-xs text-foreground/60">{label}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
