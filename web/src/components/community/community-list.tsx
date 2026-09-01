"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { canOrganize } from "@/lib/auth/roles";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { Community, PaginatedResponse } from "@/lib/api/types";

export function CommunityListHeader() {
  const { user } = useAuth();
  const { t } = useLanguage();
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{t("community.list.heading")}</h1>
      {canOrganize(user?.role, user?.is_verified) && (
        <Link href="/community/new" className="rounded-md bg-foreground px-4 py-2 text-sm text-background">
          {t("community.list.startButton")}
        </Link>
      )}
    </div>
  );
}

export function CommunityList() {
  const { t } = useLanguage();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<PaginatedResponse<Community>>("/community/")
      .then((data) => {
        setCommunities(data.results);
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
  if (communities.length === 0) return <p className="text-foreground/70">{t("community.list.empty")}</p>;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {communities.map((c) => (
        <li key={c.id} className="rounded-lg border border-border p-4">
          <h3 className="font-medium">{c.name}</h3>
          {c.city && <p className="mt-1 text-sm text-foreground/70">{c.city}</p>}
          <p className="mt-1 text-xs text-foreground/50">
            {t("community.list.byPrefix")} {c.owner_name}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-foreground/50">
              {c.member_count} {t("community.list.membersSuffix")}
            </span>
            <Link
              href={`/community/${c.id}`}
              className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface"
            >
              {t("community.list.viewButton")}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
