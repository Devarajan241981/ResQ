"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { MissingPersonReport } from "@/lib/api/types";

export function ReportForm() {
  const router = useRouter();
  const { authFetch } = useAuth();

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
      <h1 className="text-2xl font-semibold">Report a missing person</h1>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Age
            <input type="number" required min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Gender
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Last seen location
          <input required value={lastSeenLocation} onChange={(e) => setLastSeenLocation(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Last seen date &amp; time
          <input type="datetime-local" required value={lastSeenAt} onChange={(e) => setLastSeenAt(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Clothing description
          <textarea value={clothingDescription} onChange={(e) => setClothingDescription(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Medical conditions
          <textarea value={medicalConditions} onChange={(e) => setMedicalConditions(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Languages spoken (comma-separated)
          <input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Hindi, English" className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Photos
          <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(e.target.files)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <button type="submit" disabled={isSubmitting} className="mt-2 rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50">
          {isSubmitting ? "Submitting…" : "Submit report"}
        </button>
      </form>
    </div>
  );
}
