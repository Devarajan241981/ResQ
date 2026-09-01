import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, EmptyState, Loading, RESQ, ScreenScroll } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/i18n";
import type { GalleryImage, Paginated } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

export default function GalleryScreen() {
  const p = usePalette();
  const router = useRouter();
  const { t } = useT();
  const [images, setImages] = useState<GalleryImage[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    () =>
      apiFetch<Paginated<GalleryImage>>("/gallery/images/")
        .then((d) => setImages(d.results))
        .catch(() => setImages([])),
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
      <Button title={t("act.sharePhoto")} icon="cloud-upload" color={RESQ.indigo} onPress={() => router.push("/gallery-upload")} />
      {images == null ? (
        <Loading />
      ) : images.length === 0 ? (
        <EmptyState icon="images-outline" title={t("list.noImages")} subtitle="Community awareness photos will appear here." />
      ) : (
        <View style={styles.grid}>
          {images.map((g) => (
            <View key={g.id} style={styles.cell}>
              <Image source={{ uri: g.image }} style={styles.img} contentFit="cover" />
              {!!g.caption && (
                <Text style={{ color: p.textMuted, fontSize: 11, marginTop: 4 }} numberOfLines={1}>
                  {g.caption}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: { width: "48%", flexGrow: 1 },
  img: { width: "100%", aspectRatio: 1, borderRadius: 12 },
});
