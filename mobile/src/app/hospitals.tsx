import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Card, EmptyState, Loading, Muted, Pill, RESQ, ScreenScroll } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/i18n";
import type { Hospital, Paginated } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

export default function HospitalsScreen() {
  const p = usePalette();
  const { t } = useT();
  const [items, setItems] = useState<Hospital[] | null>(null);
  const [located, setLocated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    const fallback = () =>
      apiFetch<Paginated<Hospital>>("/hospitals/")
        .then((d) => setItems(d.results))
        .catch(() => setItems([]));
    return Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== "granted") return fallback();
        return Location.getCurrentPositionAsync({}).then((pos) =>
          apiFetch<Hospital[]>(
            `/hospitals/nearby/?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius_km=30`,
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
      <Text style={{ color: p.text, fontSize: 20, fontWeight: "900" }}>{t("hosp.title")}</Text>
      {!located && items && <Muted>{t("dir.locate")}</Muted>}

      {items == null ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState icon="medkit-outline" title={t("dir.none")} />
      ) : (
        items.map((h) => {
          const call = h.emergency_phone || h.phone;
          return (
            <Card key={h.id} style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: p.text, fontWeight: "800", fontSize: 15 }}>{h.name}</Text>
                  <Muted>
                    {h.hospital_type.replace("_", " ")} · {h.city}
                  </Muted>
                </View>
                {h.distance_km != null && <Pill label={`${h.distance_km.toFixed(1)} km`} color={RESQ.navy} />}
              </View>

              {(h.has_trauma_center || h.has_blood_bank) && (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {h.has_trauma_center && <Pill label={t("dir.trauma")} color={RESQ.red} />}
                  {h.has_blood_bank && <Pill label={t("dir.bloodBank")} color={RESQ.green} />}
                </View>
              )}

              {call ? (
                <Pressable onPress={() => Linking.openURL(`tel:${call}`)} style={[styles.call, { backgroundColor: RESQ.red }]}>
                  <Ionicons name="call" size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                    {(h.emergency_phone ? t("dir.emergency") : t("dir.call")) + ` · ${call}`}
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
