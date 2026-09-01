"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Campaign, PaginatedResponse } from "@/lib/api/types";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function monthLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "RQ";
}

export function NewsSpotlight() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Campaign[] | null>(null);

  useEffect(() => {
    apiFetch<PaginatedResponse<Campaign>>("/campaigns/?status=published")
      .then((d) => setItems(d.results))
      .catch(() => setItems([]));
  }, []);

  const news = items ?? [];
  const featured = news[0];
  const spotlightList = news.slice(1, 6);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* News / Press Release */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("news.heading")}</h2>
          <span aria-hidden className="mt-2 block h-1 w-16 rounded bg-[color:var(--brand)]" />
          <p className="mt-2 text-foreground/60">{t("news.subheading")}</p>

          <div className="mt-6 space-y-3">
            {items == null ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-surface" />
              ))
            ) : news.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-foreground/60">
                {t("news.empty")}
              </div>
            ) : (
              news.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/campaigns/${c.id}`}
                  className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--brand)]/10 text-xs font-bold text-[color:var(--brand)]">
                    {initials(c.organizer_name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs text-foreground/50">
                      <span className="truncate font-medium">{c.organizer_name}</span>
                      <span className="shrink-0">{formatDateTime(c.starts_at)}</span>
                    </div>
                    <p className="mt-1 font-semibold leading-snug">{c.title}</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="mt-5">
            <Link href="/campaigns" className="text-sm font-semibold text-[color:var(--brand)] hover:underline">
              {t("news.viewAll")} →
            </Link>
          </div>
        </div>

        {/* Spotlight */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("spotlight.heading")}</h2>
          <span aria-hidden className="mt-2 block h-1 w-16 rounded bg-[color:var(--brand)]" />
          <p className="mt-2 text-foreground/60">{t("spotlight.subheading")}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {featured ? (
              <Link
                href={`/campaigns/${featured.id}`}
                className="group overflow-hidden rounded-xl border border-border bg-[color:var(--brand)] text-white shadow-md sm:row-span-2"
              >
                {featured.banner_image && (
                  <div className="relative aspect-[16/10] bg-white">
                    <Image src={featured.banner_image} alt="" fill sizes="(max-width:640px) 100vw, 300px" className="object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-white/70">{monthLabel(featured.starts_at)}</p>
                  <h3 className="mt-1 font-bold leading-snug">{featured.title}</h3>
                  <p className="mt-2 line-clamp-4 text-sm text-white/85">{featured.description}</p>
                </div>
              </Link>
            ) : (
              <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-foreground/60 sm:col-span-2">
                {t("news.empty")}
              </div>
            )}

            {spotlightList.map((c) => (
              <Link key={c.id} href={`/campaigns/${c.id}`} className="rounded-lg border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
                <p className="text-xs text-foreground/50">{monthLabel(c.starts_at)}</p>
                <h4 className="mt-1 font-semibold leading-snug">{c.title}</h4>
              </Link>
            ))}
          </div>

          <div className="mt-5">
            <Link href="/campaigns" className="text-sm font-semibold text-[color:var(--brand)] hover:underline">
              {t("spotlight.viewAll")} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
