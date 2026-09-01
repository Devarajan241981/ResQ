import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RESQ } from "@/lib/theme";
import { usePalette } from "@/lib/use-theme";

/** Instagram-style app bar: brand wordmark on the left, quick actions on the
 * right, with the tricolour accent strip (plain colour bands only). */
export function BrandTopBar({ title }: { title?: string }) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: p.card }}>
      <View style={styles.row}>
        {title ? (
          <Text style={[styles.brand, { color: p.text }]}>{title}</Text>
        ) : (
          <Text style={[styles.brand, { color: p.text }]}>
            Res<Text style={{ color: RESQ.saffron }}>Q</Text> Bharath
          </Text>
        )}
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/calendar")} hitSlop={8}>
            <Ionicons name="calendar-outline" size={23} color={p.text} />
          </Pressable>
          <Pressable onPress={() => router.push("/notifications")} hitSlop={8}>
            <Ionicons name="notifications-outline" size={23} color={p.text} />
          </Pressable>
          <Pressable onPress={() => router.push("/assistant")} hitSlop={8}>
            <Ionicons name="chatbubble-ellipses-outline" size={23} color={p.text} />
          </Pressable>
        </View>
      </View>
      <View style={{ flexDirection: "row", height: 3 }}>
        <View style={{ flex: 1, backgroundColor: RESQ.saffron }} />
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
        <View style={{ flex: 1, backgroundColor: RESQ.green }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  brand: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  actions: { flexDirection: "row", alignItems: "center", gap: 18 },
});
