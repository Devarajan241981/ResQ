"use client";

import Image from "next/image";
import { MapPin, MessageCircle, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PublicFeedReport } from "@/lib/api/types";
import { StatusBadge } from "./status-badge";

interface Props {
  report: PublicFeedReport;
  onOpen: (report: PublicFeedReport) => void;
}

export function ReportCard({ report, onOpen }: Props) {
  const { t } = useLanguage();
  const photo = report.photos[0]?.image ?? null;

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      {/* Feed-post header: avatar, name/age, status */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-foreground/60">
          <User className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight">
            {report.name}, {report.age}
          </h3>
          <p className="flex items-center gap-1 truncate text-xs text-foreground/60">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            {report.last_seen_location}
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      {/* Post image — clicking anywhere opens the full post like Instagram */}
      <button type="button" onClick={() => onOpen(report)} className="block w-full text-left">
        <div className="relative aspect-square bg-surface">
          {photo ? (
            <Image src={photo} alt={report.name} fill sizes="(max-width: 640px) 100vw, 36rem" className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-foreground/30">
              <User className="h-20 w-20" aria-hidden />
            </div>
          )}
        </div>

        <div className="px-4 py-3">
          <p className="text-sm text-foreground/80">
            {t("missingPersons.card.lastSeen")} {report.last_seen_location}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#123a6b] dark:text-blue-400">
            <MessageCircle className="h-4 w-4" aria-hidden />
            {t("feed.openPost")}
          </p>
        </div>
      </button>
    </li>
  );
}
