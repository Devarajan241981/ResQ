"use client";

import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { BloodRequest, PaginatedResponse } from "@/lib/api/types";
import { UrgencyBadge } from "./urgency-badge";

export function RequestListHeader() {
  const { t } = useLanguage();
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{t("bloodDonation.list.heading")}</h1>
      <Link href="/blood-donation/new" className="rounded-md bg-foreground px-4 py-2 text-sm text-background">
        {t("bloodDonation.list.postButton")}
      </Link>
    </div>
  );
}

export function RequestList() {
  const { authFetch, isAuthenticated } = useAuth();
  const { t } = useLanguage();
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

  if (status === "loading") return <p className="text-foreground/70">{t("common.loading")}</p>;
  if (status === "error") return <p role="alert" className="text-red-600">{error}</p>;
  if (requests.length === 0) return <p className="text-foreground/70">{t("bloodDonation.list.empty")}</p>;

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {requests.map((req) => (
        <li key={req.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <div className="flex items-start gap-3 p-4">
            {/* Blood-group badge — semantic red disc, not a flag edge */}
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-red-600 text-lg font-extrabold text-white shadow-inner">
              {req.blood_group}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight">
                  {t("bloodDonation.list.forWord")} {req.patient_name}
                </h3>
                <UrgencyBadge urgency={req.urgency} />
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-foreground/60">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {req.city} · {req.units_needed} {t("bloodDonation.list.unitSuffix")}
              </p>
              {req.notes && <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{req.notes}</p>}
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-border bg-surface/50 px-4 py-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-foreground/55">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {req.responses.length} {t("bloodDonation.list.respondersSuffix")}
            </span>
            {isAuthenticated && req.status === "open" ? (
              <button
                type="button"
                disabled={respondingId === req.id}
                onClick={() => handleRespond(req.id)}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {t("bloodDonation.list.donateButton")}
              </button>
            ) : (
              <span className="text-xs font-medium capitalize text-foreground/45">{req.status}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
