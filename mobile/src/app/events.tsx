import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Card, EmptyState, Loading, Muted, Pill, RESQ, ScreenScroll } from "@/components/ui";
import { apiFetch, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import type { EventItem, Paginated } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

export default function EventsScreen() {
  const p = usePalette();
  const router = useRouter();
  const { isAuthenticated, authFetch } = useAuth();
  const { t } = useT();
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(
    () =>
      apiFetch<Paginated<EventItem>>("/events/events/")
        .then((d) => setEvents(d.results))
        .catch(() => setEvents([])),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  async function toggleRsvp(ev: EventItem) {
    if (!isAuthenticated) {
      Alert.alert("Log in required", "Log in to RSVP to events.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log in", onPress: () => router.push("/login") },
      ]);
      return;
    }
    setBusy(ev.id);
    const action = ev.has_rsvped ? "cancel-rsvp" : "rsvp";
    try {
      await authFetch(`/events/events/${ev.id}/${action}/`, { method: "POST" });
      setEvents((prev) =>
        prev
          ? prev.map((x) =>
              x.id === ev.id
                ? { ...x, has_rsvped: !ev.has_rsvped, rsvp_count: x.rsvp_count + (ev.has_rsvped ? -1 : 1) }
                : x,
            )
          : prev,
      );
    } catch (err) {
      Alert.alert("Could not update RSVP", extractErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScreenScroll onRefresh={onRefresh} refreshing={refreshing}>
      {events == null ? (
        <Loading />
      ) : events.length === 0 ? (
        <EmptyState icon="calendar-outline" title={t("list.noEvents")} subtitle="Community events will appear here." />
      ) : (
        events.map((ev) => (
          <Card key={ev.id} style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: p.text, fontWeight: "800", fontSize: 15, flex: 1, paddingRight: 8 }}>{ev.title}</Text>
              <Pill label={ev.category.replace("_", " ")} color={RESQ.indigo} />
            </View>
            {!!ev.description && (
              <Text style={{ color: p.textMuted, fontSize: 13 }} numberOfLines={2}>
                {ev.description}
              </Text>
            )}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="calendar" size={14} color={RESQ.green} />
              <Muted>
                {ev.event_date}
                {ev.city ? ` · ${ev.city}` : ""}
              </Muted>
            </View>
            <Pressable
              onPress={() => toggleRsvp(ev)}
              disabled={busy === ev.id}
              style={[
                styles.rsvp,
                ev.has_rsvped ? { backgroundColor: `${RESQ.green}1F` } : { backgroundColor: RESQ.navy },
              ]}
            >
              <Ionicons
                name={ev.has_rsvped ? "checkmark-circle" : "people"}
                size={16}
                color={ev.has_rsvped ? RESQ.green : "#fff"}
              />
              <Text style={{ color: ev.has_rsvped ? RESQ.green : "#fff", fontWeight: "700", fontSize: 13 }}>
                {ev.has_rsvped ? `${t("act.going")} · ${ev.rsvp_count}` : `${t("act.rsvp")} · ${ev.rsvp_count}`}
              </Text>
            </Pressable>
          </Card>
        ))
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  rsvp: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 11,
  },
});
