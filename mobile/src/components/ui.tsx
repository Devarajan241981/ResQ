import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { RESQ } from "@/lib/theme";
import { usePalette } from "@/lib/use-theme";

type IconName = keyof typeof Ionicons.glyphMap;

export function ScreenScroll({
  children,
  onRefresh,
  refreshing,
  padded = true,
}: {
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  padded?: boolean;
}) {
  const p = usePalette();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: p.background }}
      contentContainerStyle={{ padding: padded ? 16 : 0, paddingBottom: 44, gap: 14 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={p.primary} /> : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const p = usePalette();
  return <View style={[styles.card, { backgroundColor: p.card, borderColor: p.border }, style]}>{children}</View>;
}

export function Heading({ children, size = 20 }: { children: ReactNode; size?: number }) {
  const p = usePalette();
  return <Text style={[styles.heading, { color: p.text, fontSize: size }]}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  const p = usePalette();
  return <Text style={{ color: p.textMuted, fontSize: 13, lineHeight: 18 }}>{children}</Text>;
}

export function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: `${color}22` }]}>
      <Text style={{ color, fontSize: 11, fontWeight: "700", textTransform: "capitalize" }}>{label}</Text>
    </View>
  );
}

export function Button({
  title,
  onPress,
  color = RESQ.navy,
  icon,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  color?: string;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon && <Ionicons name={icon} size={18} color="#fff" />}
          <Text style={styles.buttonText}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Loading() {
  const p = usePalette();
  return (
    <View style={{ padding: 32, alignItems: "center" }}>
      <ActivityIndicator color={p.primary} />
    </View>
  );
}

/** Circular avatar — remote photo when available, otherwise coloured initials. */
export function Avatar({ name, uri, size = 40 }: { name?: string | null; uri?: string | null; size?: number }) {
  const initials = (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />;
  }
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${RESQ.navy}22`, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: RESQ.navy, fontWeight: "800", fontSize: size * 0.38 }}>{initials || "RQ"}</Text>
    </View>
  );
}

export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  const p = usePalette();
  return (
    <View style={styles.sectionHeader}>
      <Text style={{ color: p.text, fontSize: 18, fontWeight: "800" }}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: p.primary, fontWeight: "700", fontSize: 13 }}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function ServiceTile({ icon, label, color, onPress }: { icon: IconName; label: string; color: string; onPress: () => void }) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: p.card, borderColor: p.border, opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[styles.tileIcon, { backgroundColor: `${color}1F` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.tileLabel, { color: p.text }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StatCard({ icon, value, label, color }: { icon: IconName; value: string; label: string; color: string }) {
  const p = usePalette();
  return (
    <View style={[styles.statCard, { backgroundColor: p.card, borderColor: p.border }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}1F` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={{ color: p.text, fontSize: 20, fontWeight: "900", marginTop: 6 }}>{value}</Text>
      <Text style={{ color: p.textMuted, fontSize: 11 }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  autoFocus,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
}) {
  const p = usePalette();
  return (
    <View style={[styles.search, { backgroundColor: p.surface, borderColor: p.border }]}>
      <Ionicons name="search" size={18} color={p.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={p.textMuted}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        returnKeyType="search"
        style={{ flex: 1, color: p.text, fontSize: 15, paddingVertical: 0 }}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={p.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: IconName; title: string; subtitle?: string }) {
  const p = usePalette();
  return (
    <View style={{ alignItems: "center", paddingVertical: 48, gap: 8 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: p.surface, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={30} color={p.textMuted} />
      </View>
      <Text style={{ color: p.text, fontWeight: "700", fontSize: 15 }}>{title}</Text>
      {subtitle && <Text style={{ color: p.textMuted, fontSize: 13, textAlign: "center", paddingHorizontal: 24 }}>{subtitle}</Text>}
    </View>
  );
}

export { RESQ };

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 16 },
  heading: { fontWeight: "800" },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, alignSelf: "flex-start" },
  button: { borderRadius: 12, paddingVertical: 13, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tile: { width: "22%", flexGrow: 1, minWidth: 74, borderWidth: 1, borderRadius: 16, paddingVertical: 12, alignItems: "center", gap: 8 },
  tileIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tileLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 12 },
  statIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  search: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, height: 46 },
});
