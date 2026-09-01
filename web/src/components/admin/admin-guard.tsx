"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";

const ADMIN_ROLES = ["admin", "super_admin"];

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) return <p className="text-foreground/70">{t("common.loading")}</p>;

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return (
      <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
        {t("admin.notAuthorized")}
      </p>
    );
  }

  return <>{children}</>;
}
