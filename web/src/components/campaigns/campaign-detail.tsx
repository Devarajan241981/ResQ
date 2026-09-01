"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { Campaign } from "@/lib/api/types";
import { CATEGORY_LABEL_KEYS } from "./category-label";

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const { authFetch, isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const [notes, setNotes] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill the registration fields once the (async-loaded) user becomes
  // available. Done as a render-time state adjustment — not an effect —
  // since `user` arrives after mount and this only needs to run once per
  // user id, not resync on every render.
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (user && user.id !== prefilledFor) {
    setPrefilledFor(user.id);
    setFullName(user.full_name);
    setPhone(user.phone ?? "");
    setEmail(user.email ?? "");
  }

  useEffect(() => {
    apiFetch<Campaign>(`/campaigns/${campaignId}/`)
      .then((data) => {
        setCampaign(data);
        setStatus("ready");
      })
      .catch((err) => {
        setError(extractErrorMessage(err));
        setStatus("error");
      });
  }, [campaignId]);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setRegisterError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/campaigns/registrations/", {
        method: "POST",
        body: { campaign: campaignId, full_name: fullName, phone, email, team_name: teamName, notes },
      });
      setRegistered(true);
      setCampaign((prev) =>
        prev
          ? {
              ...prev,
              registered_count: prev.registered_count + 1,
              available_slots: prev.available_slots === null ? null : prev.available_slots - 1,
            }
          : prev,
      );
    } catch (err) {
      setRegisterError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "loading") return <p className="text-foreground/70">{t("common.loading")}</p>;
  if (status === "error" || !campaign)
    return (
      <p role="alert" className="text-red-600">
        {error}
      </p>
    );

  const isFull = campaign.available_slots !== null && campaign.available_slots <= 0;
  const isClosed = campaign.status !== "published";

  return (
    <div className="mx-auto max-w-lg">
      <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
        {t(CATEGORY_LABEL_KEYS[campaign.category])}
      </span>
      <h1 className="mt-1 text-2xl font-semibold">{campaign.title}</h1>
      <p className="mt-1 text-sm text-foreground/70">
        {campaign.city}
        {campaign.venue && ` · ${campaign.venue}`} · {new Date(campaign.starts_at).toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-foreground/50">
        {t("campaigns.detail.organizedByPrefix")} {campaign.organizer_name}
      </p>
      {campaign.description && <p className="mt-4 whitespace-pre-wrap text-sm">{campaign.description}</p>}

      <p className="mt-4 text-sm text-foreground/70">
        {campaign.available_slots === null
          ? `${campaign.registered_count} ${t("campaigns.detail.registeredSoFarSuffix")}`
          : `${campaign.available_slots} ${t("campaigns.detail.slotsOfPrefix")} ${campaign.capacity} ${t("campaigns.detail.slotsLeftSuffix")}`}
      </p>

      {registered ? (
        <p role="status" className="mt-6 rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-700">
          {t("campaigns.detail.registeredConfirmation")}
        </p>
      ) : !isAuthenticated ? (
        <p className="mt-6 text-sm text-foreground/70">{t("campaigns.detail.loginToRegister")}</p>
      ) : isClosed ? (
        <p className="mt-6 text-sm text-foreground/70">{t("campaigns.detail.closedMessage")}</p>
      ) : isFull ? (
        <p className="mt-6 text-sm text-foreground/70">{t("campaigns.detail.fullMessage")}</p>
      ) : (
        <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-3 rounded-lg border border-border p-4">
          <h2 className="font-medium">{t("campaigns.detail.registerHeading")}</h2>

          {registerError && (
            <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {registerError}
            </p>
          )}

          <label className="flex flex-col gap-1 text-sm">
            {t("campaigns.detail.fullName")}
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("common.phone")}
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("campaigns.detail.emailOptional")}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          {campaign.category === "hackathon" && (
            <label className="flex flex-col gap-1 text-sm">
              {t("campaigns.detail.teamNameOptional")}
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm">
            {t("campaigns.detail.notesOptional")}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
          >
            {isSubmitting ? t("campaigns.detail.registering") : t("campaigns.detail.registerButton")}
          </button>
        </form>
      )}
    </div>
  );
}
