"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { extractErrorMessage } from "@/lib/api/client";
import { PasswordInput } from "./password-input";

type Mode = "email" | "phone";

export function LoginForm() {
  const router = useRouter();
  const { loginWithEmail, requestOtp, verifyOtp } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
      router.push("/");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await requestOtp(phone);
      setOtpSent(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await verifyOtp(phone, code);
      router.push("/");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-border bg-background/60 p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold">{t("auth.welcomeHeading")}</h1>
      <p className="mt-1 text-sm text-foreground/60">{t("auth.welcomeSubheading")}</p>

      <div className="mt-6 flex gap-2" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "email"}
          onClick={() => setMode("email")}
          className={`rounded-md px-3 py-1.5 text-sm ${mode === "email" ? "bg-foreground text-background" : "border border-border"}`}
        >
          {t("auth.emailTab")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "phone"}
          onClick={() => setMode("phone")}
          className={`rounded-md px-3 py-1.5 text-sm ${mode === "phone" ? "bg-foreground text-background" : "border border-border"}`}
        >
          {t("auth.phoneTab")}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {mode === "email" ? (
        <form onSubmit={handleEmailSubmit} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("common.email")}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <div className="flex flex-col gap-1 text-sm">
            <label htmlFor="login-password">{t("common.password")}</label>
            <PasswordInput
              id="login-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
          >
            {isSubmitting ? t("auth.loggingIn") : t("auth.logInBtn")}
          </button>
        </form>
      ) : otpSent ? (
        <form onSubmit={handleVerifyOtp} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("auth.otpCodeLabel")}
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
          >
            {isSubmitting ? t("auth.verifying") : t("auth.verifyBtn")}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRequestOtp} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("auth.phoneLabel")}
            <input
              type="tel"
              required
              placeholder={t("auth.phonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
          >
            {isSubmitting ? t("auth.sendingOtp") : t("auth.sendOtpBtn")}
          </button>
        </form>
      )}
    </div>
  );
}
