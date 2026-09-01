import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandTopBar } from "@/components/top-bar";
import { Avatar, Button, Card, Loading, Muted, Pill, RESQ, ScreenScroll, SectionHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { SUPPORTED_LANGUAGES, useT, type TKey } from "@/lib/i18n";
import { statusColor } from "@/lib/theme";
import { usePalette } from "@/lib/use-theme";

type Glyph = keyof typeof Ionicons.glyphMap;

const MENU: { tkey: TKey; icon: Glyph; color: string; href: Href }[] = [
  { tkey: "menu.missing", icon: "body", color: RESQ.saffron, href: "/missing-persons" },
  { tkey: "menu.blood", icon: "water", color: RESQ.green, href: "/blood-donation" },
  { tkey: "menu.disaster", icon: "rainy", color: RESQ.indigo, href: "/disaster-mode" },
  { tkey: "menu.campaigns", icon: "megaphone", color: RESQ.navy, href: "/campaigns" },
  { tkey: "menu.events", icon: "people-circle", color: RESQ.indigo, href: "/events" },
  { tkey: "menu.calendar", icon: "calendar", color: RESQ.green, href: "/calendar" },
  { tkey: "menu.gallery", icon: "images", color: RESQ.indigo, href: "/gallery" },
  { tkey: "menu.notifications", icon: "notifications", color: RESQ.red, href: "/notifications" },
  { tkey: "sos.manageContacts", icon: "people-circle", color: RESQ.red, href: "/trusted-contacts" },
  { tkey: "menu.assistant", icon: "chatbubble-ellipses", color: RESQ.navy, href: "/assistant" },
];

export default function ProfileScreen() {
  const p = usePalette();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { t, language, setLanguage } = useT();

  return (
    <View style={{ flex: 1, backgroundColor: p.background }}>
      <BrandTopBar title={t("tab.profile")} />
      <ScreenScroll>
        {isLoading ? (
          <Loading />
        ) : isAuthenticated && user ? (
          <Card style={{ alignItems: "center", gap: 8, paddingVertical: 22 }}>
            <Avatar name={user.full_name} size={72} />
            <Text style={{ color: p.text, fontSize: 20, fontWeight: "800" }}>{user.full_name}</Text>
            {user.email ? <Muted>{user.email}</Muted> : null}
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pill label={user.role.replace("_", " ")} color={RESQ.navy} />
              <Pill
                label={user.is_verified ? "verified" : "unverified"}
                color={statusColor(user.is_verified ? "verified" : "critical")}
              />
            </View>
          </Card>
        ) : (
          <Card style={{ alignItems: "center", gap: 12, paddingVertical: 24 }}>
            <Avatar name="" size={64} />
            <Text style={{ color: p.text, fontSize: 18, fontWeight: "800" }}>{t("prof.welcome")}</Text>
            <View style={{ width: "100%" }}>
              <Button title={t("common.login")} icon="log-in" onPress={() => router.push("/login")} />
            </View>
          </Card>
        )}

        {/* Language switcher */}
        <SectionHeader title={t("prof.chooseLanguage")} />
        <Card>
          <View style={styles.langWrap}>
            {SUPPORTED_LANGUAGES.map((l) => {
              const active = l.code === language;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => setLanguage(l.code)}
                  style={[
                    styles.langChip,
                    active ? { backgroundColor: RESQ.navy, borderColor: RESQ.navy } : { borderColor: p.border },
                  ]}
                >
                  <Text style={{ color: active ? "#fff" : p.text, fontWeight: "600", fontSize: 13 }}>{l.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Module menu */}
        <SectionHeader title={t("prof.explore")} />
        <Card style={{ padding: 0 }}>
          {MENU.map((m, i) => (
            <Pressable
              key={m.tkey}
              onPress={() => router.push(m.href)}
              style={({ pressed }) => [
                styles.menuRow,
                { borderTopColor: p.border, borderTopWidth: i === 0 ? 0 : 1, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${m.color}1F` }]}>
                <Ionicons name={m.icon} size={18} color={m.color} />
              </View>
              <Text style={{ color: p.text, fontWeight: "600", flex: 1 }}>{t(m.tkey)}</Text>
              <Ionicons name="chevron-forward" size={18} color={p.textMuted} />
            </Pressable>
          ))}
        </Card>

        {isAuthenticated && user && (
          <>
            <SectionHeader title={t("prof.account")} />
            <Card>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color={p.textMuted} />
                <Text style={{ color: p.text, flex: 1 }}>{t("prof.city")}</Text>
                <Text style={{ color: p.text }}>{user.city || "—"}</Text>
              </View>
              <View style={[styles.infoRow, { marginTop: 12 }]}>
                <Ionicons name="language-outline" size={18} color={p.textMuted} />
                <Text style={{ color: p.text, flex: 1 }}>{t("prof.language")}</Text>
                <Text style={{ color: p.text, textTransform: "uppercase" }}>{language}</Text>
              </View>
              <View style={[styles.infoRow, { marginTop: 12 }]}>
                <Ionicons name="call-outline" size={18} color={p.textMuted} />
                <Text style={{ color: p.text, flex: 1 }}>{t("prof.phone")}</Text>
                <Text style={{ color: p.text }}>{user.phone || "—"}</Text>
              </View>
            </Card>
            <Button title={t("common.logout")} icon="log-out" color={RESQ.red} onPress={logout} />
          </>
        )}

        <Muted>ResQ Bharath · Community emergency platform · v1</Muted>
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  langWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  langChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
});
