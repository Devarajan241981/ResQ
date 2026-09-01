"use client";

import { BarChart3, Building2, LayoutDashboard, Users, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { AdminNgoQueue } from "./admin-ngo-queue";
import { AdminSummary } from "./admin-summary";
import { AdminUsers } from "./admin-users";

type SectionId = "overview" | "ngo" | "users";

const SECTIONS: { id: SectionId; icon: LucideIcon; labelKey: TranslationKey }[] = [
  { id: "overview", icon: BarChart3, labelKey: "admin.overviewHeading" },
  { id: "ngo", icon: Building2, labelKey: "admin.ngoQueueHeading" },
  { id: "users", icon: Users, labelKey: "admin.usersHeading" },
];

function initialsOf(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function AdminDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [active, setActive] = useState<SectionId>("overview");

  const activeSection = SECTIONS.find((s) => s.id === active)!;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 lg:shrink-0">
        <div className="rounded-2xl border border-border bg-background p-3 shadow-sm lg:sticky lg:top-20">
          {/* Console identity */}
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-[#123a6b] to-[#0f2f56] px-3 py-3 text-white">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15 text-sm font-semibold backdrop-blur-sm">
              {user ? initialsOf(user.full_name) : "A"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.full_name ?? t("admin.heading")}</p>
              <p className="flex items-center gap-1 text-[11px] text-white/70">
                <LayoutDashboard className="h-3 w-3" aria-hidden />
                {t("admin.heading")}
              </p>
            </div>
          </div>

          {/* Section nav */}
          <nav className="mt-2 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === active;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActive(section.id)}
                  aria-current={isActive}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:w-full ${
                    isActive ? "bg-[#123a6b] text-white shadow-sm" : "text-foreground/70 hover:bg-surface"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{t(section.labelKey)}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Section content */}
      <div className="min-w-0 flex-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <activeSection.icon className="h-6 w-6 text-[#123a6b] dark:text-blue-400" aria-hidden />
          {t(activeSection.labelKey)}
        </h1>

        <div className="mt-5">
          {active === "overview" && <AdminSummary />}
          {active === "ngo" && <AdminNgoQueue />}
          {active === "users" && <AdminUsers />}
        </div>
      </div>
    </div>
  );
}
