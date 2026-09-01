"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { AdminUser, PaginatedResponse } from "@/lib/api/types";

export function AdminNgoQueue() {
  const { authFetch } = useAuth();
  const { t } = useLanguage();
  const [pending, setPending] = useState<AdminUser[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    authFetch<PaginatedResponse<AdminUser>>("/admin-panel/users/pending-ngo-verifications/")
      .then((data) => {
        setPending(data.results);
        setStatus("ready");
      })
      .catch((err) => {
        setError(extractErrorMessage(err));
        setStatus("error");
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authFetch]);

  async function runAction(id: string, action: "verify" | "reject") {
    setBusyId(id);
    try {
      await authFetch(`/admin-panel/users/${id}/${action}/`, { method: "POST" });
      setPending((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  if (status === "loading") return <p className="text-foreground/70">{t("common.loading")}</p>;
  if (error) return <p role="alert" className="text-red-600">{error}</p>;
  if (pending.length === 0) return <p className="text-foreground/70">{t("admin.ngoQueueEmpty")}</p>;

  return (
    <ul className="flex flex-col gap-2">
      {pending.map((u) => (
        <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
          <div>
            <p className="font-medium">{u.organization_name ?? u.full_name}</p>
            <p className="text-xs text-foreground/60">
              {u.full_name} · {u.email ?? u.phone} {u.city && `· ${u.city}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busyId === u.id}
              onClick={() => runAction(u.id, "verify")}
              className="rounded-md bg-foreground px-3 py-1 text-sm text-background disabled:opacity-50"
            >
              {t("admin.approve")}
            </button>
            <button
              type="button"
              disabled={busyId === u.id}
              onClick={() => runAction(u.id, "reject")}
              className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface disabled:opacity-50"
            >
              {t("admin.reject")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
