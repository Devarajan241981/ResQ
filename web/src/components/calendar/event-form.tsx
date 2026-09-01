"use client";

import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { EventItem } from "@/lib/api/types";
import type { TranslationKey } from "@/lib/i18n/translations";

const CATEGORIES: { value: EventItem["category"]; labelKey: TranslationKey }[] = [
  { value: "awareness", labelKey: "eventCategory.awareness" },
  { value: "blood_drive", labelKey: "eventCategory.blood_drive" },
  { value: "relief", labelKey: "eventCategory.relief" },
  { value: "training", labelKey: "eventCategory.training" },
  { value: "meeting", labelKey: "eventCategory.meeting" },
  { value: "other", labelKey: "eventCategory.other" },
];

interface Props {
  defaultDate: string; // YYYY-MM-DD
  onClose: () => void;
  onCreated: (event: EventItem) => void;
}

export function EventForm({ defaultDate, onClose, onCreated }: Props) {
  const { authFetch } = useAuth();
  const { t } = useLanguage();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventItem["category"]>("awareness");
  const [eventDate, setEventDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const event = await authFetch<EventItem>("/events/events/", {
        method: "POST",
        body: {
          title,
          category,
          event_date: eventDate,
          start_time: startTime || null,
          location,
          city,
          description,
        },
      });
      onCreated(event);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  const field = "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("calendar.createEventHeading")}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-t-2xl bg-background p-5 text-foreground sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("calendar.createEventHeading")}</h2>
          <button type="button" aria-label={t("common.close")} onClick={onClose} className="rounded-md p-1.5 hover:bg-surface">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          {t("calendar.eventTitleLabel")}
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("calendar.eventCategoryLabel")}
            <select value={category} onChange={(e) => setCategory(e.target.value as EventItem["category"])} className={field}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {t(c.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("calendar.eventDateLabel")}
            <input required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={field} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("calendar.eventTimeLabel")}
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={field} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("calendar.eventCityLabel")}
            <input value={city} onChange={(e) => setCity(e.target.value)} className={field} />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          {t("calendar.eventLocationLabel")}
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={field} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("calendar.eventDescLabel")}
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-1 rounded-md bg-[#138808] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSaving ? t("calendar.publishing") : t("calendar.publishEvent")}
        </button>
      </form>
    </div>
  );
}
