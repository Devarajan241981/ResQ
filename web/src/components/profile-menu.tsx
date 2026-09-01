"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function ProfileMenu({ variant }: { variant: "overlay" | "solid" }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={user.full_name}
        aria-expanded={open}
        data-testid="nav-username"
        onClick={() => setOpen((v) => !v)}
        className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ${
          variant === "overlay"
            ? "border border-white/50 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
            : "border border-border bg-surface text-foreground hover:bg-border"
        }`}
      >
        {initialsOf(user.full_name)}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          {/* fixed, not absolute: the nav is an overflow-x-auto scroll container
              that would clip an absolutely-positioned dropdown */}
          <div className="fixed right-4 top-24 z-40 w-60 rounded-xl border border-border bg-background p-2 text-foreground shadow-xl">
            <div className="border-b border-border px-3 pb-2 pt-1">
              <p className="truncate text-sm font-semibold">{user.full_name}</p>
              {user.email && <p className="truncate text-xs text-foreground/60">{user.email}</p>}
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-md px-3 py-2 text-sm hover:bg-surface"
            >
              {t("nav.profile")}
            </Link>
            {["admin", "super_admin"].includes(user.role) && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm hover:bg-surface"
              >
                {t("nav.admin")}
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-surface"
            >
              {t("nav.logout")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
