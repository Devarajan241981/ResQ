"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { BloodRequest, DisasterEvent, PaginatedResponse } from "@/lib/api/types";

interface TickerItem {
  id: string;
  text: string;
}

async function loadTickerItems(): Promise<TickerItem[]> {
  const [events, requests] = await Promise.allSettled([
    apiFetch<PaginatedResponse<DisasterEvent>>("/disaster-mode/events/?status=active"),
    apiFetch<PaginatedResponse<BloodRequest>>("/blood-donation/requests/?status=open"),
  ]);

  const items: TickerItem[] = [];

  if (events.status === "fulfilled") {
    for (const event of events.value.results) {
      items.push({
        id: `event-${event.id}`,
        text: `🌊 Active ${event.disaster_type} alert: ${event.name} (${event.affected_area || "area TBD"})`,
      });
    }
  }

  if (requests.status === "fulfilled") {
    for (const req of requests.value.results.slice(0, 8)) {
      items.push({
        id: `blood-${req.id}`,
        text: `🩸 ${req.urgency === "critical" ? "Critical" : "Open"} blood request: ${req.blood_group} needed in ${req.city}`,
      });
    }
  }

  return items;
}

const FALLBACK_ITEMS: TickerItem[] = [
  { id: "fallback-1", text: "📢 Report a missing person in under a minute — share instantly via QR code" },
  { id: "fallback-2", text: "🚨 One-tap SOS sends your live location to trusted contacts and nearby volunteers" },
  { id: "fallback-3", text: "🩸 Register as a blood donor during signup — no separate form needed" },
];

export function LiveTicker() {
  const [items, setItems] = useState<TickerItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTickerItems().then((data) => {
      if (!cancelled) setItems(data.length > 0 ? data : null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const display = items && items.length > 0 ? items : FALLBACK_ITEMS;
  // Duplicate the list so the CSS marquee loops seamlessly.
  const looped = [...display, ...display];

  return (
    <div className="overflow-hidden border-y border-border bg-foreground text-background">
      <div className="group flex whitespace-nowrap py-2.5">
        <div className="flex shrink-0 animate-[marquee_35s_linear_infinite] gap-10 group-hover:[animation-play-state:paused]">
          {looped.map((item, i) => (
            <span key={`${item.id}-${i}`} className="text-sm font-medium">
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
