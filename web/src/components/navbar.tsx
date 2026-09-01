"use client";

import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { AccessibilityTools } from "./accessibility-tools";
import { CalendarWidget } from "./calendar-widget";
import { LanguageModal } from "./language-modal";
import { LanguageSwitcher } from "./language-switcher";
import { NotificationsBell } from "./notifications-bell";
import { ProfileMenu } from "./profile-menu";
import { SearchBox } from "./search-box";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/missing-persons", key: "nav.missingPersons" } as const,
  { href: "/sos", key: "nav.sos" } as const,
  { href: "/blood-donation", key: "nav.bloodDonation" } as const,
  { href: "/disaster-mode", key: "nav.disasterMode" } as const,
  { href: "/campaigns", key: "nav.campaigns" } as const,
  { href: "/community", key: "nav.community" } as const,
  { href: "/gallery", key: "nav.gallery" } as const,
  { href: "/calendar", key: "nav.calendar" } as const,
  { href: "/about", key: "nav.about" } as const,
];

const ADMIN_ROLES = ["admin", "super_admin"];

// Always renders as a solid bar. On the homepage it stays hidden at the top and
// SiteHeader slides it in on scroll; everywhere else it sits in normal flow.
export function Navbar() {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    ...NAV_LINKS,
    ...(user && ADMIN_ROLES.includes(user.role) ? [{ href: "/admin", key: "nav.admin" as const }] : []),
  ];

  const linkClass = "shrink-0 text-foreground/80 transition-colors hover:text-red-600 dark:hover:text-blue-400";

  return (
    <header className="relative z-20 border-b border-border bg-background">
      {/* Tricolor accent strip — plain color bands only (never an emblem) */}
      <div aria-hidden className="flex h-1">
        <span className="flex-1 bg-[#FF9933]" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-[#138808]" />
      </div>
      <nav
        aria-label="Main navigation"
        className="flex w-full flex-nowrap items-center justify-between gap-3 px-4 py-3 lg:gap-4 lg:px-10"
      >
        <Link href="/" className="font-brand shrink-0 text-xl font-extrabold tracking-tight text-foreground">
          {t("home.title")}
        </Link>

        {/* Desktop links */}
        <ul className="hidden min-w-0 shrink flex-nowrap items-center gap-6 overflow-x-auto text-sm font-medium lg:flex">
          {links.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link href={link.href} className={linkClass}>
                {t(link.key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <SearchBox variant="solid" />
          <NotificationsBell variant="solid" />

          {/* Desktop-only controls — govt-portal utility cluster */}
          <div className="hidden items-center gap-1.5 lg:flex">
            <CalendarWidget />
            <AccessibilityTools />
            <span aria-hidden className="mx-1 h-5 w-px bg-border" />
            <ThemeToggle variant="solid" />
            {!isLoading &&
              (isAuthenticated ? (
                <ProfileMenu variant="solid" />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Link href="/login" className="rounded-md border border-border px-3 py-1.5 hover:bg-surface">
                    {t("nav.login")}
                  </Link>
                  <Link href="/register" className="rounded-md bg-foreground px-3 py-1.5 text-background">
                    {t("nav.register")}
                  </Link>
                </div>
              ))}
            <LanguageModal variant="solid" />
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={t("nav.menu")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md p-2 text-foreground hover:bg-surface lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-black/30 lg:hidden"
          />
          <div className="absolute inset-x-0 top-full z-40 max-h-[80vh] overflow-y-auto border-b border-border bg-background text-foreground shadow-xl lg:hidden">
            <ul className="flex flex-col p-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-surface"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <ThemeToggle variant="solid" />
              <LanguageSwitcher variant="solid" />
            </div>
            <div className="flex items-center gap-2 border-t border-border px-4 py-2">
              <CalendarWidget />
              <AccessibilityTools />
            </div>

            {!isLoading && (
              <div className="border-t border-border p-3">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between gap-2">
                    <span data-testid="nav-username-mobile" className="truncate text-sm font-medium">
                      {user?.full_name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-red-600 hover:bg-surface"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      {t("nav.logout")}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-md border border-border px-3 py-2 text-center text-sm hover:bg-surface">
                      {t("nav.login")}
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-md bg-foreground px-3 py-2 text-center text-sm text-background">
                      {t("nav.register")}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
