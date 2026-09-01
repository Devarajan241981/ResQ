"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { BloodRequest, DisasterEvent, PaginatedResponse } from "@/lib/api/types";

interface TickerItem {
  id: string;
  text: string;
}

async function loadTickerItems(t: (key: TranslationKey) => string): Promise<TickerItem[]> {
  const [events, requests] = await Promise.allSettled([
    apiFetch<PaginatedResponse<DisasterEvent>>("/disaster-mode/events/?status=active"),
    apiFetch<PaginatedResponse<BloodRequest>>("/blood-donation/requests/?status=open"),
  ]);

  const items: TickerItem[] = [];

  if (events.status === "fulfilled") {
    for (const event of events.value.results) {
      items.push({
        id: `event-${event.id}`,
        text: `🌊 ${t("ticker.activeAlertPrefix")} ${event.disaster_type} ${t("ticker.alertSuffix")} ${event.name} (${event.affected_area || t("ticker.areaTBD")})`,
      });
    }
  }

  if (requests.status === "fulfilled") {
    for (const req of requests.value.results.slice(0, 8)) {
      items.push({
        id: `blood-${req.id}`,
        text: `🩸 ${req.urgency === "critical" ? t("ticker.critical") : t("ticker.open")} ${t("ticker.bloodRequestPrefix")} ${req.blood_group} ${t("ticker.neededIn")} ${req.city}`,
      });
    }
  }

  return items;
}

export function LiveTicker() {
  const { t } = useLanguage();
  const [items, setItems] = useState<TickerItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTickerItems(t).then((data) => {
      if (!cancelled) setItems(data.length > 0 ? data : null);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-fetching on every language change would spam the public endpoints; label text is re-derived from `t` at render time via FALLBACK_ITEMS instead
  }, []);

  const fallbackItems: TickerItem[] = [
    { id: "fallback-1", text: t("ticker.fallback1") },
    { id: "fallback-2", text: t("ticker.fallback2") },
    { id: "fallback-3", text: t("ticker.fallback3") },
  ];

  const display = items && items.length > 0 ? items : fallbackItems;
  // Duplicate the list so the CSS marquee loops seamlessly.
  const looped = [...display, ...display];

  return (
    <div className="flex items-stretch overflow-hidden bg-[#123a6b] text-white">
      <span className="z-10 flex shrink-0 items-center bg-[#FF9933] px-3 text-xs font-bold uppercase tracking-wide text-white">
        {t("ticker.label")}
      </span>
      <div className="group flex min-w-0 flex-1 whitespace-nowrap py-1.5">
        <div className="flex shrink-0 animate-[marquee_35s_linear_infinite] gap-10 pl-4 group-hover:[animation-play-state:paused]">
          {looped.map((item, i) => (
            <span key={`${item.id}-${i}`} className="text-xs font-medium">
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
