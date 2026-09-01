"use client";

import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import { canOrganize } from "@/lib/auth/roles";
import { HOLIDAYS_2026, type Holiday, type HolidayCategory } from "@/lib/calendar/holidays-2026";
import type { EventItem, PaginatedResponse } from "@/lib/api/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import { EventForm } from "./event-form";

const HOLIDAY_STYLE: Record<HolidayCategory, { dot: string; chip: string }> = {
  national: { dot: "bg-[#123a6b]", chip: "bg-[#123a6b]/10 text-[#123a6b] dark:bg-blue-400/15 dark:text-blue-300" },
  festival: { dot: "bg-[#FF9933]", chip: "bg-[#FF9933]/15 text-[#b25f0e] dark:text-[#FF9933]" },
  health: { dot: "bg-[#138808]", chip: "bg-[#138808]/12 text-[#138808]" },
  awareness: { dot: "bg-red-600", chip: "bg-red-500/12 text-red-600" },
};
const EVENT_STYLE = { dot: "bg-indigo-600", chip: "bg-indigo-500/12 text-indigo-600 dark:text-indigo-300" };

const CATEGORY_LABEL: Record<EventItem["category"], TranslationKey> = {
  awareness: "eventCategory.awareness",
  blood_drive: "eventCategory.blood_drive",
  relief: "eventCategory.relief",
  training: "eventCategory.training",
  meeting: "eventCategory.meeting",
  other: "eventCategory.other",
};

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function HolidayCalendar() {
  const { t, language } = useLanguage();
  const { authFetch, user, isAuthenticated } = useAuth();
  const today = new Date();
  const locale = `${language}-IN`;

  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(today.getFullYear() === 2026 ? today.getMonth() : 0);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selected, setSelected] = useState<string | null>(
    today.getFullYear() === 2026 ? iso(2026, today.getMonth(), today.getDate()) : "2026-01-01",
  );
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyEventId, setBusyEventId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const monthParam = `${year}-${String(month + 1).padStart(2, "0")}`;
    apiFetch<PaginatedResponse<EventItem>>(`/events/events/?month=${monthParam}`)
      .then((data) => {
        if (!cancelled) setEvents(data.results);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const monthName = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(year, month, 1));
  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2026, 1, 1 + i)),
  );

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const holidaysByDate = useMemo(() => {
    const map = new Map<string, Holiday[]>();
    for (const h of HOLIDAYS_2026) {
      if (!map.has(h.date)) map.set(h.date, []);
      map.get(h.date)!.push(h);
    }
    return map;
  }, []);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) {
      if (!map.has(e.event_date)) map.set(e.event_date, []);
      map.get(e.event_date)!.push(e);
    }
    return map;
  }, [events]);

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  const todayIso = today.getFullYear() === 2026 ? iso(2026, today.getMonth(), today.getDate()) : "";

  async function toggleRsvp(event: EventItem) {
    if (!isAuthenticated) return;
    setBusyEventId(event.id);
    setError(null);
    try {
      const action = event.has_rsvped ? "cancel-rsvp" : "rsvp";
      const updated = await authFetch<EventItem>(`/events/events/${event.id}/${action}/`, { method: "POST" });
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyEventId(null);
    }
  }

  function onEventCreated(event: EventItem) {
    setCreatingFor(null);
    const created = new Date(event.event_date);
    if (created.getFullYear() === year && created.getMonth() === month) {
      setEvents((prev) => [...prev, event]);
    }
    setSelected(event.event_date);
  }

  const selectedHolidays = selected ? holidaysByDate.get(selected) ?? [] : [];
  const selectedEvents = selected ? eventsByDate.get(selected) ?? [] : [];
  const canCreate = canOrganize(user?.role, user?.is_verified);
  const loopedHolidays = [...HOLIDAYS_2026, ...HOLIDAYS_2026];

  return (
    <div className="flex flex-col gap-6">
      {/* Gradient header with a scrolling ribbon of the year's holidays */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#123a6b] via-[#1a4d8f] to-[#0f2f56] text-white shadow-sm">
        <div className="flex flex-col gap-1 px-6 py-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <CalendarDays className="h-7 w-7 text-[#FF9933]" aria-hidden />
            {t("calendar.heading")}
          </h1>
          <p className="text-sm text-white/75">{t("calendar.subheading")}</p>
        </div>
        <div className="group flex overflow-hidden border-t border-white/15 bg-white/5 py-2">
          <div className="flex shrink-0 animate-[marquee_60s_linear_infinite] gap-3 pl-4 group-hover:[animation-play-state:paused]">
            {loopedHolidays.map((h, i) => (
              <span key={`${h.nameKey}-${i}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs">
                <span className={`h-2 w-2 rounded-full ${HOLIDAY_STYLE[h.category].dot}`} aria-hidden />
                {t(h.nameKey)}
                <span className="text-white/55">
                  {new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(h.date))}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Month grid */}
      <div className="w-full min-w-0 rounded-2xl border border-border bg-background p-4 shadow-sm lg:flex-1">
        <div className="flex items-center justify-between">
          <button type="button" aria-label={t("calendar.prevMonth")} onClick={() => shiftMonth(-1)} className="rounded-md p-2 hover:bg-surface">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
          <button type="button" aria-label={t("calendar.nextMonth")} onClick={() => shiftMonth(1)} className="rounded-md p-2 hover:bg-surface">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/60">
          <span className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${HOLIDAY_STYLE.national.dot}`} />{t("calendar.legendHoliday")}</span>
          <span className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${EVENT_STYLE.dot}`} />{t("calendar.legendEvent")}</span>
        </div>

        <div className="mt-3 grid grid-cols-7 text-center text-xs font-medium text-foreground/50">
          {weekdayNames.map((d) => (
            <span key={d} className="py-1">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const date = iso(year, month, day);
            const dayHolidays = holidaysByDate.get(date) ?? [];
            const dayEvents = eventsByDate.get(date) ?? [];
            const chips: { key: string; label: string; chip: string }[] = [
              ...dayHolidays.map((h) => ({ key: `h-${h.nameKey}`, label: t(h.nameKey), chip: HOLIDAY_STYLE[h.category].chip })),
              ...dayEvents.map((e) => ({ key: `e-${e.id}`, label: e.title, chip: EVENT_STYLE.chip })),
            ];
            const isToday = date === todayIso;
            const isSelected = date === selected;
            const weekday = new Date(year, month, day).getDay();
            const isWeekend = weekday === 0 || weekday === 6;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelected(date)}
                className={`flex min-h-20 flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors sm:min-h-32 ${
                  isSelected
                    ? "border-[#123a6b] bg-[#123a6b]/5 ring-1 ring-[#123a6b]/30"
                    : isWeekend
                      ? "border-transparent bg-surface/60 hover:bg-surface"
                      : "border-transparent hover:bg-surface"
                }`}
              >
                <span
                  className={`inline-grid h-7 w-7 place-items-center self-start rounded-full text-sm font-semibold ${
                    isToday ? "bg-[#123a6b] text-white shadow" : isWeekend ? "text-red-600/80" : "text-foreground/80"
                  }`}
                >
                  {day}
                </span>
                <span className="flex flex-col gap-0.5">
                  {chips.slice(0, 3).map((c) => (
                    <span key={c.key} className={`truncate rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight ${c.chip}`}>
                      {c.label}
                    </span>
                  ))}
                  {chips.length > 3 && (
                    <span className="px-1 text-[11px] font-medium text-foreground/50">+{chips.length - 3}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day agenda panel */}
      <aside className="w-full shrink-0 lg:w-96">
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">
                  {new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(new Date(selected))}
                </h2>
                {canCreate && (
                  <button
                    type="button"
                    onClick={() => setCreatingFor(selected)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#138808] px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                    {t("calendar.addEvent")}
                  </button>
                )}
              </div>

              {error && (
                <p role="alert" className="mt-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              {/* Holidays */}
              {selectedHolidays.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {selectedHolidays.map((h) => (
                    <li key={h.nameKey} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${HOLIDAY_STYLE[h.category].chip}`}>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${HOLIDAY_STYLE[h.category].dot}`} />
                      <span className="min-w-0 flex-1 truncate">
                        {t(h.nameKey)}
                        {h.approximate && <span className="opacity-60"> *</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Events */}
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-foreground/50">{t("calendar.eventsHeading")}</h3>
              {selectedEvents.length === 0 ? (
                <p className="mt-2 text-sm text-foreground/60">{t("calendar.noEvents")}</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-3">
                  {selectedEvents.map((e) => (
                    <li key={e.id} className="rounded-xl border border-border p-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${EVENT_STYLE.chip}`}>
                        {t(CATEGORY_LABEL[e.category])}
                      </span>
                      <p className="mt-1 font-semibold leading-tight">{e.title}</p>
                      {e.description && <p className="mt-1 text-sm text-foreground/70">{e.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground/55">
                        {e.start_time && (
                          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden />{e.start_time.slice(0, 5)}</span>
                        )}
                        {(e.location || e.city) && (
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden />{[e.location, e.city].filter(Boolean).join(", ")}</span>
                        )}
                        <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" aria-hidden />{e.rsvp_count} {t("calendar.attendingSuffix")}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-foreground/45">{t("community.list.byPrefix")} {e.creator_name}</p>
                      {isAuthenticated ? (
                        <button
                          type="button"
                          disabled={busyEventId === e.id}
                          onClick={() => toggleRsvp(e)}
                          className={`mt-2 rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                            e.has_rsvped ? "bg-[#138808] text-white" : "border border-border hover:bg-surface"
                          }`}
                        >
                          {e.has_rsvped ? t("calendar.rsvpedButton") : t("calendar.rsvpButton")}
                        </button>
                      ) : (
                        <p className="mt-2 text-xs text-foreground/55">{t("calendar.rsvpLogin")}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {!canCreate && isAuthenticated && (
                <p className="mt-4 text-xs text-foreground/45">{t("calendar.onlyOrganizers")}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-foreground/60">{t("calendar.selectDayHint")}</p>
          )}
        </div>
        <p className="mt-2 px-1 text-xs text-foreground/50">* {t("calendar.approxNote")}</p>
      </aside>
      </div>

      {creatingFor && (
        <EventForm defaultDate={creatingFor} onClose={() => setCreatingFor(null)} onCreated={onEventCreated} />
      )}
    </div>
  );
}
