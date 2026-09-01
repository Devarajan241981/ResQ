"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { canOrganize } from "@/lib/auth/roles";
import { extractErrorMessage } from "@/lib/api/client";
import type { Community } from "@/lib/api/types";

export function CommunityForm() {
  const router = useRouter();
  const { authFetch, user } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!canOrganize(user?.role, user?.is_verified)) {
    return (
      <p role="alert" className="mx-auto max-w-md rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
        {t("community.form.onlyVerified")}
      </p>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("city", city);
      if (banner) formData.append("banner_image", banner);

      const created = await authFetch<Community>("/community/", { method: "POST", body: formData });
      router.push(`/community/${created.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">{t("community.form.heading")}</h1>
      <p className="mt-1 text-sm text-foreground/60">{t("community.form.subheading")}</p>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {t("community.form.name")}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("community.form.description")}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("common.city")}
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("community.form.banner")}
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
          {isSubmitting ? t("community.form.publishing") : t("community.form.publish")}
        </button>
      </form>
    </div>
  );
}
