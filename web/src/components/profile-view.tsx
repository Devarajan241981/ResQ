"use client";

import Link from "next/link";
import { CheckCircle2, LogOut, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { extractErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import type { User } from "@/lib/api/types";
import { LanguageModal } from "./language-modal";
import { ThemeToggle } from "./theme-toggle";

function initialsOf(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function ProfileForm({ user }: { user: User }) {
  const { t } = useLanguage();
  const { authFetch, reloadUser, logout } = useAuth();
  const [fullName, setFullName] = useState(user.full_name);
  const [city, setCity] = useState(user.city ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);
    try {
      await authFetch("/auth/me/", { method: "PATCH", body: { full_name: fullName, city, phone } });
      await reloadUser();
      setSaved(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-[var(--brand)]";
  const card = "rounded-2xl border border-border bg-background p-6 shadow-sm";

  return (
    <div className="space-y-6">
      {/* Identity card */}
      <div className={`${card} flex items-center gap-4`}>
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[color:var(--brand)]/10 text-xl font-bold text-[color:var(--brand)]">
          {initialsOf(user.full_name)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{user.full_name}</h1>
          {user.email && <p className="truncate text-sm text-foreground/60">{user.email}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-surface px-2.5 py-1 font-medium capitalize">{user.role.replace("_", " ")}</span>
            {user.is_verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#138808]/10 px-2.5 py-1 font-medium text-[#138808]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {t("profile.phoneVerified")}
              </span>
            ) : (
              <Link href="/verify-phone" className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 font-medium text-red-600 hover:bg-red-500/20">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
                {t("verify.title")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={save} className={`${card} space-y-4`}>
        <h2 className="font-semibold">{t("profile.editHeading")}</h2>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600" role="alert">{error}</p>}
        <div>
          <label className="mb-1 block text-sm font-medium">{t("common.name")}</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={input} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">{t("common.city")}</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={input} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t("common.phone")}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className={input} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {t("common.save")}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[#138808]">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {t("profile.saved")}
            </span>
          )}
        </div>
      </form>

      {/* Settings */}
      <div className={`${card} space-y-1`}>
        <h2 className="mb-2 font-semibold">{t("profile.settings")}</h2>
        <div className="flex items-center justify-between border-b border-border py-3">
          <span className="text-sm">{t("language.chooseTitle")}</span>
          <LanguageModal variant="solid" />
        </div>
        <div className="flex items-center justify-between border-b border-border py-3">
          <span className="text-sm">{t("theme.dark")}</span>
          <ThemeToggle variant="solid" />
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 py-3 text-sm font-medium text-red-600"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          {t("nav.logout")}
        </button>
      </div>
    </div>
  );
}

export function ProfileView() {
  const { t } = useLanguage();
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <p className="py-16 text-center text-foreground/60">{t("common.loading")}</p>;

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-background p-6 text-center shadow-sm">
        <p className="text-foreground/70">{t("verify.loginRequired")}</p>
        <Link href="/login" className="mt-4 inline-block rounded-lg bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          {t("nav.login")}
        </Link>
      </div>
    );
  }

  return <ProfileForm user={user} />;
}
