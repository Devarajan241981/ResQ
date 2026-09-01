import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandTopBar } from "@/components/top-bar";
import { Card, EmptyState, Muted, RESQ, ScreenScroll, SectionHeader, ServiceTile, StatCard } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useT, type TKey } from "@/lib/i18n";
import type { Campaign, EventItem, Paginated, PublicFeedReport } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

type Glyph = keyof typeof Ionicons.glyphMap;

const SERVICES: { tkey: TKey; icon: Glyph; color: string; href: Href }[] = [
  { tkey: "svc.missing", icon: "body", color: RESQ.saffron, href: "/missing-persons" },
  { tkey: "svc.sos", icon: "alert-circle", color: RESQ.red, href: "/sos" },
  { tkey: "svc.blood", icon: "water", color: RESQ.green, href: "/blood-donation" },
  { tkey: "svc.disaster", icon: "rainy", color: RESQ.indigo, href: "/disaster-mode" },
  { tkey: "svc.campaigns", icon: "megaphone", color: RESQ.navy, href: "/campaigns" },
  { tkey: "svc.community", icon: "people", color: RESQ.saffron, href: "/community" },
  { tkey: "svc.hospitals", icon: "medkit", color: RESQ.red, href: "/hospitals" },
  { tkey: "svc.shelters", icon: "home", color: RESQ.green, href: "/shelters" },
  { tkey: "svc.calendar", icon: "calendar", color: RESQ.green, href: "/calendar" },
  { tkey: "svc.gallery", icon: "images", color: RESQ.indigo, href: "/gallery" },
];

export default function HomeScreen() {
  const p = usePalette();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useT();
  const [missing, setMissing] = useState<number | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await Promise.all([
      apiFetch<Paginated<PublicFeedReport>>("/missing-persons/").then((d) => setMissing(d.count)).catch(() => {}),
      apiFetch<Paginated<EventItem>>("/events/events/").then((d) => setEvents(d.results)).catch(() => {}),
      apiFetch<Paginated<Campaign>>("/campaigns/?status=published").then((d) => setCampaigns(d.results)).catch(() => {}),
    ]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  const firstName = user?.full_name?.trim().split(/\s+/)[0];

  return (
    <View style={{ flex: 1, backgroundColor: p.background }}>
      <BrandTopBar />
      <ScreenScroll onRefresh={onRefresh} refreshing={refreshing}>
        {/* Greeting hero */}
        <View style={styles.hero}>
          <Text style={styles.heroBadge}>{t("home.badge")}</Text>
          <Text style={styles.heroTitle}>{firstName ? t("home.greeting", { name: firstName }) : t("home.greetingGuest")}</Text>
          <Text style={styles.heroSub}>{t("home.heroSub")}</Text>
          <Pressable style={styles.heroBtn} onPress={() => router.push("/sos")}>
            <Ionicons name="alert-circle" size={18} color="#fff" />
            <Text style={styles.heroBtnText}>{t("home.emergencySos")}</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatCard icon="grid" value="13" label={t("stats.services")} color={RESQ.navy} />
          <StatCard icon="shield-checkmark" value="24/7" label={t("stats.response")} color={RESQ.red} />
          <StatCard icon="body" value={missing != null ? String(missing) : "—"} label={t("stats.missing")} color={RESQ.saffron} />
          <StatCard icon="language" value="10" label={t("stats.languages")} color={RESQ.green} />
        </View>

        {/* Services grid */}
        <SectionHeader title={t("home.services")} />
        <View style={styles.grid}>
          {SERVICES.map((s) => (
            <ServiceTile key={s.tkey} icon={s.icon} label={t(s.tkey)} color={s.color} onPress={() => router.push(s.href)} />
          ))}
        </View>

        {/* Trending events */}
        <SectionHeader title={t("home.trending")} actionLabel={t("common.seeAll")} onAction={() => router.push("/events")} />
        {events.length === 0 ? (
          <Card>
            <Muted>{t("home.noEvents")}</Muted>
          </Card>
        ) : (
          events.slice(0, 3).map((ev) => (
            <Pressable key={ev.id} onPress={() => router.push("/events")}>
              <Card>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={{ color: p.text, fontWeight: "700" }}>{ev.title}</Text>
                    <Muted>
                      {ev.event_date}
                      {ev.city ? ` · ${ev.city}` : ""}
                    </Muted>
                  </View>
                  <View style={[styles.rsvp, { backgroundColor: `${RESQ.green}1F` }]}>
                    <Ionicons name="people" size={14} color={RESQ.green} />
                    <Text style={{ color: RESQ.green, fontWeight: "700", fontSize: 12 }}>{ev.rsvp_count}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))
        )}

        {/* Campaigns feed */}
        <SectionHeader title={t("home.latestCampaigns")} actionLabel={t("common.seeAll")} onAction={() => router.push("/campaigns")} />
        {campaigns.length === 0 ? (
          <EmptyState icon="megaphone-outline" title="No campaigns yet" subtitle="Community drives will appear here." />
        ) : (
          campaigns.slice(0, 4).map((c) => (
            <Pressable key={c.id} onPress={() => router.push("/campaigns")}>
              <Card style={{ padding: 0, overflow: "hidden" }}>
                {c.banner_image && (
                  <Image source={{ uri: c.banner_image }} style={{ width: "100%", height: 160 }} contentFit="cover" />
                )}
                <View style={{ padding: 14, gap: 4 }}>
                  <Text style={{ color: p.textMuted, fontSize: 11 }}>{c.organizer_name}</Text>
                  <Text style={{ color: p.text, fontWeight: "800", fontSize: 15 }}>{c.title}</Text>
                  <Muted>{c.description}</Muted>
                  <Text style={{ color: RESQ.navy, fontWeight: "700", fontSize: 12, marginTop: 4 }}>
                    {c.city} · {c.registered_count} registered
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))
        )}

        <Muted>{t("home.dangerNote")}</Muted>
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: RESQ.navy, borderRadius: 20, padding: 20, gap: 8 },
  heroBadge: { color: RESQ.saffron, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  heroTitle: { color: "#fff", fontSize: 26, fontWeight: "900" },
  heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 20 },
  heroBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    backgroundColor: RESQ.red,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },
  heroBtnText: { color: "#fff", fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rsvp: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
});
