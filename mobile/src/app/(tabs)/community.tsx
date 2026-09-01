import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BrandTopBar } from "@/components/top-bar";
import { Card, EmptyState, Muted, RESQ, ScreenScroll, SectionHeader } from "@/components/ui";
import { apiFetch, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import type { Campaign, Community, GalleryImage, Paginated } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

export default function CommunityScreen() {
  const p = usePalette();
  const router = useRouter();
  const { isAuthenticated, authFetch } = useAuth();
  const { t } = useT();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    await Promise.all([
      apiFetch<Paginated<Community>>("/community/").then((d) => setCommunities(d.results)).catch(() => {}),
      apiFetch<Paginated<GalleryImage>>("/gallery/images/").then((d) => setGallery(d.results)).catch(() => {}),
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

  async function toggleJoin(c: Community) {
    if (!isAuthenticated) {
      Alert.alert("Log in required", "Log in to join community groups.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log in", onPress: () => router.push("/login") },
      ]);
      return;
    }
    setBusy(c.id);
    const action = c.is_member ? "leave" : "join";
    try {
      await authFetch(`/community/${c.id}/${action}/`, { method: "POST" });
      setCommunities((prev) =>
        prev.map((x) =>
          x.id === c.id
            ? { ...x, is_member: !c.is_member, member_count: x.member_count + (c.is_member ? -1 : 1) }
            : x,
        ),
      );
    } catch (err) {
      Alert.alert("Could not update", extractErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: p.background }}>
      <BrandTopBar title={t("tab.community")} />
      <ScreenScroll onRefresh={onRefresh} refreshing={refreshing}>
        {/* Gallery highlights */}
        {gallery.length > 0 && (
          <>
            <SectionHeader title={t("comm.highlights")} actionLabel={t("svc.gallery")} onAction={() => router.push("/gallery")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {gallery.slice(0, 10).map((g) => (
                <Pressable key={g.id} onPress={() => router.push("/gallery")}>
                  <Image source={{ uri: g.image }} style={styles.highlight} contentFit="cover" />
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Communities */}
        <SectionHeader title={t("comm.groups")} />
        {communities.length === 0 ? (
          <EmptyState icon="people-outline" title={t("comm.noGroups")} subtitle="Community groups will appear here." />
        ) : (
          communities.map((c) => (
            <Card key={c.id}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: p.text, fontWeight: "800", fontSize: 15 }}>{c.name}</Text>
                  <Muted>
                    {c.city} · {c.member_count} members
                  </Muted>
                </View>
                <Pressable
                  onPress={() => toggleJoin(c)}
                  disabled={busy === c.id}
                  style={[
                    styles.joinBtn,
                    c.is_member
                      ? { backgroundColor: p.surface, borderColor: p.border, borderWidth: 1 }
                      : { backgroundColor: RESQ.navy },
                  ]}
                >
                  <Text style={{ color: c.is_member ? p.text : "#fff", fontWeight: "700", fontSize: 13 }}>
                    {c.is_member ? t("comm.joined") : t("comm.join")}
                  </Text>
                </Pressable>
              </View>
              {!!c.description && (
                <Text style={{ color: p.textMuted, fontSize: 13, marginTop: 8 }} numberOfLines={2}>
                  {c.description}
                </Text>
              )}
            </Card>
          ))
        )}

        {/* Campaigns */}
        <SectionHeader title={t("svc.campaigns")} actionLabel={t("common.seeAll")} onAction={() => router.push("/campaigns")} />
        {campaigns.slice(0, 3).map((c) => (
          <Pressable key={c.id} onPress={() => router.push("/campaigns")}>
            <Card style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View style={[styles.campIcon, { backgroundColor: `${RESQ.saffron}1F` }]}>
                <Ionicons name="megaphone" size={20} color={RESQ.saffron} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: p.text, fontWeight: "700" }} numberOfLines={1}>
                  {c.title}
                </Text>
                <Muted>
                  {c.city} · {c.registered_count} registered
                </Muted>
              </View>
              <Ionicons name="chevron-forward" size={18} color={p.textMuted} />
            </Card>
          </Pressable>
        ))}
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: { width: 120, height: 150, borderRadius: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  joinBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999 },
  campIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
