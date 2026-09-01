"use client";

import {
  AlignJustify,
  ChevronsDown,
  ChevronsUp,
  ImageOff,
  Moon,
  MousePointer2,
  PersonStanding,
  RotateCcw,
  Sun,
  Type,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

interface A11yState {
  contrast: boolean;
  hideImages: boolean;
  bigCursor: boolean;
  spacing: boolean;
  lineHeight: boolean;
  /** Root font scale in percent (100 = default). */
  fontScale: number;
}

const DEFAULT: A11yState = {
  contrast: false,
  hideImages: false,
  bigCursor: false,
  spacing: false,
  lineHeight: false,
  fontScale: 100,
};

const STORAGE_KEY = "resq-a11y";
const MIN_SCALE = 80;
const MAX_SCALE = 160;

function apply(state: A11yState) {
  const root = document.documentElement;
  root.classList.toggle("a11y-contrast", state.contrast);
  root.classList.toggle("a11y-hide-images", state.hideImages);
  root.classList.toggle("a11y-big-cursor", state.bigCursor);
  root.classList.toggle("a11y-spacing", state.spacing);
  root.classList.toggle("a11y-line-height", state.lineHeight);
  root.style.fontSize = state.fontScale === 100 ? "" : `${state.fontScale}%`;
}

/** A control card in the panel (icon over label), matching the govt-portal layout. */
function ToolButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center text-sm font-medium transition-colors ${
        active
          ? "border-[var(--brand)] bg-[color:var(--brand)]/10 text-[color:var(--brand)]"
          : "border-border hover:bg-surface"
      }`}
    >
      <Icon className="h-6 w-6" aria-hidden />
      <span>{label}</span>
    </button>
  );
}

export function AccessibilityTools() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(DEFAULT);

  // Load persisted preferences once, after mount (avoids SSR/hydration issues).
  // Deferred out of the effect body so the setState isn't synchronous-in-effect.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...DEFAULT, ...(JSON.parse(raw) as Partial<A11yState>) });
      } catch {
        /* ignore malformed storage */
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Sync DOM + storage whenever state changes.
  useEffect(() => {
    apply(state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const set = (patch: Partial<A11yState>) => setState((s) => ({ ...s, ...patch }));
  const bump = (delta: number) =>
    setState((s) => ({ ...s, fontScale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, s.fontScale + delta)) }));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("a11y.open")}
        aria-expanded={open}
        title={t("a11y.open")}
        className="rounded-md p-2 text-foreground hover:bg-surface"
      >
        <PersonStanding className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/20"
          />
          <div
            role="dialog"
            aria-label={t("a11y.title")}
            className="fixed right-2 top-16 z-50 max-h-[80vh] w-[min(22rem,92vw)] overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("a11y.title")}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("a11y.close")}
                className="rounded-full p-1 text-[color:var(--brand)] hover:bg-surface"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <h3 className="mb-2 border-b border-border pb-1 font-semibold">{t("a11y.contrastHeading")}</h3>
            <div className="mb-5 grid grid-cols-2 gap-3">
              <ToolButton icon={Moon} label={t("a11y.highContrast")} active={state.contrast} onClick={() => set({ contrast: true })} />
              <ToolButton icon={Sun} label={t("a11y.normal")} active={!state.contrast} onClick={() => set({ contrast: false })} />
            </div>

            <h3 className="mb-2 border-b border-border pb-1 font-semibold">
              {t("a11y.textSize")} ({state.fontScale}%)
            </h3>
            <div className="mb-5 grid grid-cols-3 gap-3">
              <ToolButton icon={ChevronsUp} label={t("a11y.increaseText")} onClick={() => bump(10)} />
              <ToolButton icon={ChevronsDown} label={t("a11y.decreaseText")} onClick={() => bump(-10)} />
              <ToolButton icon={RotateCcw} label={t("a11y.resetText")} onClick={() => set({ fontScale: 100 })} />
              <ToolButton icon={Type} label={t("a11y.textSpacing")} active={state.spacing} onClick={() => set({ spacing: !state.spacing })} />
              <ToolButton icon={AlignJustify} label={t("a11y.lineHeight")} active={state.lineHeight} onClick={() => set({ lineHeight: !state.lineHeight })} />
            </div>

            <h3 className="mb-2 border-b border-border pb-1 font-semibold">{t("a11y.others")}</h3>
            <div className="grid grid-cols-2 gap-3">
              <ToolButton icon={ImageOff} label={t("a11y.hideImages")} active={state.hideImages} onClick={() => set({ hideImages: !state.hideImages })} />
              <ToolButton icon={MousePointer2} label={t("a11y.bigCursor")} active={state.bigCursor} onClick={() => set({ bigCursor: !state.bigCursor })} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
