"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { PublicMissingPersonReport } from "@/lib/api/types";
import { StatusBadge } from "./status-badge";

export function PublicReportView({ slug }: { slug: string }) {
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
    return <p className="text-foreground/70">Loading…</p>;
  }

  return (
    <article className="mx-auto max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{report.name}</h1>
        <StatusBadge status={report.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-foreground/50">Age</dt>
          <dd>{report.age}</dd>
        </div>
        <div>
          <dt className="text-foreground/50">Gender</dt>
          <dd className="capitalize">{report.gender}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-foreground/50">Last seen</dt>
          <dd>
            {report.last_seen_location} — {new Date(report.last_seen_at).toLocaleString()}
          </dd>
        </div>
        {report.clothing_description && (
          <div className="col-span-2">
            <dt className="text-foreground/50">Clothing</dt>
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
              alt={`Photo of ${report.name}`}
              width={150}
              height={150}
              className="rounded-md object-cover"
              unoptimized
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-foreground/50">
        If you have information about this person, please contact local authorities or the platform&apos;s
        support team immediately.
      </p>
    </article>
  );
}
