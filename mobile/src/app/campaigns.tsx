import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Card, EmptyState, Loading, Muted, Pill, RESQ, ScreenScroll } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/i18n";
import type { Campaign, Paginated } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

function fmt(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function CampaignsScreen() {
  const p = usePalette();
  const { t } = useT();
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    () =>
      apiFetch<Paginated<Campaign>>("/campaigns/?status=published")
        .then((d) => setCampaigns(d.results))
        .catch(() => setCampaigns([])),
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
      {campaigns == null ? (
        <Loading />
      ) : campaigns.length === 0 ? (
        <EmptyState icon="megaphone-outline" title={t("list.noCampaigns")} subtitle="Community drives will appear here." />
      ) : (
        campaigns.map((c) => (
          <Card key={c.id} style={{ padding: 0, overflow: "hidden" }}>
            {c.banner_image && <Image source={{ uri: c.banner_image }} style={{ width: "100%", height: 170 }} contentFit="cover" />}
            <View style={{ padding: 14, gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: p.textMuted, fontSize: 11 }}>{c.organizer_name}</Text>
                <Pill label={c.category.replace("_", " ")} color={RESQ.saffron} />
              </View>
              <Text style={{ color: p.text, fontWeight: "800", fontSize: 16 }}>{c.title}</Text>
              <Muted>{c.description}</Muted>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
                <Text style={{ color: RESQ.navy, fontWeight: "700", fontSize: 12 }}>📍 {c.city}</Text>
                <Text style={{ color: RESQ.green, fontWeight: "700", fontSize: 12 }}>🗓 {fmt(c.starts_at)}</Text>
                <Text style={{ color: p.textMuted, fontSize: 12 }}>{c.registered_count} registered</Text>
              </View>
            </View>
          </Card>
        ))
      )}
    </ScreenScroll>
  );
}
