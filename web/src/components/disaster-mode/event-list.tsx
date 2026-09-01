"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { DisasterEvent, PaginatedResponse } from "@/lib/api/types";
import { EventCard } from "./event-card";

export function EventList() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<PaginatedResponse<DisasterEvent>>("/disaster-mode/events/?status=active")
      .then((data) => {
        setEvents(data.results);
        setStatus("ready");
      })
      .catch((err) => {
        setError(extractErrorMessage(err));
        setStatus("error");
      });
  }, []);

  if (status === "loading") return <p className="text-foreground/70">{t("common.loading")}</p>;
  if (status === "error") return <p role="alert" className="text-red-600">{error}</p>;
  if (events.length === 0) return <p className="text-foreground/70">{t("disasterMode.empty")}</p>;

  return (
    <ul className="flex flex-col gap-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </ul>
  );
}
