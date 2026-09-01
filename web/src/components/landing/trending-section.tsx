"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Flame, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";
import type { EventItem, PaginatedResponse } from "@/lib/api/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import { PHOTOS } from "@/lib/media/stock-photos";

// Events carry no banner image, so pick a themed photo by category.
const CATEGORY_PHOTO: Record<EventItem["category"], string> = {
  awareness: PHOTOS.ngos,
  blood_drive: PHOTOS.bloodDonation,
  relief: PHOTOS.reliefTeam,
  training: PHOTOS.volunteers,
  meeting: PHOTOS.ngos,
  other: PHOTOS.festival,
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function TrendingSection() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<EventItem[] | null>(null);

  useEffect(() => {
    apiFetch<PaginatedResponse<EventItem>>("/events/events/")
      .then((d) => setEvents(d.results))
      .catch(() => setEvents([]));
  }, []);

  const items = (events ?? []).slice(0, 3);

  return (
    <section className="bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eab308] px-3 py-1 text-sm font-bold text-black">
            <Flame className="h-4 w-4" aria-hidden />
            {t("trending.badge")}
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("trending.heading")}</h2>
          </div>
        </div>
        <p className="mt-2 text-foreground/70">{t("trending.subheading")}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events == null ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-background" />
            ))
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background p-8 text-center text-foreground/60 sm:col-span-2 lg:col-span-3">
              {t("trending.empty")}
            </div>
          ) : (
            items.map((ev) => (
              <Link
                key={ev.id}
                href="/calendar"
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[16/9]">
                  <Image src={CATEGORY_PHOTO[ev.category]} alt="" fill sizes="(max-width:640px) 100vw, 350px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full bg-[#eab308] px-2.5 py-1 text-xs font-bold text-black">
                    {t(`eventCategory.${ev.category}` as TranslationKey)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-bold leading-snug group-hover:text-[color:var(--brand)]">{ev.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{ev.description}</p>

                  <div className="mt-4 space-y-2 rounded-lg bg-surface p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#138808]" aria-hidden />
                      <span className="font-medium text-[#138808]">{formatDate(ev.event_date)}</span>
                    </div>
                    {ev.city && (
                      <div className="flex items-center gap-2 text-foreground/70">
                        <MapPin className="h-4 w-4" aria-hidden />
                        <span className="truncate">{ev.city}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-foreground/60">
                    <Users className="h-4 w-4" aria-hidden />
                    {ev.rsvp_count} {t("trending.rsvps")}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/calendar"
            className="inline-block rounded-full bg-[color:var(--brand)] px-6 py-2.5 font-semibold text-white hover:opacity-90"
          >
            {t("trending.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
