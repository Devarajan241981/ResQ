"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { BloodRequest, PaginatedResponse } from "@/lib/api/types";
import { UrgencyBadge } from "./urgency-badge";

export function RequestListHeader() {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Blood Donation Requests</h1>
      <Link href="/blood-donation/new" className="rounded-md bg-foreground px-4 py-2 text-sm text-background">
        Post a request
      </Link>
    </div>
  );
}

export function RequestList() {
  const { authFetch, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<PaginatedResponse<BloodRequest>>("/blood-donation/requests/")
      .then((data) => {
        setRequests(data.results);
        setStatus("ready");
      })
      .catch((err) => {
        setError(extractErrorMessage(err));
        setStatus("error");
      });
  }, []);

  async function handleRespond(id: string) {
    setRespondingId(id);
    try {
      await authFetch(`/blood-donation/requests/${id}/respond/`, { method: "POST" });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, responses: [...r.responses, { id: "pending", donor: "", donor_name: "You", status: "offered", created_at: new Date().toISOString() }] } : r)),
      );
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setRespondingId(null);
    }
  }

  if (status === "loading") return <p className="text-foreground/70">Loading…</p>;
  if (status === "error") return <p role="alert" className="text-red-600">{error}</p>;
  if (requests.length === 0) return <p className="text-foreground/70">No blood requests right now.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {requests.map((req) => (
        <li key={req.id} className="rounded-lg border border-border p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium">
                {req.blood_group} for {req.patient_name} · {req.units_needed} unit(s)
              </h3>
              <p className="text-sm text-foreground/70">{req.city}</p>
              {req.notes && <p className="mt-1 text-sm">{req.notes}</p>}
            </div>
            <UrgencyBadge urgency={req.urgency} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-foreground/50">
              {req.responses.length} donor(s) responded · status: {req.status}
            </span>
            {isAuthenticated && req.status === "open" && (
              <button
                type="button"
                disabled={respondingId === req.id}
                onClick={() => handleRespond(req.id)}
                className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface disabled:opacity-50"
              >
                I can donate
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
