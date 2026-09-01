import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Card, EmptyState, Loading, Muted, Pill, RESQ, ScreenScroll } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/i18n";
import type { Paginated, Shelter } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

export default function SheltersScreen() {
  const p = usePalette();
  const { t } = useT();
  const [items, setItems] = useState<Shelter[] | null>(null);
  const [located, setLocated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    const fallback = () =>
      apiFetch<Paginated<Shelter>>("/shelters/")
        .then((d) => setItems(d.results))
        .catch(() => setItems([]));
    return Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== "granted") return fallback();
        return Location.getCurrentPositionAsync({}).then((pos) =>
          apiFetch<Shelter[]>(
            `/shelters/nearby/?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius_km=30`,
          ).then((data) => {
            setItems([...data].sort((a, b) => (a.distance_km ?? 1e9) - (b.distance_km ?? 1e9)));
            setLocated(true);
          }),
        );
      })
      .catch(fallback);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  return (
    <ScreenScroll onRefresh={onRefresh} refreshing={refreshing}>
      <Text style={{ color: p.text, fontSize: 20, fontWeight: "900" }}>{t("shel.title")}</Text>
      {!located && items && <Muted>{t("dir.locate")}</Muted>}

      {items == null ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState icon="home-outline" title={t("dir.none")} />
      ) : (
        items.map((s) => {
          const full = s.available_capacity <= 0;
          return (
            <Card key={s.id} style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: p.text, fontWeight: "800", fontSize: 15 }}>{s.name}</Text>
                  <Muted>
                    {s.shelter_type.replace("_", " ")} · {s.city}
                  </Muted>
                </View>
                {s.distance_km != null && <Pill label={`${s.distance_km.toFixed(1)} km`} color={RESQ.navy} />}
              </View>

              <Pill label={`${s.available_capacity} / ${s.capacity} ${t("dir.beds")}`} color={full ? RESQ.red : RESQ.green} />

              {s.contact_phone ? (
                <Pressable onPress={() => Linking.openURL(`tel:${s.contact_phone}`)} style={[styles.call, { backgroundColor: RESQ.navy }]}>
                  <Ionicons name="call" size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                    {t("dir.call")} · {s.contact_phone}
                  </Text>
                </Pressable>
              ) : null}
            </Card>
          );
        })
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  call: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 11 },
});
