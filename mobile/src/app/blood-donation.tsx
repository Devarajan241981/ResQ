import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Loading, Muted, Pill, RESQ, ScreenScroll } from "@/components/ui";
import { apiFetch, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { statusColor } from "@/lib/theme";
import type { BloodRequest, Paginated } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

export default function BloodDonationScreen() {
  const p = usePalette();
  const router = useRouter();
  const { isAuthenticated, authFetch } = useAuth();
  const { t } = useT();
  const [requests, setRequests] = useState<BloodRequest[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [responded, setResponded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(
    () =>
      apiFetch<Paginated<BloodRequest>>("/blood-donation/requests/?status=open")
        .then((d) => setRequests(d.results))
        .catch(() => setRequests([])),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  async function respond(id: string) {
    if (!isAuthenticated) {
      Alert.alert("Log in required", "Log in to respond to blood requests.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log in", onPress: () => router.push("/login") },
      ]);
      return;
    }
    setBusy(id);
    try {
      await authFetch(`/blood-donation/requests/${id}/respond/`, { method: "POST" });
      setResponded((prev) => new Set(prev).add(id));
    } catch (err) {
      Alert.alert("Could not respond", extractErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScreenScroll onRefresh={onRefresh} refreshing={refreshing}>
      <Button title={t("act.raiseBlood")} icon="add-circle" color={RESQ.red} onPress={() => router.push("/blood-request-new")} />

      {requests == null ? (
        <Loading />
      ) : requests.length === 0 ? (
        <EmptyState icon="water-outline" title={t("list.noBlood")} subtitle="Open blood requests will appear here." />
      ) : (
        requests.map((r) => {
          const did = responded.has(r.id);
          return (
            <Card key={r.id}>
              <View style={styles.row}>
                <View style={[styles.group, { backgroundColor: `${RESQ.red}1F` }]}>
                  <Text style={{ color: RESQ.red, fontWeight: "900", fontSize: 18 }}>{r.blood_group}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: p.text, fontWeight: "800" }}>{r.patient_name}</Text>
                  <Muted>
                    {r.units_needed} unit{r.units_needed === 1 ? "" : "s"} · {r.city}
                  </Muted>
                </View>
                <Pill label={r.urgency} color={statusColor(r.urgency)} />
              </View>
              {!!r.notes && (
                <Text style={{ color: p.textMuted, fontSize: 13, marginTop: 8 }} numberOfLines={2}>
                  {r.notes}
                </Text>
              )}
              <Pressable
                onPress={() => respond(r.id)}
                disabled={did || busy === r.id}
                style={[styles.respond, did ? { backgroundColor: `${RESQ.green}1F` } : { backgroundColor: RESQ.green }]}
              >
                <Ionicons name={did ? "checkmark-circle" : "hand-left"} size={16} color={did ? RESQ.green : "#fff"} />
                <Text style={{ color: did ? RESQ.green : "#fff", fontWeight: "700", fontSize: 13 }}>
                  {did ? t("act.responded") : t("act.canDonate")}
                </Text>
              </Pressable>
            </Card>
          );
        })
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  group: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  respond: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 11,
  },
});
