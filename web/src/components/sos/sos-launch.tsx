"use client";

import Link from "next/link";
import { CheckCircle2, Phone } from "lucide-react";
import { useState } from "react";
import { extractErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { getCurrentPosition } from "@/lib/geolocation";
import { useLanguage } from "@/lib/i18n/language-context";
import type { SOSAlert } from "@/lib/api/types";
import { InstallSosButton } from "@/components/pwa-register";

/** Full-screen, single-button SOS — the PWA's home-screen icon opens straight here. */
export function SosLaunch() {
  const { t } = useLanguage();
  const { isAuthenticated, authFetch } = useAuth();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fire() {
    setError(null);
    setSending(true);
    try {
      let latitude: number | null = null;
      let longitude: number | null = null;
      try {
        const pos = await getCurrentPosition();
        latitude = pos.latitude;
        longitude = pos.longitude;
      } catch {
        /* location optional — alert still sends */
      }
      await authFetch<SOSAlert>("/sos/alerts/", {
        method: "POST",
        body: { notes: "Sent from ResQ SOS", latitude, longitude },
      });
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
      {sent ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="h-20 w-20 text-[#138808]" aria-hidden />
          <p className="max-w-sm text-lg font-semibold">{t("sos.sosSent")}</p>
        </div>
      ) : isAuthenticated ? (
        <button
          type="button"
          onClick={fire}
          disabled={sending}
          className="grid h-56 w-56 place-items-center rounded-full bg-red-600 text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-70"
          style={{ boxShadow: "0 0 0 12px rgba(220,38,38,0.15), 0 20px 40px rgba(220,38,38,0.35)" }}
        >
          <span className="text-5xl font-black tracking-widest">{sending ? "…" : "SOS"}</span>
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-56 w-56 place-items-center rounded-full bg-red-600/40 text-white">
            <span className="text-5xl font-black tracking-widest">SOS</span>
          </div>
          <Link href="/login" className="text-sm font-semibold text-red-600 hover:underline">
            {t("verify.loginRequired")}
          </Link>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Always available — the real emergency line */}
      <a
        href="tel:112"
        className="inline-flex items-center gap-2 rounded-xl border-2 border-red-600 px-8 py-4 text-lg font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <Phone className="h-5 w-5" aria-hidden />
        {t("sos.call112")}
      </a>

      <InstallSosButton className="mt-2" />
    </div>
  );
}
