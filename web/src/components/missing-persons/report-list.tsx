"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { MissingPersonReport, PaginatedResponse } from "@/lib/api/types";
import { ReportCard } from "./report-card";

export function ReportList() {
  const { authFetch, isAuthenticated, isLoading: authLoading } = useAuth();
  const [reports, setReports] = useState<MissingPersonReport[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);

  // Guarded so the effect only ever does actual async work — the "not
  // authenticated" case is handled below as a pure render-time branch instead
  // of a setState call, since it isn't the result of an external event.
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let cancelled = false;
    authFetch<PaginatedResponse<MissingPersonReport>>("/missing-persons/")
      .then((data) => {
        if (cancelled) return;
        setReports(data.results);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(extractErrorMessage(err));
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [authFetch, isAuthenticated, authLoading]);

  if (authLoading) {
    return <p className="text-foreground/70">Loading…</p>;
  }

  if (!isAuthenticated) {
    return <p role="alert" className="text-red-600">Log in to view missing person reports.</p>;
  }

  if (status === "loading") {
    return <p className="text-foreground/70">Loading…</p>;
  }

  if (status === "error") {
    return <p role="alert" className="text-red-600">{error}</p>;
  }

  if (reports.length === 0) {
    return <p className="text-foreground/70">No missing person reports yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </ul>
  );
}

export function ReportListHeader() {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Missing Persons</h1>
      <Link href="/missing-persons/new" className="rounded-md bg-foreground px-4 py-2 text-sm text-background">
        Report someone missing
      </Link>
    </div>
  );
}
