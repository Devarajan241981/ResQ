"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

// Captured globally so any InstallSosButton can trigger it.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const INSTALLABLE_EVENT = "resq-pwa-installable";

/** Registers the service worker and captures the install prompt. Render once (layout). */
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      window.dispatchEvent(new Event(INSTALLABLE_EVENT));
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);
  return null;
}

function isIos() {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isStandalone() {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true)
  );
}

export function InstallSosButton({ className }: { className?: string }) {
  const { t } = useLanguage();
  const [canInstall, setCanInstall] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    // Deferred out of the effect body (avoids sync setState-in-effect).
    const raf = requestAnimationFrame(() => {
      if (deferredPrompt) setCanInstall(true);
      else if (isIos() && !isStandalone()) setShowIosHint(true);
    });
    const onInstallable = () => setCanInstall(true);
    window.addEventListener(INSTALLABLE_EVENT, onInstallable);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(INSTALLABLE_EVENT, onInstallable);
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } catch {
      /* dismissed */
    }
    deferredPrompt = null;
    setCanInstall(false);
  }

  if (isStandalone()) return null; // already installed

  if (canInstall) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 ${className ?? ""}`}
      >
        <Download className="h-4 w-4" aria-hidden />
        {t("pwa.addToHome")}
      </button>
    );
  }

  if (showIosHint) {
    return <p className={`text-center text-xs text-foreground/60 ${className ?? ""}`}>{t("pwa.iosHint")}</p>;
  }

  return null;
}
