"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { MissingPersonReport } from "@/lib/api/types";

export function ReportForm() {
  const router = useRouter();
  const { authFetch } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [lastSeenAt, setLastSeenAt] = useState("");
  const [clothingDescription, setClothingDescription] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [languages, setLanguages] = useState("");
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("gender", gender);
    formData.append("last_seen_location", lastSeenLocation);
    formData.append("last_seen_at", new Date(lastSeenAt).toISOString());
    formData.append("clothing_description", clothingDescription);
    formData.append("medical_conditions", medicalConditions);
    languages
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((lang) => formData.append("languages_spoken", lang));
    if (photos) {
      Array.from(photos).forEach((file) => formData.append("photos", file));
    }

    try {
      const report = await authFetch<MissingPersonReport>("/missing-persons/", {
        method: "POST",
        body: formData,
      });
      router.push(`/missing-persons/share/${report.public_slug}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold">{t("missingPersons.form.heading")}</h1>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {t("common.name")}
          <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("missingPersons.form.age")}
            <input type="number" required min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("common.gender")}
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2">
              <option value="male">{t("common.male")}</option>
              <option value="female">{t("common.female")}</option>
              <option value="other">{t("common.other")}</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          {t("missingPersons.form.lastSeenLocation")}
          <input required value={lastSeenLocation} onChange={(e) => setLastSeenLocation(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("missingPersons.form.lastSeenDateTime")}
          <input type="datetime-local" required value={lastSeenAt} onChange={(e) => setLastSeenAt(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("missingPersons.form.clothingDescription")}
          <textarea value={clothingDescription} onChange={(e) => setClothingDescription(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("missingPersons.form.medicalConditions")}
          <textarea value={medicalConditions} onChange={(e) => setMedicalConditions(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("missingPersons.form.languagesSpoken")}
          <input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder={t("missingPersons.form.languagesPlaceholder")} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("missingPersons.form.photos")}
          <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(e.target.files)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <button type="submit" disabled={isSubmitting} className="mt-2 rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50">
          {isSubmitting ? t("missingPersons.form.submitting") : t("missingPersons.form.submit")}
        </button>
      </form>
    </div>
  );
}
