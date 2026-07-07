"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { extractErrorMessage } from "@/lib/api/client";

type Mode = "email" | "phone";

export function LoginForm() {
  const router = useRouter();
  const { loginWithEmail, requestOtp, verifyOtp } = useAuth();

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
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <div className="mt-4 flex gap-2" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "email"}
          onClick={() => setMode("email")}
          className={`rounded-md px-3 py-1.5 text-sm ${mode === "email" ? "bg-foreground text-background" : "border border-border"}`}
        >
          Email
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "phone"}
          onClick={() => setMode("phone")}
          className={`rounded-md px-3 py-1.5 text-sm ${mode === "phone" ? "bg-foreground text-background" : "border border-border"}`}
        >
          Phone OTP
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
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
          >
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>
      ) : otpSent ? (
        <form onSubmit={handleVerifyOtp} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            OTP code
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
            {isSubmitting ? "Verifying…" : "Verify & log in"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRequestOtp} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Phone number
            <input
              type="tel"
              required
              placeholder="+91XXXXXXXXXX"
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
            {isSubmitting ? "Sending…" : "Send OTP"}
          </button>
        </form>
      )}
    </div>
  );
}
