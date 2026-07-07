"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { extractErrorMessage } from "@/lib/api/client";
import { getCurrentPosition } from "@/lib/geolocation";
import type { PaginatedResponse, SOSAlert } from "@/lib/api/types";

export function SosPanel() {
  const { authFetch, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeAlert, setActiveAlert] = useState<SOSAlert | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    authFetch<PaginatedResponse<SOSAlert>>("/sos/alerts/")
      .then((data) => {
        setActiveAlert(data.results.find((a) => a.status === "active") ?? null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoaded(true));
  }, [authFetch, isAuthenticated, authLoading]);

  async function handleTrigger() {
    setError(null);
    setIsTriggering(true);
    try {
      const position = await getCurrentPosition();
      const alert = await authFetch<SOSAlert>("/sos/alerts/", {
        method: "POST",
        body: { notes: "", latitude: position.latitude, longitude: position.longitude },
      });
      setActiveAlert(alert);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsTriggering(false);
    }
  }

  async function handleResolve(action: "resolve" | "cancel") {
    if (!activeAlert) return;
    setIsResolving(true);
    setError(null);
    try {
      const updated = await authFetch<SOSAlert>(`/sos/alerts/${activeAlert.id}/${action}/`, { method: "POST" });
      setActiveAlert(updated.status === "active" ? updated : null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsResolving(false);
    }
  }

  if (!authLoading && !isAuthenticated) {
    return <p role="alert" className="text-red-600">Log in to use the SOS feature.</p>;
  }

  return (
    <div className="mx-auto max-w-sm text-center">
      {error && (
        <p role="alert" className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {loaded && activeAlert ? (
        <div className="rounded-lg border border-red-500 p-6">
          <p className="text-lg font-semibold text-red-600">SOS alert is active</p>
          <p className="mt-1 text-sm text-foreground/70">
            Your trusted contacts and nearby volunteers have been notified.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              disabled={isResolving}
              onClick={() => handleResolve("resolve")}
              className="rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
            >
              I&apos;m safe now
            </button>
            <button
              type="button"
              disabled={isResolving}
              onClick={() => handleResolve("cancel")}
              className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-50"
            >
              Cancel alert
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleTrigger}
          disabled={isTriggering}
          aria-label="Trigger SOS emergency alert"
          className="h-40 w-40 rounded-full bg-red-600 text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
        >
          {isTriggering ? "Sending…" : "SOS"}
        </button>
      )}
    </div>
  );
}
