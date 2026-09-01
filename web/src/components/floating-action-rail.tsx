"use client";

import Link from "next/link";
import { ArrowUp, CalendarDays, MessageSquareWarning, Palette, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

const BRAND_STORAGE_KEY = "resq-brand";

// "Choose Primary Theme" swatches — national palette (navy default, saffron, green, red).
const THEMES: { label: string; color: string }[] = [
  { label: "Navy", color: "#123a6b" },
  { label: "Saffron", color: "#ea580c" },
  { label: "Green", color: "#138808" },
  { label: "Red", color: "#dc2626" },
  { label: "Gold", color: "#eab308" },
];

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2" aria-hidden>
      <path d="M24 12a12 12 0 10-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.4 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0024 12z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-7-6.1 7H1.7l8-9.2L1 2h7l4.8 6.3L18.9 2zm-1.2 18h1.9L7.2 4H5.2l12.5 16z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#25D366" aria-hidden>
      <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.6.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5l-.9-2.1c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.8c.1.2 1.9 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 00-8.5 15.3L2 22l4.8-1.3A10 10 0 1012 2z" />
    </svg>
  );
}

function RailButton({
  label,
  onClick,
  href,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}) {
  const cls =
    "grid h-11 w-11 place-items-center bg-foreground/70 text-background transition-colors hover:bg-[var(--brand)]";
  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cls}>
      {children}
    </button>
  );
}

export function FloatingActionRail() {
  const { t } = useLanguage();
  const [panel, setPanel] = useState<"share" | "theme" | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    // Restore saved accent (also applied pre-paint by the inline script in layout).
    try {
      const saved = localStorage.getItem(BRAND_STORAGE_KEY);
      if (saved) document.documentElement.style.setProperty("--brand", saved);
    } catch {
      /* ignore */
    }
    const onScroll = () => setShowTop(window.scrollY > 400);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function shareTo(target: "facebook" | "x" | "whatsapp") {
    const url = encodeURIComponent(window.location.href);
    const map = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?url=${url}`,
      whatsapp: `https://wa.me/?text=${url}`,
    };
    window.open(map[target], "_blank", "noopener,noreferrer");
    setPanel(null);
  }

  function pickTheme(color: string) {
    document.documentElement.style.setProperty("--brand", color);
    try {
      localStorage.setItem(BRAND_STORAGE_KEY, color);
    } catch {
      /* ignore */
    }
    setPanel(null);
  }

  return (
    <div className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1 sm:flex">
      {/* Share popover */}
      {panel === "share" && (
        <div className="mr-1 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-2xl">
          <button type="button" onClick={() => shareTo("facebook")} aria-label="Facebook">
            <FacebookIcon />
          </button>
          <button type="button" onClick={() => shareTo("x")} aria-label="X" className="text-foreground">
            <XIcon />
          </button>
          <button type="button" onClick={() => shareTo("whatsapp")} aria-label="WhatsApp">
            <WhatsAppIcon />
          </button>
        </div>
      )}
      {/* Theme picker popover */}
      {panel === "theme" && (
        <div className="mr-1 rounded-xl border border-border bg-background px-4 py-3 shadow-2xl">
          <p className="mb-2 text-sm font-semibold">{t("theme.choosePrimary")}</p>
          <div className="flex items-center gap-3">
            {THEMES.map((th) => (
              <button
                key={th.color}
                type="button"
                onClick={() => pickTheme(th.color)}
                aria-label={th.label}
                title={th.label}
                className="h-7 w-7 rounded-full ring-2 ring-white transition-transform hover:scale-110"
                style={{ backgroundColor: th.color }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col overflow-hidden rounded-l-xl shadow-lg">
        <RailButton label={t("rail.feedback")} href="/community">
          <MessageSquareWarning className="h-5 w-5" aria-hidden />
        </RailButton>
        <RailButton label={t("calendarWidget.open")} href="/calendar">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </RailButton>
        <RailButton label={t("rail.share")} onClick={() => setPanel((p) => (p === "share" ? null : "share"))}>
          {panel === "share" ? <X className="h-5 w-5" aria-hidden /> : <Share2 className="h-5 w-5" aria-hidden />}
        </RailButton>
        <RailButton label={t("theme.choosePrimary")} onClick={() => setPanel((p) => (p === "theme" ? null : "theme"))}>
          {panel === "theme" ? <X className="h-5 w-5" aria-hidden /> : <Palette className="h-5 w-5" aria-hidden />}
        </RailButton>
      </div>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t("rail.scrollTop")}
          title={t("rail.scrollTop")}
          className="mt-1 grid h-11 w-11 place-items-center rounded-full bg-[var(--brand)] text-white shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <ArrowUp className="h-5 w-5" aria-hidden />
        </button>
      )}
    </div>
  );
}
