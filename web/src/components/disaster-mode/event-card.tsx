"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { extractErrorMessage } from "@/lib/api/client";
import type { DisasterEvent, NeedType, StatusReport } from "@/lib/api/types";

const NEED_TYPES: { value: NeedType; labelKey: TranslationKey }[] = [
  { value: "safe", labelKey: "disasterMode.needType.safe" },
  { value: "need_rescue", labelKey: "disasterMode.needType.rescue" },
  { value: "need_food", labelKey: "disasterMode.needType.food" },
  { value: "need_water", labelKey: "disasterMode.needType.water" },
  { value: "need_medicine", labelKey: "disasterMode.needType.medicine" },
];

export function EventCard({ event }: { event: DisasterEvent }) {
  const { authFetch, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [needType, setNeedType] = useState<NeedType>("safe");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch<StatusReport>("/disaster-mode/status-reports/", {
        method: "POST",
        body: { event: event.id, need_type: needType, notes },
      });
      setSubmitted(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <li className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium capitalize">
            {event.disaster_type}: {event.name}
          </h3>
          <p className="text-sm text-foreground/70">{event.affected_area}</p>
        </div>
        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium capitalize text-amber-600">
          {event.status}
        </span>
      </div>
      <p className="mt-2 text-xs text-foreground/50">
        {event.open_needs_count} {t("disasterMode.card.openNeedsSuffix")}
      </p>

      {isAuthenticated && (
        <div className="mt-3 border-t border-border pt-3">
          {submitted ? (
            <p className="text-sm text-green-600">{t("disasterMode.card.thanks")}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
              {error && (
                <p role="alert" className="w-full text-sm text-red-600">
                  {error}
                </p>
              )}
              <label className="flex flex-col gap-1 text-sm">
                <span className="sr-only">{t("disasterMode.card.statusSr")}</span>
                <select
                  value={needType}
                  onChange={(e) => setNeedType(e.target.value as NeedType)}
                  aria-label={`${t("disasterMode.card.statusForPrefix")} ${event.name}`}
                  className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                >
                  {NEED_TYPES.map((n) => (
                    <option key={n.value} value={n.value}>
                      {t(n.labelKey)}
                    </option>
                  ))}
                </select>
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("disasterMode.card.notesPlaceholder")}
                aria-label={`${t("disasterMode.card.notesForPrefix")} ${event.name}`}
                className="min-w-40 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-50"
              >
                {isSubmitting ? t("common.sending") : t("disasterMode.card.reportButton")}
              </button>
            </form>
          )}
        </div>
      )}
    </li>
  );
}
