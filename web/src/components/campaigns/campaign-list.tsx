"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { canOrganize } from "@/lib/auth/roles";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { Campaign, PaginatedResponse } from "@/lib/api/types";
import { CATEGORY_LABEL_KEYS } from "./category-label";

export function CampaignListHeader() {
  const { user } = useAuth();
  const { t } = useLanguage();
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{t("campaigns.list.heading")}</h1>
      {canOrganize(user?.role, user?.is_verified) && (
        <Link href="/campaigns/new" className="rounded-md bg-foreground px-4 py-2 text-sm text-background">
          {t("campaigns.list.startButton")}
        </Link>
      )}
    </div>
  );
}

export function CampaignList() {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<PaginatedResponse<Campaign>>("/campaigns/?status=published")
      .then((data) => {
        setCampaigns(data.results);
        setStatus("ready");
      })
      .catch((err) => {
        setError(extractErrorMessage(err));
        setStatus("error");
      });
  }, []);

  if (status === "loading") return <p className="text-foreground/70">{t("common.loading")}</p>;
  if (status === "error")
    return (
      <p role="alert" className="text-red-600">
        {error}
      </p>
    );
  if (campaigns.length === 0) return <p className="text-foreground/70">{t("campaigns.list.empty")}</p>;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((c) => (
        <li key={c.id} className="rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
            {t(CATEGORY_LABEL_KEYS[c.category])}
          </span>
          <h3 className="mt-1 font-medium">{c.title}</h3>
          <p className="mt-1 text-sm text-foreground/70">
            {c.city} · {new Date(c.starts_at).toLocaleDateString()}
          </p>
          <p className="mt-1 text-xs text-foreground/50">
            {t("campaigns.list.byPrefix")} {c.organizer_name}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-foreground/50">
              {c.available_slots === null
                ? `${c.registered_count} ${t("campaigns.list.registeredSuffix")}`
                : `${c.available_slots} ${t("campaigns.list.slotsLeftSuffix")}`}
            </span>
            <Link
              href={`/campaigns/${c.id}`}
              className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface"
            >
              {t("campaigns.list.viewButton")}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
