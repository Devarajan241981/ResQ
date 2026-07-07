"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/missing-persons", key: "nav.missingPersons" } as const,
  { href: "/sos", key: "nav.sos" } as const,
  { href: "/blood-donation", key: "nav.bloodDonation" } as const,
  { href: "/disaster-mode", key: "nav.disasterMode" } as const,
  { href: "/about", key: "nav.about" } as const,
];

export function Navbar() {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <header className="border-b border-border">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3"
      >
        <Link href="/" className="text-lg font-semibold">
          {t("home.title")}
        </Link>

        <ul className="flex flex-wrap items-center gap-4 text-sm">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:underline">
                {t(link.key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-2 text-sm">
                  <span data-testid="nav-username">{user?.full_name}</span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-md border border-border px-3 py-1.5 hover:bg-surface"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Link href="/login" className="rounded-md border border-border px-3 py-1.5 hover:bg-surface">
                    {t("nav.login")}
                  </Link>
                  <Link href="/register" className="rounded-md bg-foreground px-3 py-1.5 text-background">
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
