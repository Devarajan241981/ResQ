"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { BloodGroup, BloodRequest, Urgency } from "@/lib/api/types";

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCIES: Urgency[] = ["normal", "urgent", "critical"];

export function RequestForm() {
  const router = useRouter();
  const { authFetch } = useAuth();

  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [city, setCity] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("urgent");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch<BloodRequest>("/blood-donation/requests/", {
        method: "POST",
        body: {
          patient_name: patientName,
          blood_group: bloodGroup,
          units_needed: Number(unitsNeeded),
          city,
          urgency,
          notes,
        },
      });
      router.push("/blood-donation");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">Post a blood request</h1>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Patient name
          <input required value={patientName} onChange={(e) => setPatientName(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Blood group
            <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value as BloodGroup)} className="rounded-md border border-border bg-background px-3 py-2">
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Units needed
            <input type="number" min={1} required value={unitsNeeded} onChange={(e) => setUnitsNeeded(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          City
          <input required value={city} onChange={(e) => setCity(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Urgency
          <select value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)} className="rounded-md border border-border bg-background px-3 py-2">
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <button type="submit" disabled={isSubmitting} className="mt-2 rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50">
          {isSubmitting ? "Posting…" : "Post request"}
        </button>
      </form>
    </div>
  );
}
