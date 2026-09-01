"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Siren, User, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { PublicFeedReport, ReportComment } from "@/lib/api/types";
import { StatusBadge } from "./status-badge";

interface Props {
  report: PublicFeedReport;
  onClose: () => void;
}

export function ReportPostModal({ report, onClose }: Props) {
  const { authFetch, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [comments, setComments] = useState<ReportComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const [showSighting, setShowSighting] = useState(false);
  const [sightingLocation, setSightingLocation] = useState("");
  const [sightingDetails, setSightingDetails] = useState("");
  const [isSendingSighting, setIsSendingSighting] = useState(false);
  const [sightingSent, setSightingSent] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ReportComment[]>(`/missing-persons/${report.id}/comments/`)
      .then(setComments)
      .catch(() => setComments([]));
  }, [report.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsCommenting(true);
    try {
      const comment = await authFetch<ReportComment>(`/missing-persons/${report.id}/comments/`, {
        method: "POST",
        body: { content: newComment },
      });
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsCommenting(false);
    }
  }

  async function handleSighting(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSendingSighting(true);
    try {
      await authFetch(`/missing-persons/${report.id}/sightings/`, {
        method: "POST",
        body: {
          description: sightingDetails,
          location_text: sightingLocation,
          sighted_at: new Date().toISOString(),
        },
      });
      setSightingSent(true);
      setShowSighting(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSendingSighting(false);
    }
  }

  const photo = report.photos[0]?.image ?? null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={report.name}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-background text-foreground sm:flex-row sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo side */}
        <div className="relative aspect-square w-full shrink-0 bg-surface sm:aspect-auto sm:w-1/2">
          {photo ? (
            <Image src={photo} alt={report.name} fill sizes="(max-width: 640px) 100vw, 24rem" className="object-cover" />
          ) : (
            <div className="grid h-full min-h-52 w-full place-items-center text-foreground/30">
              <User className="h-20 w-20" aria-hidden />
            </div>
          )}
        </div>

        {/* Details side */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold">
                {report.name}, {report.age}
              </h2>
              <p className="flex items-center gap-1 truncate text-xs text-foreground/60">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                {report.last_seen_location}
              </p>
            </div>
            <StatusBadge status={report.status} />
            <button type="button" aria-label={t("common.close")} onClick={onClose} className="rounded-md p-1.5 hover:bg-surface">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-foreground/50">{t("feed.lastSeenAt")}</dt>
                <dd>{new Date(report.last_seen_at).toLocaleString()}</dd>
              </div>
              {report.clothing_description && (
                <div className="col-span-2">
                  <dt className="text-xs text-foreground/50">{t("feed.clothing")}</dt>
                  <dd>{report.clothing_description}</dd>
                </div>
              )}
            </dl>

            {/* "I spotted them" — the buzzer to the family */}
            <div className="mt-4">
              {sightingSent ? (
                <p role="status" className="rounded-md bg-[#138808]/10 px-3 py-2 text-sm text-[#138808]">
                  {t("feed.alertSent")}
                </p>
              ) : showSighting ? (
                <form onSubmit={handleSighting} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                  <label className="flex flex-col gap-1 text-xs text-foreground/70">
                    {t("feed.sightingLocation")}
                    <input
                      required
                      value={sightingLocation}
                      onChange={(e) => setSightingLocation(e.target.value)}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-foreground/70">
                    {t("feed.sightingDetails")}
                    <textarea
                      required
                      rows={2}
                      value={sightingDetails}
                      onChange={(e) => setSightingDetails(e.target.value)}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isSendingSighting}
                    className="self-end rounded-md bg-red-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {t("feed.sendAlert")}
                  </button>
                </form>
              ) : isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setShowSighting(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <Siren className="h-4 w-4" aria-hidden />
                  {t("feed.spottedButton")}
                </button>
              ) : (
                <p className="text-xs text-foreground/60">
                  <Link href="/login" className="underline">
                    {t("feed.loginToHelp")}
                  </Link>
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Comments */}
            <h3 className="mt-5 text-sm font-semibold">{t("feed.comments")}</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {comments.length === 0 && <li className="text-sm text-foreground/50">{t("feed.noComments")}</li>}
              {comments.map((c) => (
                <li key={c.id} className="rounded-lg bg-surface px-3 py-2">
                  <p className="text-xs font-semibold">{c.author_name}</p>
                  <p className="text-sm">{c.content}</p>
                  <p className="mt-0.5 text-[10px] text-foreground/45">{new Date(c.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>

          {isAuthenticated && (
            <form onSubmit={handleComment} className="flex items-end gap-2 border-t border-border px-3 py-2.5">
              <input
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t("feed.commentPlaceholder")}
                aria-label={t("feed.commentPlaceholder")}
                className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground"
              />
              <button
                type="submit"
                disabled={isCommenting}
                className="shrink-0 rounded-full bg-[#123a6b] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {t("feed.commentPost")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
