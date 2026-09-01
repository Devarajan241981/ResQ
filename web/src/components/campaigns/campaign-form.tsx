"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { canOrganize } from "@/lib/auth/roles";
import { extractErrorMessage } from "@/lib/api/client";
import type { Campaign, CampaignCategory } from "@/lib/api/types";
import { CATEGORIES, CATEGORY_LABEL_KEYS } from "./category-label";

export function CampaignForm() {
  const router = useRouter();
  const { authFetch, user } = useAuth();
  const { t } = useLanguage();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CampaignCategory>("awareness");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [capacity, setCapacity] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!canOrganize(user?.role, user?.is_verified)) {
    return (
      <p role="alert" className="mx-auto max-w-md rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
        {t("campaigns.form.onlyVerified")}
      </p>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("city", city);
      formData.append("venue", venue);
      formData.append("starts_at", new Date(startsAt).toISOString());
      if (capacity) formData.append("capacity", capacity);
      if (banner) formData.append("banner_image", banner);

      const created = await authFetch<Campaign>("/campaigns/", { method: "POST", body: formData });
      router.push(`/campaigns/${created.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">{t("campaigns.form.heading")}</h1>
      <p className="mt-1 text-sm text-foreground/60">{t("campaigns.form.subheading")}</p>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {t("campaigns.form.title")}
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("campaigns.form.category")}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CampaignCategory)}
            className="rounded-md border border-border bg-background px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(CATEGORY_LABEL_KEYS[c])}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("campaigns.form.description")}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("common.city")}
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("campaigns.form.venue")}
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("campaigns.form.startsAt")}
            <input
              type="datetime-local"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("campaigns.form.capacity")}
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
              placeholder={t("campaigns.form.capacityPlaceholder")}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          {t("campaigns.form.banner")}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setBanner(e.target.files?.[0] ?? null)}
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {isSubmitting ? t("campaigns.form.publishing") : t("campaigns.form.publish")}
        </button>
      </form>
    </div>
  );
}
