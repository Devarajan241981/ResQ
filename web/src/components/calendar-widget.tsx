"use client";

import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { holidaysInMonth } from "@/lib/calendar/holidays-2026";
import { useLanguage } from "@/lib/i18n/language-context";

const WEEKDAY_KEYS = [
  "cal.sun",
  "cal.mon",
  "cal.tue",
  "cal.wed",
  "cal.thu",
  "cal.fri",
  "cal.sat",
] as const;

const MONTH_KEYS = [
  "cal.jan",
  "cal.feb",
  "cal.mar",
  "cal.apr",
  "cal.may",
  "cal.jun",
  "cal.jul",
  "cal.aug",
  "cal.sep",
  "cal.oct",
  "cal.nov",
  "cal.dec",
] as const;

/** A compact month calendar popup that highlights holidays — mirrors the govt-portal
 * calendar widget. Full holiday list lives on the /calendar page ("View More"). */
export function CalendarWidget() {
  const { t } = useLanguage();
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const holidays = holidaysInMonth(year, month);
  const holidayDays = new Set(holidays.map((h) => Number(h.date.slice(8, 10))));

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  function shift(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("calendarWidget.open")}
        aria-expanded={open}
        title={t("calendarWidget.open")}
        className="rounded-md p-2 text-foreground hover:bg-surface"
      >
        <CalendarDays className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/20"
          />
          <div
            role="dialog"
            aria-label={t("calendarWidget.open")}
            className="fixed right-2 top-16 z-50 w-[min(24rem,94vw)] rounded-2xl border border-border bg-background p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold text-[color:var(--brand)]">
                {year} {t(MONTH_KEYS[month])}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => shift(-1)} aria-label={t("common.back")} className="rounded p-1 hover:bg-surface">
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <button type="button" onClick={() => shift(1)} aria-label={t("common.next")} className="rounded p-1 hover:bg-surface">
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label={t("a11y.close")} className="rounded-full p-1 text-[color:var(--brand)] hover:bg-surface">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {WEEKDAY_KEYS.map((k) => (
                <span key={k} className="rounded bg-[color:var(--brand)] py-1 font-semibold text-white">
                  {t(k)}
                </span>
              ))}
              {cells.map((d, i) => (
                <span
                  key={i}
                  className={`grid aspect-square place-items-center rounded text-sm ${
                    d == null
                      ? ""
                      : holidayDays.has(d)
                        ? "bg-[#138808] font-bold text-white"
                        : isToday(d)
                          ? "ring-1 ring-[color:var(--brand)] font-semibold"
                          : "hover:bg-surface"
                  }`}
                >
                  {d ?? ""}
                </span>
              ))}
            </div>

            <div className="mt-3 border-t border-border pt-3">
              {holidays.length === 0 ? (
                <p className="text-sm text-foreground/60">{t("calendarWidget.noHolidays")}</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {holidays.map((h) => (
                    <li key={h.date} className="flex items-center gap-2">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-[#138808] text-xs font-bold text-white">
                        {Number(h.date.slice(8, 10))}
                      </span>
                      <span>{t(h.nameKey)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 text-right">
                <Link
                  href="/calendar"
                  onClick={() => setOpen(false)}
                  className="inline-block rounded-md bg-[color:var(--brand)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                >
                  {t("calendarWidget.viewMore")}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
