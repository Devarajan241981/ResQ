"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Phone, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { extractErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";

export function VerifyPhone() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, authFetch, reloadUser } = useAuth();

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await authFetch("/auth/phone/request/", { method: "POST", body: { phone } });
      setStep("code");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await authFetch("/auth/phone/verify/", { method: "POST", body: { phone, code } });
      await reloadUser();
      setStep("done");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const card = "mx-auto w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-sm";
  const input =
    "w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-[var(--brand)]";
  const primaryBtn =
    "w-full rounded-lg bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50";

  if (!isLoading && !isAuthenticated) {
    return (
      <div className={card}>
        <p className="text-center text-foreground/70">{t("verify.loginRequired")}</p>
        <Link href="/login" className={`mt-4 block text-center ${primaryBtn}`}>
          {t("nav.login")}
        </Link>
      </div>
    );
  }

  if (user?.is_verified && step !== "done") {
    return (
      <div className={`${card} text-center`}>
        <ShieldCheck className="mx-auto h-12 w-12 text-[#138808]" aria-hidden />
        <p className="mt-3 font-semibold">{t("verify.already")}</p>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-[color:var(--brand)] hover:underline">
          {t("verify.goHome")} →
        </Link>
      </div>
    );
  }

  return (
    <div className={card}>
      <div className="mb-5 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
          <Phone className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-3 text-xl font-bold">{t("verify.title")}</h1>
        <p className="mt-1 text-sm text-foreground/60">{t("verify.subtitle")}</p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {step === "done" ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#138808]" aria-hidden />
          <p className="mt-3 font-semibold">{t("verify.success")}</p>
          <button type="button" onClick={() => router.push("/")} className={`mt-4 ${primaryBtn}`}>
            {t("verify.goHome")}
          </button>
        </div>
      ) : step === "phone" ? (
        <form onSubmit={sendCode} className="space-y-3">
          <label className="block text-sm font-medium">{t("verify.phoneLabel")}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("verify.phonePlaceholder")}
            required
            className={input}
          />
          <button type="submit" disabled={busy || phone.trim().length < 6} className={primaryBtn}>
            {t("verify.sendCode")}
          </button>
        </form>
      ) : (
        <form onSubmit={confirmCode} className="space-y-3">
          <p className="text-sm text-foreground/70">{t("verify.sentTo")}</p>
          <label className="block text-sm font-medium">{t("verify.codeLabel")}</label>
          <input
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("verify.codePlaceholder")}
            required
            className={`${input} text-center text-lg tracking-[0.4em]`}
          />
          <button type="submit" disabled={busy || code.trim().length < 4} className={primaryBtn}>
            {t("verify.verify")}
          </button>
          <div className="flex justify-between text-xs">
            <button type="button" onClick={() => setStep("phone")} className="text-foreground/60 hover:underline">
              {t("verify.changeNumber")}
            </button>
            <button type="button" onClick={sendCode} className="text-[color:var(--brand)] hover:underline">
              {t("verify.resend")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
