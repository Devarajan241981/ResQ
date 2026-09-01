"use client";

import Link from "next/link";
import { ArrowRight, Check, Copy, Home } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";

const SITE = "https://resqbharath.online";

const MODULES: { path: string; labelKey: TranslationKey }[] = [
  { path: "/missing-persons", labelKey: "nav.missingPersons" },
  { path: "/sos", labelKey: "nav.sos" },
  { path: "/blood-donation", labelKey: "nav.bloodDonation" },
  { path: "/disaster-mode", labelKey: "nav.disasterMode" },
  { path: "/campaigns", labelKey: "nav.campaigns" },
  { path: "/community", labelKey: "nav.community" },
];

const SIZES = [
  { label: "180 × 44", w: 180, h: 44, fs: 13 },
  { label: "240 × 56", w: 240, h: 56, fs: 15 },
  { label: "320 × 72", w: 320, h: 72, fs: 18 },
];

function buildEmbed(url: string, label: string, w: number, h: number, fs: number) {
  return `<a href="${url}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;width:${w}px;height:${h}px;background:#123a6b;color:#ffffff;font-family:Arial,sans-serif;font-weight:700;font-size:${fs}px;border-radius:10px;text-decoration:none;border-top:3px solid #FF9933;box-sizing:border-box;">ResQ Bharath · ${label}</a>`;
}

export function LinkToUs() {
  const { t } = useLanguage();
  const [moduleIdx, setModuleIdx] = useState(1); // SOS by default
  const [sizeIdx, setSizeIdx] = useState(1);
  const [copied, setCopied] = useState(false);

  const mod = MODULES[moduleIdx];
  const size = SIZES[sizeIdx];
  const label = t(mod.labelKey);
  const url = `${SITE}${mod.path}`;
  const embed = buildEmbed(url, label, size.w, size.h, size.fs);

  async function copy() {
    try {
      await navigator.clipboard.writeText(embed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — user can still select the text manually */
    }
  }

  return (
    <div>
      {/* Breadcrumb header */}
      <div className="rounded-xl bg-[color:var(--brand)]/10 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-[color:var(--brand)]">
          <Link href="/" aria-label={t("nav.home")}>
            <Home className="h-4 w-4" aria-hidden />
          </Link>
          <span aria-hidden>/</span>
          {t("linkToUs.title")}
        </p>
        <p className="mt-2 text-[color:var(--brand)]">{t("linkToUs.desc")}</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("linkToUs.category")}</label>
            <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground/70">
              {t("linkToUs.categoryValue")}
            </div>
          </div>

          <div>
            <label htmlFor="ltu-module" className="mb-1.5 block text-sm font-semibold">
              {t("linkToUs.module")}
            </label>
            <select
              id="ltu-module"
              value={moduleIdx}
              onChange={(e) => setModuleIdx(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-[var(--brand)]"
            >
              {MODULES.map((m, i) => (
                <option key={m.path} value={i}>
                  {t(m.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold">{t("linkToUs.size")}</span>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSizeIdx(i)}
                  aria-pressed={i === sizeIdx}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    i === sizeIdx ? "border-[var(--brand)] bg-[color:var(--brand)]/10 text-[color:var(--brand)]" : "border-border hover:bg-surface"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview + embed */}
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-semibold">{t("linkToUs.preview")}</p>
            <div className="grid place-items-center rounded-xl border border-border bg-surface p-6">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: size.w,
                  height: size.h,
                  background: "#123a6b",
                  color: "#ffffff",
                  fontFamily: "Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: size.fs,
                  borderRadius: 10,
                  textDecoration: "none",
                  borderTop: "3px solid #FF9933",
                  boxSizing: "border-box",
                }}
              >
                ResQ Bharath · {label}
              </a>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">{t("linkToUs.embedHeading")}</p>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-md bg-[color:var(--brand)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                {copied ? t("linkToUs.copied") : t("linkToUs.copy")}
              </button>
            </div>
            <textarea
              readOnly
              value={embed}
              onFocus={(e) => e.currentTarget.select()}
              rows={5}
              className="w-full resize-none rounded-lg border border-border bg-surface p-3 font-mono text-xs text-foreground/80 outline-none"
            />
          </div>

          <Link href={mod.path} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--brand)] hover:underline">
            {label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
