import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, EmptyState, Loading, Muted, Pill, RESQ, ScreenScroll } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { statusColor } from "@/lib/theme";
import type { DisasterEvent, Paginated } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

export default function DisasterModeScreen() {
  const p = usePalette();
  const { t } = useT();
  const [events, setEvents] = useState<DisasterEvent[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    () =>
      apiFetch<Paginated<DisasterEvent>>("/disaster-mode/events/?status=active")
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

  return (
    <ScreenScroll onRefresh={onRefresh} refreshing={refreshing}>
      {events == null ? (
        <Loading />
      ) : events.length === 0 ? (
        <EmptyState icon="rainy-outline" title={t("list.noDisaster")} subtitle="Active disaster events will appear here." />
      ) : (
        events.map((e) => (
          <Card key={e.id}>
            <View style={styles.row}>
              <View style={[styles.icon, { backgroundColor: `${RESQ.indigo}1F` }]}>
                <Ionicons name="warning" size={20} color={RESQ.indigo} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: p.text, fontWeight: "800", fontSize: 15 }}>{e.name}</Text>
                <Muted>
                  {e.disaster_type} · {e.affected_area}
                </Muted>
              </View>
              <Pill label={e.status} color={statusColor(e.status)} />
            </View>
            {!!e.description && (
              <Text style={{ color: p.textMuted, fontSize: 13, marginTop: 8 }} numberOfLines={3}>
                {e.description}
              </Text>
            )}
            <View style={[styles.needs, { borderTopColor: p.border }]}>
              <Ionicons name="hand-left" size={15} color={RESQ.red} />
              <Text style={{ color: p.text, fontSize: 13 }}>
                {e.open_needs_count} open need{e.open_needs_count === 1 ? "" : "s"} · within {e.radius_km} km
              </Text>
            </View>
          </Card>
        ))
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  needs: { flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, marginTop: 12, paddingTop: 10 },
});
