import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Loading, Muted, RESQ, ScreenScroll } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import type { NotificationItem, Paginated } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

/** Which screen a notification should open — action-tagged notifications deep-link
 * regardless of type; otherwise route by type. */
function hrefFor(n: NotificationItem): Href {
  if (n.data?.action === "verify_phone") return "/verify-phone";
  switch (n.notification_type) {
    case "missing_person_alert":
      return "/missing-persons";
    case "sos_alert":
      return "/sos";
    case "blood_request":
      return "/blood-donation";
    case "disaster_alert":
      return "/disaster-mode";
    case "campaign_update":
    case "volunteer_assignment":
      return "/campaigns";
    case "community_post":
      return "/community";
    case "event_update":
      return "/calendar";
    default:
      return "/(tabs)";
  }
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen() {
  const p = usePalette();
  const router = useRouter();
  const { isAuthenticated, authFetch } = useAuth();
  const { t } = useT();
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!isAuthenticated) {
      return Promise.resolve().then(() => setItems([]));
    }
    return authFetch<Paginated<NotificationItem>>("/notifications/")
      .then((d) => setItems(d.results))
      .catch(() => setItems([]));
  }, [isAuthenticated, authFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  async function markAll() {
    try {
      await authFetch("/notifications/mark-all-read/", { method: "POST" });
      setItems((prev) => prev?.map((n) => ({ ...n, is_read: true })) ?? null);
    } catch {
      /* ignore */
    }
  }

  function openNotification(n: NotificationItem) {
    if (!n.is_read) {
      setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)) ?? null);
      authFetch(`/notifications/${n.id}/mark_read/`, { method: "POST" }).catch(() => {});
    }
    router.push(hrefFor(n));
  }

  if (!isAuthenticated) {
    return (
      <ScreenScroll>
        <Card style={{ alignItems: "center", gap: 12, paddingVertical: 28 }}>
          <Ionicons name="notifications-off-outline" size={34} color={p.textMuted} />
          <Text style={{ color: p.text, fontWeight: "800", fontSize: 16 }}>Log in to see notifications</Text>
          <View style={{ width: "100%" }}>
            <Button title="Log in" icon="log-in" onPress={() => router.push("/login")} />
          </View>
        </Card>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll onRefresh={onRefresh} refreshing={refreshing}>
      {items == null ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState icon="notifications-outline" title={t("list.caughtUp")} subtitle="New alerts will show up here." />
      ) : (
        <>
          <Pressable onPress={markAll} style={{ alignSelf: "flex-end" }} hitSlop={8}>
            <Text style={{ color: RESQ.navy, fontWeight: "700", fontSize: 13 }}>{t("act.markAll")}</Text>
          </Pressable>
          {items.map((n) => (
            <Pressable key={n.id} onPress={() => openNotification(n)}>
              <Card style={{ flexDirection: "row", gap: 12, alignItems: "center", opacity: n.is_read ? 0.7 : 1 }}>
                <View style={[styles.dot, { backgroundColor: n.is_read ? p.border : RESQ.red }]} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: p.text, fontWeight: "700" }}>{n.title}</Text>
                  <Muted>{n.body}</Muted>
                  <Text style={{ color: p.textMuted, fontSize: 11, marginTop: 3 }}>{timeAgo(n.created_at)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={p.textMuted} />
              </Card>
            </Pressable>
          ))}
        </>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
});
