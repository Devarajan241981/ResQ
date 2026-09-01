import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { BrandTopBar } from "@/components/top-bar";
import { Card, Muted, RESQ, ScreenScroll, SectionHeader } from "@/components/ui";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useT, type TKey } from "@/lib/i18n";
import type { SOSAlert } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

const HELPLINES: { num: string; tkey: TKey; icon: keyof typeof Ionicons.glyphMap }[] = [
  { num: "100", tkey: "hl.police", icon: "shield" },
  { num: "108", tkey: "hl.ambulance", icon: "medkit" },
  { num: "101", tkey: "hl.fire", icon: "flame" },
  { num: "1091", tkey: "hl.women", icon: "female" },
  { num: "1098", tkey: "hl.child", icon: "happy" },
  { num: "1077", tkey: "hl.disaster", icon: "rainy" },
];

const PING_MS = 15000;

export default function SosScreen() {
  const p = usePalette();
  const router = useRouter();
  const { isAuthenticated, authFetch } = useAuth();
  const { t } = useT();
  const [active, setActive] = useState<SOSAlert | null>(null);
  const [sending, setSending] = useState(false);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopStreaming() {
    if (pingRef.current) {
      clearInterval(pingRef.current);
      pingRef.current = null;
    }
  }

  // Stream live location while an SOS is active.
  function startStreaming(alertId: string) {
    stopStreaming();
    pingRef.current = setInterval(async () => {
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await authFetch(`/sos/alerts/${alertId}/ping/`, {
          method: "POST",
          body: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        });
      } catch {
        /* keep trying on the next tick */
      }
    }, PING_MS);
  }

  useEffect(() => stopStreaming, []);

  async function triggerSos() {
    if (!isAuthenticated) {
      Alert.alert("Log in to alert your network", "You can still Call 112 above without an account.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log in", onPress: () => router.push("/login") },
      ]);
      return;
    }
    setSending(true);
    try {
      let latitude: number | null = null;
      let longitude: number | null = null;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }
      const alert = await authFetch<SOSAlert>("/sos/alerts/", {
        method: "POST",
        body: { notes: "Triggered from ResQ mobile app", latitude, longitude },
      });
      setActive(alert);
      startStreaming(alert.id);
    } catch (err) {
      Alert.alert("Could not send SOS", extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function endSos() {
    stopStreaming();
    const alert = active;
    setActive(null);
    if (alert) {
      try {
        await authFetch(`/sos/alerts/${alert.id}/resolve/`, { method: "POST" });
      } catch {
        /* already ended is fine */
      }
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: p.background }}>
      <BrandTopBar title={t("sos.title")} />
      <ScreenScroll>
        {/* PRIMARY: call 112 — always available, even logged out */}
        <Pressable onPress={() => Linking.openURL("tel:112")} style={styles.call112}>
          <Ionicons name="call" size={30} color="#fff" />
          <Text style={styles.call112Text}>{t("sos.call112")}</Text>
        </Pressable>
        <Muted>{t("sos.call112sub")}</Muted>

        {/* COMMUNITY SOS */}
        {active ? (
          <Card style={{ borderColor: RESQ.red, borderWidth: 2, gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={styles.liveDot} />
              <Text style={{ color: RESQ.red, fontWeight: "900", fontSize: 16, letterSpacing: 1 }}>{t("sos.active")}</Text>
            </View>
            <Muted>{t("sos.sharing")}</Muted>
            <Pressable onPress={endSos} style={[styles.safeBtn, { backgroundColor: RESQ.green }]}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800" }}>{t("sos.imSafe")}</Text>
            </Pressable>
          </Card>
        ) : (
          <Pressable
            onPress={triggerSos}
            disabled={sending}
            style={[styles.sendAlert, { backgroundColor: p.card, borderColor: RESQ.red, opacity: sending ? 0.6 : 1 }]}
          >
            <View style={[styles.sendIcon, { backgroundColor: `${RESQ.red}1F` }]}>
              <Ionicons name="megaphone" size={22} color={RESQ.red} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: p.text, fontWeight: "800", fontSize: 15 }}>
                {sending ? t("sos.sending") : t("sos.sendAlert")}
              </Text>
              <Text style={{ color: p.textMuted, fontSize: 12 }}>{t("sos.sendAlertSub")}</Text>
            </View>
          </Pressable>
        )}

        {/* Quick dial */}
        <SectionHeader title={t("sos.quickDial")} />
        <View style={styles.grid}>
          {HELPLINES.map((h) => (
            <Pressable
              key={h.num}
              onPress={() => Linking.openURL(`tel:${h.num}`)}
              style={[styles.line, { backgroundColor: p.card, borderColor: p.border }]}
            >
              <View style={[styles.lineIcon, { backgroundColor: `${RESQ.green}1F` }]}>
                <Ionicons name={h.icon} size={16} color={RESQ.green} />
              </View>
              <Text style={{ color: p.text, fontWeight: "800", fontSize: 17 }}>{h.num}</Text>
              <Text style={{ color: p.textMuted, fontSize: 12 }}>{t(h.tkey)}</Text>
            </Pressable>
          ))}
        </View>

        {/* Nearest emergency services + manage contacts */}
        <Pressable onPress={() => router.push("/hospitals")} style={[styles.manage, { backgroundColor: p.card, borderColor: p.border }]}>
          <Ionicons name="medkit" size={18} color={RESQ.red} />
          <Text style={{ color: p.text, fontWeight: "700", flex: 1 }}>{t("hosp.title")}</Text>
          <Ionicons name="chevron-forward" size={18} color={p.textMuted} />
        </Pressable>
        <Pressable onPress={() => router.push("/shelters")} style={[styles.manage, { backgroundColor: p.card, borderColor: p.border }]}>
          <Ionicons name="home" size={18} color={RESQ.green} />
          <Text style={{ color: p.text, fontWeight: "700", flex: 1 }}>{t("shel.title")}</Text>
          <Ionicons name="chevron-forward" size={18} color={p.textMuted} />
        </Pressable>
        <Pressable
          onPress={() => router.push("/trusted-contacts")}
          style={[styles.manage, { backgroundColor: p.card, borderColor: p.border }]}
        >
          <Ionicons name="people" size={18} color={RESQ.navy} />
          <Text style={{ color: p.text, fontWeight: "700", flex: 1 }}>{t("sos.manageContacts")}</Text>
          <Ionicons name="chevron-forward" size={18} color={p.textMuted} />
        </Pressable>

        <Card>
          <Muted>{t("sos.disclaimer")}</Muted>
        </Card>
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  call112: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: RESQ.red,
    borderRadius: 18,
    paddingVertical: 22,
    shadowColor: RESQ.red,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  call112Text: { color: "#fff", fontWeight: "900", fontSize: 26, letterSpacing: 1 },
  liveDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: RESQ.red },
  safeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 12 },
  sendAlert: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 16, padding: 14 },
  sendIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  line: { width: "30%", flexGrow: 1, minWidth: 90, borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: "center", gap: 3 },
  lineIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  manage: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, padding: 14 },
});
