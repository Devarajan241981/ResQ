"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { AdminUser, PaginatedResponse, Role } from "@/lib/api/types";

const ROLES: Role[] = ["citizen", "volunteer", "ngo", "hospital", "police", "admin", "super_admin"];

export function AdminUsers() {
  const { authFetch } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setStatus("loading");
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (role) params.set("role", role);
    authFetch<PaginatedResponse<AdminUser>>(`/admin-panel/users/?${params.toString()}`)
      .then((data) => {
        setUsers(data.results);
        setStatus("ready");
      })
      .catch((err) => {
        setError(extractErrorMessage(err));
        setStatus("error");
      });
  }

  useEffect(() => {
    const handle = setTimeout(load, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role]);

  async function runAction(id: string, action: "verify" | "suspend" | "reactivate") {
    setBusyId(id);
    try {
      const updated = await authFetch<AdminUser>(`/admin-panel/users/${id}/${action}/`, { method: "POST" });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.usersSearchPlaceholder")}
          aria-label={t("admin.usersSearchPlaceholder")}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role | "")}
          aria-label={t("common.role")}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="">{t("admin.allRoles")}</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {status === "loading" && <p className="mt-4 text-foreground/70">{t("common.loading")}</p>}

      {status !== "loading" && users.length === 0 && (
        <p className="mt-4 text-foreground/70">{t("admin.noUsersFound")}</p>
      )}

      {users.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div>
                <p className="font-medium">
                  {u.full_name} <span className="text-xs font-normal text-foreground/50">· {u.role}</span>
                </p>
                <p className="text-xs text-foreground/60">
                  {u.email ?? u.phone} {u.organization_name && `· ${u.organization_name}`}
                </p>
                <p className="mt-0.5 text-xs">
                  <span className={u.is_verified ? "text-green-600" : "text-amber-600"}>
                    {u.is_verified ? t("admin.verified") : t("admin.unverified")}
                  </span>
                  {" · "}
                  <span className={u.is_active ? "text-foreground/60" : "text-red-600"}>
                    {u.is_active ? t("admin.active") : t("admin.suspended")}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                {!u.is_verified && (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => runAction(u.id, "verify")}
                    className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface disabled:opacity-50"
                  >
                    {t("admin.verify")}
                  </button>
                )}
                {u.is_active ? (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => runAction(u.id, "suspend")}
                    className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface disabled:opacity-50"
                  >
                    {t("admin.suspend")}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => runAction(u.id, "reactivate")}
                    className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface disabled:opacity-50"
                  >
                    {t("admin.reactivate")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
