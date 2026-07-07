import Link from "next/link";
import type { MissingPersonReport } from "@/lib/api/types";
import { StatusBadge } from "./status-badge";

export function ReportCard({ report }: { report: MissingPersonReport }) {
  return (
    <li className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium">
            {report.name}, {report.age}
          </h3>
          <p className="text-sm text-foreground/70">Last seen: {report.last_seen_location}</p>
        </div>
        <StatusBadge status={report.status} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-foreground/50">
          Risk score: {report.risk_score} · {report.photos.length} photo(s)
        </span>
        <Link href={`/missing-persons/share/${report.public_slug}`} className="text-sm underline">
          View public page
        </Link>
      </div>
    </li>
  );
}
