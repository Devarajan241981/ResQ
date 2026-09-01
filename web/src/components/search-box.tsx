"use client";

import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";
import type { SearchResult } from "@/lib/api/types";

// Every hit points at a real destination so the dropdown is navigable, not decorative.
// Only missing_person has a public detail page today; the others fall back to their
// section landing until those modules ship.
function resultHref(r: SearchResult): string {
  if (r.type === "missing_person" && r.public_slug) {
    return `/missing-persons/share/${r.public_slug}`;
  }
  return "/missing-persons";
}

export function SearchBox({ variant }: { variant: "overlay" | "solid" }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // preventScroll matters here: the navbar's <nav> has overflow-x-auto for
    // mobile, which per spec forces its overflow-y to compute as auto too —
    // so a plain focus() lets the browser scroll that nav internally to
    // reveal the input, carrying the logo and links off-screen with it.
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    const handle = setTimeout(() => {
      if (trimmed.length < 2) {
        setResults(null);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      apiFetch<{ results: SearchResult[] }>(`/search/?q=${encodeURIComponent(trimmed)}`)
        .then((data) => setResults(data.results))
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults(null);
  }

  const iconClass = variant === "overlay" ? "text-white hover:bg-white/15" : "text-foreground hover:bg-surface";

  return (
    // Trigger button's footprint never changes size; the results panel is an
    // out-of-flow floating layer, so opening it can no longer push or cover
    // sibling navbar items the way an inline-expanding input used to.
    <div className="relative">
      <button
        type="button"
        aria-label={open ? t("common.close") : t("nav.search")}
        onClick={() => (open ? close() : setOpen(true))}
        className={`rounded-md p-2 ${iconClass}`}
      >
        {open ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 z-30 cursor-default"
          />
          {/* fixed, not absolute: the nav is an overflow-x-auto scroll container,
              which would clip (hide) an absolutely-positioned dropdown inside it */}
          <div className="fixed right-4 top-24 z-40 w-[min(22rem,90vw)] rounded-xl border border-border bg-background p-3 text-foreground shadow-xl">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && close()}
              placeholder={t("nav.searchPlaceholder")}
              aria-label={t("nav.search")}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />

            {(isSearching || results) && (
              <div className="mt-2 max-h-80 overflow-y-auto rounded-md border border-border">
                {isSearching && <p className="px-3 py-2 text-sm text-foreground/60">{t("common.loading")}</p>}
                {!isSearching && results && results.length === 0 && (
                  <p className="px-3 py-2 text-sm text-foreground/60">{t("nav.searchEmpty")}</p>
                )}
                {!isSearching && results && results.length > 0 && (
                  <ul className="divide-y divide-border">
                    {results.map((r) => (
                      <li key={`${r.type}-${r.id}`}>
                        <Link
                          href={resultHref(r)}
                          onClick={close}
                          className="group flex items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-surface"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{r.title}</span>
                            {r.subtitle && <span className="block truncate text-xs text-foreground/60">{r.subtitle}</span>}
                          </span>
                          {r.status && (
                            <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-red-600">
                              {r.status}
                            </span>
                          )}
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-foreground/30 transition-colors group-hover:text-foreground/70" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
