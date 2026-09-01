"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PublicMissingPersonReport } from "@/lib/api/types";
import { StatusBadge } from "./status-badge";

export function PublicReportView({ slug }: { slug: string }) {
  const { t } = useLanguage();
  const [report, setReport] = useState<PublicMissingPersonReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<PublicMissingPersonReport>(`/missing-persons/public/${slug}/`)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return <p role="alert" className="text-red-600">{error}</p>;
  }

  if (!report) {
    return <p className="text-foreground/70">{t("common.loading")}</p>;
  }

  return (
    <article className="mx-auto max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{report.name}</h1>
        <StatusBadge status={report.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-foreground/50">{t("missingPersons.public.age")}</dt>
          <dd>{report.age}</dd>
        </div>
        <div>
          <dt className="text-foreground/50">{t("missingPersons.public.gender")}</dt>
          <dd className="capitalize">{report.gender}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-foreground/50">{t("missingPersons.public.lastSeen")}</dt>
          <dd>
            {report.last_seen_location} — {new Date(report.last_seen_at).toLocaleString()}
          </dd>
        </div>
        {report.clothing_description && (
          <div className="col-span-2">
            <dt className="text-foreground/50">{t("missingPersons.public.clothing")}</dt>
            <dd>{report.clothing_description}</dd>
          </div>
        )}
      </dl>

      {report.photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {report.photos.map((photo) => (
            <Image
              key={photo.id}
              src={photo.image}
              alt={`${t("missingPersons.public.photoAlt")} ${report.name}`}
              width={150}
              height={150}
              className="rounded-md object-cover"
              unoptimized
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-foreground/50">{t("missingPersons.public.disclaimer")}</p>
    </article>
  );
}
