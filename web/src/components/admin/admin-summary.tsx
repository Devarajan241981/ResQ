"use client";

import {
  Building2,
  CloudRain,
  HeartHandshake,
  Megaphone,
  ShieldAlert,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { PlatformSummary } from "@/lib/api/types";

// Semantic per-metric colours (soft filled icon chips, not flag edges).
interface StatDef {
  label: string;
  value: number | string;
  icon: LucideIcon;
  chip: string;
  emphasize?: boolean;
}

function StatCard({ stat }: { stat: StatDef }) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        stat.emphasize && Number(stat.value) > 0 ? "border-red-500/40 bg-red-500/5" : "border-border bg-background"
      }`}
    >
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${stat.chip}`}>
        <stat.icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-3 text-3xl font-bold leading-none">{stat.value}</p>
      <p className="mt-1.5 text-sm text-foreground/60">{stat.label}</p>
    </div>
  );
}

const DONUT_COLORS = ["#123a6b", "#FF9933", "#138808", "#dc2626", "#4f46e5", "#0891b2", "#9333ea", "#64748b"];

function BreakdownCard({ heading, data }: { heading: string; data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, n]) => n > 0);
  const total = entries.reduce((sum, [, n]) => sum + n, 0);

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <h3 className="text-sm font-semibold">{heading}</h3>
        <p className="mt-6 text-center text-sm text-foreground/45">—</p>
      </div>
    );
  }

  let acc = 0;
  const stops = entries
    .map(([, n], i) => {
      const start = (acc / total) * 360;
      acc += n;
      const end = (acc / total) * 360;
      return `${DONUT_COLORS[i % DONUT_COLORS.length]} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
      <h3 className="text-sm font-semibold">{heading}</h3>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops})` }}>
          <div className="absolute inset-[24%] grid place-items-center rounded-full bg-background">
            <span className="text-lg font-bold">{total}</span>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-1.5">
          {entries.map(([key, count], i) => (
            <li key={key} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
              <span className="min-w-0 flex-1 truncate capitalize text-foreground/70">{key.replace(/_/g, " ")}</span>
              <span className="font-semibold">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AdminSummary() {
  const { authFetch } = useAuth();
  const { t } = useLanguage();
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authFetch<PlatformSummary>("/analytics/summary/")
      .then(setSummary)
      .catch((err) => setError(extractErrorMessage(err)));
  }, [authFetch]);

  if (error) return <p role="alert" className="text-red-600">{error}</p>;
  if (!summary) return <p className="text-foreground/70">{t("common.loading")}</p>;

  const stats: StatDef[] = [
    { label: t("admin.statTotalUsers"), value: summary.total_users, icon: Users, chip: "bg-[#123a6b]/10 text-[#123a6b] dark:bg-blue-400/10 dark:text-blue-300" },
    { label: t("admin.statPendingNgo"), value: summary.pending_ngo_verifications, icon: Building2, chip: "bg-[#FF9933]/15 text-[#b25f0e] dark:text-[#FF9933]", emphasize: true },
    { label: t("admin.statActiveSos"), value: summary.active_sos_alerts, icon: ShieldAlert, chip: "bg-red-500/10 text-red-600", emphasize: true },
    { label: t("admin.statActiveDisasters"), value: summary.active_disaster_events, icon: CloudRain, chip: "bg-orange-500/10 text-orange-600", emphasize: true },
    { label: t("admin.statVerifiedVolunteers"), value: summary.verified_volunteers, icon: HeartHandshake, chip: "bg-[#138808]/10 text-[#138808]" },
    { label: t("admin.statPublishedCampaigns"), value: summary.published_campaigns, icon: Megaphone, chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300" },
    { label: t("admin.statCommunities"), value: summary.total_communities, icon: UsersRound, chip: "bg-teal-500/10 text-teal-600" },
  ];

  return (
    <div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </dl>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BreakdownCard heading={t("admin.breakdownUsersByRole")} data={summary.users_by_role} />
        <BreakdownCard heading={t("admin.breakdownMissingByStatus")} data={summary.missing_persons_by_status} />
        <BreakdownCard heading={t("admin.breakdownBloodByUrgency")} data={summary.open_blood_requests_by_urgency} />
        <BreakdownCard heading={t("admin.breakdownCampaignsByStatus")} data={summary.campaigns_by_status} />
      </div>
    </div>
  );
}
