import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import * as QuickActions from "expo-quick-actions";
import { useQuickActionRouting } from "expo-quick-actions/router";
import { useEffect } from "react";
import { View } from "react-native";
import { useT } from "@/lib/i18n";
import { RESQ } from "@/lib/theme";
import { usePalette } from "@/lib/use-theme";

export default function TabsLayout() {
  const p = usePalette();
  const { t } = useT();

  // Long-press the app icon → "Emergency SOS" shortcut → jumps straight to SOS.
  useQuickActionRouting();
  useEffect(() => {
    void QuickActions.setItems([
      { id: "sos", title: "Emergency SOS", subtitle: "Send an SOS alert", params: { href: "/sos" } },
    ]).catch(() => {});
  }, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: RESQ.navy,
        tabBarInactiveTintColor: p.textMuted,
        tabBarStyle: {
          backgroundColor: p.card,
          borderTopColor: p.border,
          height: 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tab.home"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("tab.search"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: "SOS",
          tabBarLabel: () => null,
          // Prominent, raised centre action — the emergency button.
          tabBarIcon: () => (
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: RESQ.red,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                borderWidth: 4,
                borderColor: p.card,
                shadowColor: RESQ.red,
                shadowOpacity: 0.4,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              <Ionicons name="alert" size={28} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t("tab.community"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tab.profile"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
