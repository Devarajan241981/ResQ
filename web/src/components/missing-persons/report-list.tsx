"use client";

import Link from "next/link";
import { HeartHandshake, Info, Siren } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { PaginatedResponse, PublicFeedReport } from "@/lib/api/types";
import { ReportCard } from "./report-card";
import { ReportPostModal } from "./report-post-modal";

export function ReportList() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<PublicFeedReport[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [openReport, setOpenReport] = useState<PublicFeedReport | null>(null);

  useEffect(() => {
    let cancelled = false;
    // The feed is a public surface — no login needed to browse or share.
    apiFetch<PaginatedResponse<PublicFeedReport>>("/missing-persons/")
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
  }, []);

  if (status === "loading") {
    return <p className="text-foreground/70">{t("common.loading")}</p>;
  }

  if (status === "error") {
    return <p role="alert" className="text-red-600">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Feed column — pinned to the left on laptop screens */}
      <div className="w-full max-w-xl">
        {reports.length === 0 ? (
          <p className="text-foreground/70">{t("missingPersons.list.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} onOpen={setOpenReport} />
            ))}
          </ul>
        )}
      </div>

      {/* Helper sidebar on larger screens */}
      <aside className="hidden w-72 shrink-0 flex-col gap-4 lg:flex">
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Siren className="h-4 w-4 text-red-600" aria-hidden />
            {t("feed.sidebar.spottedHeading")}
          </h2>
          <p className="mt-2 text-sm text-foreground/70">{t("feed.sidebar.spottedBody")}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <HeartHandshake className="h-4 w-4 text-[#138808]" aria-hidden />
            {t("feed.sidebar.shareHeading")}
          </h2>
          <p className="mt-2 text-sm text-foreground/70">{t("feed.sidebar.shareBody")}</p>
        </div>
        <div className="rounded-xl border border-[#FF9933]/40 bg-[#FF9933]/10 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4 text-[#FF9933]" aria-hidden />
            {t("feed.sidebar.emergencyHeading")}
          </h2>
          <p className="mt-2 text-sm text-foreground/70">{t("feed.sidebar.emergencyBody")}</p>
        </div>
      </aside>

      {openReport && <ReportPostModal report={openReport} onClose={() => setOpenReport(null)} />}
    </div>
  );
}

export function ReportListHeader() {
  const { t } = useLanguage();
  // The page banner (PageHero) already carries the page title.
  return (
    <div className="mb-6 flex w-full max-w-xl justify-end">
      <Link href="/missing-persons/new" className="rounded-md bg-foreground px-4 py-2 text-sm text-background">
        {t("missingPersons.list.reportButton")}
      </Link>
    </div>
  );
}
