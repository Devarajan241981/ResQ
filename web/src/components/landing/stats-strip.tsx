"use client";

import { CalendarDays, Droplet, Globe, LayoutGrid, Search, ShieldCheck, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";
import type { BloodRequest, EventItem, PaginatedResponse, PublicFeedReport } from "@/lib/api/types";
import type { TranslationKey } from "@/lib/i18n/translations";

interface Stat {
  icon: LucideIcon;
  value: string;
  labelKey: TranslationKey;
  color: string;
}

type Page<T> = PaginatedResponse<T>;

export function StatsStrip() {
  const { t } = useLanguage();
  const [missing, setMissing] = useState<number | null>(null);
  const [blood, setBlood] = useState<number | null>(null);
  const [events, setEvents] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<Page<PublicFeedReport>>("/missing-persons/").then((d) => setMissing(d.count)).catch(() => {});
    apiFetch<Page<BloodRequest>>("/blood-donation/requests/?status=open").then((d) => setBlood(d.count)).catch(() => {});
    apiFetch<Page<EventItem>>("/events/events/").then((d) => setEvents(d.count)).catch(() => {});
  }, []);

  const stats: Stat[] = [
    { icon: LayoutGrid, value: "13", labelKey: "stats.modules", color: "#123A6B" },
    { icon: ShieldCheck, value: "24/7", labelKey: "stats.response", color: "#DC2626" },
    { icon: Search, value: missing != null ? String(missing) : "—", labelKey: "stats.missingReports", color: "#FF9933" },
    { icon: Droplet, value: blood != null ? String(blood) : "—", labelKey: "stats.openBlood", color: "#DC2626" },
    { icon: CalendarDays, value: events != null ? String(events) : "—", labelKey: "stats.events", color: "#4F46E5" },
    { icon: Globe, value: "10", labelKey: "stats.languages", color: "#138808" },
  ];

  return (
    <div className="relative z-10 mx-auto -mt-14 w-full max-w-6xl px-4">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 rounded-2xl border border-border bg-background p-6 shadow-xl sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.labelKey} className="flex items-center gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
              style={{ backgroundColor: `${s.color}1A`, color: s.color }}
            >
              <s.icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-extrabold leading-none">{s.value}</p>
              <p className="mt-1 text-xs text-foreground/60">{t(s.labelKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
