"use client";

import {
  AlertTriangle,
  Bell,
  CalendarDays,
  ChevronRight,
  Droplet,
  Megaphone,
  Search,
  ShieldAlert,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { NotificationItem, PaginatedResponse } from "@/lib/api/types";

const POLL_MS = 60_000;

// Instagram-style category filter. Each notification_type maps to one bucket;
// the dropdown shows an "All" chip plus only the buckets that have notifications.
type Category = "missing" | "sos" | "blood" | "disaster" | "campaigns" | "community" | "events" | "system";

const CATEGORY_OF: Record<string, Category> = {
  missing_person_alert: "missing",
  sos_alert: "sos",
  blood_request: "blood",
  disaster_alert: "disaster",
  campaign_update: "campaigns",
  community_post: "community",
  event_update: "events",
  volunteer_assignment: "system",
  system: "system",
};

const CATEGORY_META: Record<Category, { labelKey: TranslationKey; icon: LucideIcon; tint: string }> = {
  missing: { labelKey: "notif.filter.missing", icon: Search, tint: "text-[#FF9933]" },
  sos: { labelKey: "notif.filter.sos", icon: ShieldAlert, tint: "text-red-600" },
  blood: { labelKey: "notif.filter.blood", icon: Droplet, tint: "text-red-600" },
  disaster: { labelKey: "notif.filter.disaster", icon: AlertTriangle, tint: "text-[#FF9933]" },
  campaigns: { labelKey: "notif.filter.campaigns", icon: Megaphone, tint: "text-[#123a6b] dark:text-blue-400" },
  community: { labelKey: "notif.filter.community", icon: Users, tint: "text-[#138808]" },
  events: { labelKey: "notif.filter.events", icon: CalendarDays, tint: "text-indigo-600 dark:text-indigo-300" },
  system: { labelKey: "notif.filter.system", icon: Wrench, tint: "text-foreground/60" },
};

const CATEGORY_ORDER: Category[] = ["missing", "sos", "blood", "disaster", "campaigns", "community", "events", "system"];

function categoryOf(n: NotificationItem): Category {
  return CATEGORY_OF[n.notification_type] ?? "system";
}

function dataStr(data: Record<string, unknown> | undefined, key: string): string | undefined {
  const v = data?.[key];
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return undefined;
}

/** Where a notification should take the user — deep-linked via its `data` when
 * possible, otherwise the relevant module page. */
function hrefFor(n: NotificationItem): string {
  const d = n.data;
  // Action-tagged notifications deep-link regardless of type (e.g. the welcome
  // notice that asks the user to verify their phone).
  if (dataStr(d, "action") === "verify_phone") return "/verify-phone";
  switch (n.notification_type) {
    case "missing_person_alert": {
      const slug = dataStr(d, "public_slug");
      return slug ? `/missing-persons/share/${slug}` : "/missing-persons";
    }
    case "sos_alert":
      return "/sos";
    case "blood_request":
      return "/blood-donation";
    case "disaster_alert":
      return "/disaster-mode";
    case "campaign_update":
    case "volunteer_assignment": {
      const id = dataStr(d, "campaign_id");
      return id ? `/campaigns/${id}` : "/campaigns";
    }
    case "community_post": {
      const id = dataStr(d, "community_id");
      return id ? `/community/${id}` : "/community";
    }
    case "event_update":
      return "/calendar";
    default:
      return "/";
  }
}

export function NotificationsBell({ variant }: { variant: "overlay" | "solid" }) {
  const { authFetch, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<Category | "all">("all");

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const load = () =>
      authFetch<PaginatedResponse<NotificationItem>>("/notifications/")
        .then((data) => {
          if (!cancelled) setItems(data.results);
        })
        .catch(() => {
          /* bell is best-effort; never break the navbar */
        });

    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authFetch, isAuthenticated]);

  // Which category chips to show, and how many unread each has (Instagram-like).
  const presentCategories = useMemo(() => {
    const present = new Set(items.map(categoryOf));
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, [items]);

  const visibleItems = useMemo(
    () => (filter === "all" ? items : items.filter((n) => categoryOf(n) === filter)),
    [items, filter],
  );

  if (!isAuthenticated) return null;

  const unread = items.filter((n) => !n.is_read).length;

  async function markAllRead() {
    try {
      await authFetch("/notifications/mark-all-read/", { method: "POST" });
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      /* ignore */
    }
  }

  // Open the notification's target: mark it read (optimistically + persisted),
  // close the dropdown, and navigate to the relevant page.
  function openNotification(n: NotificationItem) {
    setOpen(false);
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      authFetch(`/notifications/${n.id}/mark_read/`, { method: "POST" }).catch(() => {});
    }
    router.push(hrefFor(n));
  }

  const iconClass = variant === "overlay" ? "text-white hover:bg-white/15" : "text-foreground hover:bg-surface";

  function chipClass(active: boolean) {
    return `shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active ? "border-foreground bg-foreground text-background" : "border-border text-foreground/70 hover:bg-surface"
    }`;
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("notif.aria")}
        onClick={() => setOpen((v) => !v)}
        className={`relative rounded-md p-2 ${iconClass}`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span
            data-testid="notif-badge"
            className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
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
          <div className="fixed right-4 top-24 z-40 w-[min(24rem,92vw)] rounded-xl border border-border bg-background text-foreground shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <h2 className="text-sm font-semibold">{t("notif.title")}</h2>
              {unread > 0 && (
                <button type="button" onClick={markAllRead} className="text-xs text-[#123a6b] hover:underline dark:text-blue-400">
                  {t("notif.markAllRead")}
                </button>
              )}
            </div>

            {/* Category filter row (Instagram-style tabs) */}
            {presentCategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto border-b border-border px-3 py-2">
                <button type="button" onClick={() => setFilter("all")} className={chipClass(filter === "all")}>
                  {t("notif.filter.all")}
                </button>
                {presentCategories.map((c) => {
                  const meta = CATEGORY_META[c];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilter(c)}
                      className={`inline-flex items-center gap-1 ${chipClass(filter === c)}`}
                    >
                      <Icon className={`h-3 w-3 ${filter === c ? "" : meta.tint}`} aria-hidden />
                      {t(meta.labelKey)}
                    </button>
                  );
                })}
              </div>
            )}

            {visibleItems.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-foreground/60">{t("notif.empty")}</p>
            ) : (
              <ul className="max-h-96 divide-y divide-border overflow-y-auto">
                {visibleItems.map((n) => {
                  const meta = CATEGORY_META[categoryOf(n)];
                  const Icon = meta.icon;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => openNotification(n)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface ${
                          n.is_read ? "" : "bg-[#FF9933]/10"
                        }`}
                      >
                        <span className={`mt-0.5 shrink-0 ${meta.tint}`}>
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{n.title}</p>
                          {n.body && <p className="mt-0.5 text-xs text-foreground/70">{n.body}</p>}
                          <p className="mt-1 text-[10px] text-foreground/45">{new Date(n.created_at).toLocaleString()}</p>
                        </div>
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-foreground/30" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
