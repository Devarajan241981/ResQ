import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BrandTopBar } from "@/components/top-bar";
import { Card, EmptyState, Loading, Muted, Pill, RESQ, SearchField } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useT, type TKey } from "@/lib/i18n";
import { statusColor } from "@/lib/theme";
import type { Paginated, PublicFeedReport, SearchResult } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

const CATEGORIES: { tkey: TKey; color: string; href: Href }[] = [
  { tkey: "svc.missing", color: RESQ.saffron, href: "/missing-persons" },
  { tkey: "svc.blood", color: RESQ.green, href: "/blood-donation" },
  { tkey: "svc.disaster", color: RESQ.indigo, href: "/disaster-mode" },
  { tkey: "svc.campaigns", color: RESQ.navy, href: "/campaigns" },
  { tkey: "svc.community", color: RESQ.red, href: "/community" },
];

export default function SearchScreen() {
  const p = usePalette();
  const router = useRouter();
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [feed, setFeed] = useState<PublicFeedReport[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    apiFetch<Paginated<PublicFeedReport>>("/missing-persons/")
      .then((d) => setFeed(d.results))
      .catch(() => setFeed([]));
  }, []);

  useEffect(() => {
    const q = query.trim();
    // All state updates happen inside the timeout callback so nothing runs
    // synchronously in the effect body.
    const handle = setTimeout(() => {
      if (q.length < 2) {
        setResults(null);
        setSearching(false);
        return;
      }
      setSearching(true);
      apiFetch<{ results: SearchResult[] }>(`/search/?q=${encodeURIComponent(q)}`)
        .then((d) => setResults(d.results))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: p.background }}>
      <BrandTopBar title={t("tab.search")} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 44, gap: 14 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SearchField value={query} onChangeText={setQuery} placeholder={t("search.placeholder")} />

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.tkey}
              onPress={() => router.push(c.href)}
              style={[styles.chip, { borderColor: c.color, backgroundColor: `${c.color}14` }]}
            >
              <Text style={{ color: c.color, fontWeight: "700", fontSize: 13 }}>{t(c.tkey)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Search results */}
        {query.trim().length >= 2 ? (
          searching ? (
            <Loading />
          ) : results && results.length > 0 ? (
            results.map((r) => (
              <Pressable key={`${r.type}-${r.id}`} onPress={() => router.push("/missing-persons")}>
                <Card>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: p.text, fontWeight: "700" }}>{r.title}</Text>
                      {!!r.subtitle && <Muted>{r.subtitle}</Muted>}
                    </View>
                    {!!r.status && <Pill label={r.status} color={statusColor(r.status)} />}
                  </View>
                </Card>
              </Pressable>
            ))
          ) : (
            <EmptyState icon="search-outline" title={t("search.noMatches")} subtitle={`“${query.trim()}”`} />
          )
        ) : (
          <>
            <Text style={{ color: p.text, fontWeight: "800", fontSize: 16, marginTop: 4 }}>{t("search.recent")}</Text>
            {feed == null ? (
              <Loading />
            ) : feed.length === 0 ? (
              <EmptyState icon="body-outline" title="No reports yet" />
            ) : (
              feed.map((r) => (
                <Pressable key={r.id} onPress={() => router.push("/missing-persons")}>
                  <Card style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                    {r.photos?.[0]?.image ? (
                      <Image source={{ uri: r.photos[0].image }} style={styles.thumb} contentFit="cover" />
                    ) : (
                      <View style={[styles.thumb, { backgroundColor: p.surface, alignItems: "center", justifyContent: "center" }]}>
                        <Ionicons name="person" size={22} color={p.textMuted} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: p.text, fontWeight: "800" }}>
                        {r.name}
                        {r.age ? `, ${r.age}` : ""}
                      </Text>
                      <Muted>{r.last_seen_location}</Muted>
                    </View>
                    <Pill label={r.status} color={statusColor(r.status)} />
                  </Card>
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  thumb: { width: 52, height: 52, borderRadius: 12 },
});
