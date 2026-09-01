import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Loading, Muted, Pill, RESQ, ScreenScroll } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { statusColor } from "@/lib/theme";
import type { Paginated, PublicFeedReport } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

export default function MissingPersonsScreen() {
  const p = usePalette();
  const router = useRouter();
  const { t } = useT();
  const [reports, setReports] = useState<PublicFeedReport[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    () =>
      apiFetch<Paginated<PublicFeedReport>>("/missing-persons/")
        .then((d) => setReports(d.results))
        .catch(() => setReports([])),
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
      <Button title={t("act.report")} icon="add-circle" color={RESQ.saffron} onPress={() => router.push("/report-missing")} />
      {reports == null ? (
        <Loading />
      ) : reports.length === 0 ? (
        <EmptyState icon="body-outline" title={t("list.noReports")} subtitle="Reported missing people will appear here." />
      ) : (
        reports.map((r) => (
          <Card key={r.id} style={{ flexDirection: "row", gap: 12 }}>
            {r.photos?.[0]?.image ? (
              <Image source={{ uri: r.photos[0].image }} style={styles.photo} contentFit="cover" />
            ) : (
              <View style={[styles.photo, { backgroundColor: p.surface, alignItems: "center", justifyContent: "center" }]}>
                <Ionicons name="person" size={26} color={p.textMuted} />
              </View>
            )}
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: p.text, fontWeight: "800", fontSize: 15 }}>
                  {r.name}
                  {r.age ? `, ${r.age}` : ""}
                </Text>
                <Pill label={r.status} color={statusColor(r.status)} />
              </View>
              <Muted>Last seen: {r.last_seen_location}</Muted>
              {!!r.clothing_description && (
                <Text style={{ color: p.textMuted, fontSize: 12 }} numberOfLines={2}>
                  {r.clothing_description}
                </Text>
              )}
            </View>
          </Card>
        ))
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  photo: { width: 76, height: 76, borderRadius: 12 },
});
