"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MapPin, Plus, User } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import type { MissingChild, PaginatedResponse } from "@/lib/api/types";

const input = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-[var(--brand)]";

export function MissingChildren() {
  const { t } = useLanguage();
  const { isAuthenticated, authFetch } = useAuth();
  const [items, setItems] = useState<MissingChild[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [location, setLocation] = useState("");
  const [lastSeenAt, setLastSeenAt] = useState("");
  const [school, setSchool] = useState("");

  useEffect(() => {
    apiFetch<PaginatedResponse<MissingChild>>("/missing-children/")
      .then((d) => setItems(d.results))
      .catch(() => setItems([]));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const created = await authFetch<MissingChild>("/missing-children/", {
        method: "POST",
        body: {
          name,
          age: Number(age),
          gender,
          guardian_name: guardianName,
          guardian_phone: guardianPhone,
          last_seen_location: location,
          last_seen_at: new Date(lastSeenAt || Date.now()).toISOString(),
          school_name: school,
        },
      });
      setItems((prev) => [created, ...(prev ?? [])]);
      setSubmitted(true);
      setShowForm(false);
      setName(""); setAge(""); setGuardianName(""); setGuardianPhone(""); setLocation(""); setLastSeenAt(""); setSchool("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("nav.missingChildren")}</h1>
        <p className="mt-1 text-foreground/60">{t("mc.sub")}</p>
      </div>

      {/* Report CTA / form */}
      {isAuthenticated ? (
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("mc.report")}
        </button>
      ) : (
        <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          {t("mc.report")}
        </Link>
      )}

      {submitted && (
        <p className="inline-flex items-center gap-2 rounded-lg bg-[#138808]/10 px-3 py-2 text-sm font-medium text-[#138808]">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {t("mc.submitted")}
        </p>
      )}

      {showForm && (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-background p-5 shadow-sm">
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600" role="alert">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">{t("common.name")}<input value={name} onChange={(e) => setName(e.target.value)} required className={`mt-1 ${input}`} /></label>
            <label className="text-sm font-medium">{t("mc.age")}<input value={age} onChange={(e) => setAge(e.target.value)} type="number" min={0} max={17} required className={`mt-1 ${input}`} /></label>
            <label className="text-sm font-medium">{t("common.gender")}
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={`mt-1 ${input}`}>
                <option value="male">{t("common.male")}</option>
                <option value="female">{t("common.female")}</option>
                <option value="other">{t("common.other")}</option>
              </select>
            </label>
            <label className="text-sm font-medium">{t("mc.lastSeenTime")}<input value={lastSeenAt} onChange={(e) => setLastSeenAt(e.target.value)} type="datetime-local" required className={`mt-1 ${input}`} /></label>
            <label className="text-sm font-medium">{t("mc.guardian")}<input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} required className={`mt-1 ${input}`} /></label>
            <label className="text-sm font-medium">{t("mc.guardianPhone")}<input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} type="tel" required className={`mt-1 ${input}`} /></label>
            <label className="text-sm font-medium sm:col-span-2">{t("mc.lastSeen")}<input value={location} onChange={(e) => setLocation(e.target.value)} required className={`mt-1 ${input}`} /></label>
            <label className="text-sm font-medium sm:col-span-2">{t("mc.school")}<input value={school} onChange={(e) => setSchool(e.target.value)} className={`mt-1 ${input}`} /></label>
          </div>
          <button type="submit" disabled={submitting} className="rounded-lg bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {t("common.submit")}
          </button>
        </form>
      )}

      {/* Feed */}
      {items === null ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-surface" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-foreground/60">{t("mc.none")}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((c) => (
            <li key={c.id} className="flex gap-3 rounded-xl border border-border bg-background p-4 shadow-sm">
              {c.photo ? (
                <Image src={c.photo} alt="" width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-surface text-foreground/40">
                  <User className="h-7 w-7" aria-hidden />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{c.name}, {c.age}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.status === "found" ? "bg-[#138808]/10 text-[#138808]" : "bg-red-500/10 text-red-600"}`}>{c.status}</span>
                </div>
                <p className="mt-1 flex items-start gap-1 text-sm text-foreground/60">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {c.last_seen_location}
                </p>
                <p className="mt-1 text-xs text-foreground/45">{new Date(c.last_seen_at).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
