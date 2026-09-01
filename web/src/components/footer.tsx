"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";

const COLUMNS = [
  {
    titleKey: "footer.platform",
    links: [
      { href: "/missing-persons", labelKey: "nav.missingPersons" },
      { href: "/missing-children", labelKey: "nav.missingChildren" },
      { href: "/sos", labelKey: "nav.sos" },
      { href: "/blood-donation", labelKey: "nav.bloodDonation" },
      { href: "/disaster-mode", labelKey: "nav.disasterMode" },
      { href: "/hospitals", labelKey: "nav.hospitals" },
      { href: "/shelters", labelKey: "nav.shelters" },
      { href: "/campaigns", labelKey: "nav.campaigns" },
    ],
  },
  {
    titleKey: "footer.account",
    links: [
      { href: "/login", labelKey: "nav.login" },
      { href: "/register", labelKey: "nav.register" },
    ],
  },
  {
    titleKey: "footer.about",
    links: [
      { href: "/about", labelKey: "about.heading" },
      { href: "/calendar", labelKey: "nav.calendar" },
      { href: "/link-to-us", labelKey: "linkToUs.title" },
    ],
  },
] satisfies { titleKey: TranslationKey; links: { href: string; labelKey: TranslationKey }[] }[];

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-brand text-lg font-extrabold">{t("home.title")}</p>
            <p className="mt-2 text-sm text-foreground/60">{t("footer.tagline")}</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <p className="text-sm font-medium text-foreground/50">{t(col.titleKey)}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm hover:underline">
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p>{t("footer.disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
