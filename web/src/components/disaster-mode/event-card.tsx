"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { DisasterEvent, NeedType, StatusReport } from "@/lib/api/types";

const NEED_TYPES: { value: NeedType; label: string }[] = [
  { value: "safe", label: "Mark myself safe" },
  { value: "need_rescue", label: "Need rescue" },
  { value: "need_food", label: "Need food" },
  { value: "need_water", label: "Need water" },
  { value: "need_medicine", label: "Need medicine" },
];

export function EventCard({ event }: { event: DisasterEvent }) {
  const { authFetch, isAuthenticated } = useAuth();
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
      <p className="mt-2 text-xs text-foreground/50">{event.open_needs_count} open need(s) reported</p>

      {isAuthenticated && (
        <div className="mt-3 border-t border-border pt-3">
          {submitted ? (
            <p className="text-sm text-green-600">Thanks — your status has been reported.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
              {error && (
                <p role="alert" className="w-full text-sm text-red-600">
                  {error}
                </p>
              )}
              <label className="flex flex-col gap-1 text-sm">
                <span className="sr-only">Status</span>
                <select
                  value={needType}
                  onChange={(e) => setNeedType(e.target.value as NeedType)}
                  aria-label={`Status for ${event.name}`}
                  className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                >
                  {NEED_TYPES.map((n) => (
                    <option key={n.value} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                aria-label={`Notes for ${event.name}`}
                className="min-w-40 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-50"
              >
                {isSubmitting ? "Sending…" : "Report status"}
              </button>
            </form>
          )}
        </div>
      )}
    </li>
  );
}
