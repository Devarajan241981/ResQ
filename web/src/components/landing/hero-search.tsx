"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";
import type { SearchResult } from "@/lib/api/types";
import type { TranslationKey } from "@/lib/i18n/translations";

const CATEGORIES: { value: string; labelKey: TranslationKey }[] = [
  { value: "/missing-persons", labelKey: "nav.missingPersons" },
  { value: "/sos", labelKey: "nav.sos" },
  { value: "/blood-donation", labelKey: "nav.bloodDonation" },
  { value: "/disaster-mode", labelKey: "nav.disasterMode" },
  { value: "/campaigns", labelKey: "nav.campaigns" },
  { value: "/community", labelKey: "nav.community" },
];

const TRENDING: { href: string; labelKey: TranslationKey }[] = [
  { href: "/missing-persons/new", labelKey: "hero.trendReport" },
  { href: "/sos", labelKey: "nav.sos" },
  { href: "/blood-donation", labelKey: "nav.bloodDonation" },
  { href: "/disaster-mode", labelKey: "nav.disasterMode" },
  { href: "/calendar", labelKey: "nav.calendar" },
];

export function HeroSearch() {
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    const handle = setTimeout(() => {
      if (trimmed.length < 2) {
        setResults(null);
        return;
      }
      apiFetch<{ results: SearchResult[] }>(`/search/?q=${encodeURIComponent(trimmed)}`)
        .then((d) => setResults(d.results))
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const first = results?.[0];
    if (first?.type === "missing_person" && first.public_slug) {
      router.push(`/missing-persons/share/${first.public_slug}`);
      return;
    }
    router.push(category || "/missing-persons");
  }

  return (
    <div className="relative w-full max-w-4xl">
      <form
        onSubmit={submit}
        className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:flex-row"
      >
        <div className="flex flex-1 items-center gap-3 px-5">
          <Search className="h-6 w-6 shrink-0 text-black/40" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("hero.searchPlaceholder")}
            aria-label={t("hero.searchPlaceholder")}
            className="w-full bg-transparent py-5 text-base text-black outline-none placeholder:text-black/40 sm:text-lg"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label={t("hero.allCategories")}
          className="border-t border-black/10 bg-white px-5 py-5 text-sm text-black/70 outline-none sm:border-l sm:border-t-0 sm:text-base"
        >
          <option value="">{t("hero.allCategories")}</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {t(c.labelKey)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-[#123A6B] px-10 py-5 text-base font-semibold text-white transition-colors hover:bg-[#0f2f56]"
        >
          {t("nav.search")}
        </button>
      </form>

      {/* live results dropdown */}
      {results && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl bg-white text-left text-black shadow-2xl ring-1 ring-black/5">
          {results.map((r) => (
            <li key={`${r.type}-${r.id}`}>
              <Link
                href={r.public_slug ? `/missing-persons/share/${r.public_slug}` : "/missing-persons"}
                onClick={() => setResults(null)}
                className="group flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/5"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.title}</span>
                  {r.subtitle && <span className="block truncate text-xs text-black/50">{r.subtitle}</span>}
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-black/30" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* trending searches */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-white/90">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <TrendingUp className="h-4 w-4" aria-hidden />
          {t("hero.trendingLabel")}:
        </span>
        {TRENDING.map((item) => (
          <Link
            key={item.labelKey}
            href={item.href}
            className="rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            {t(item.labelKey)}
          </Link>
        ))}
      </div>
    </div>
  );
}
