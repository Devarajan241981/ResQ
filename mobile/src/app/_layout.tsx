import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";
import { RESQ } from "@/lib/theme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: RESQ.navy },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "800" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ presentation: "modal", title: "Log in" }} />
          <Stack.Screen name="register" options={{ presentation: "modal", title: "Sign up" }} />
          <Stack.Screen name="report-missing" options={{ title: "Report Missing" }} />
          <Stack.Screen name="blood-request-new" options={{ title: "New Blood Request" }} />
          <Stack.Screen name="events" options={{ title: "Events" }} />
          <Stack.Screen name="gallery-upload" options={{ title: "Share a Photo" }} />
          <Stack.Screen name="missing-persons" options={{ title: "Missing Persons" }} />
          <Stack.Screen name="blood-donation" options={{ title: "Blood Donation" }} />
          <Stack.Screen name="disaster-mode" options={{ title: "Disaster Mode" }} />
          <Stack.Screen name="campaigns" options={{ title: "Campaigns" }} />
          <Stack.Screen name="calendar" options={{ title: "Calendar" }} />
          <Stack.Screen name="gallery" options={{ title: "Gallery" }} />
          <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
          <Stack.Screen name="assistant" options={{ title: "ResQ Assistant" }} />
          <Stack.Screen name="verify-phone" options={{ title: "Verify Phone" }} />
          <Stack.Screen name="trusted-contacts" options={{ title: "Emergency Contacts" }} />
          <Stack.Screen name="hospitals" options={{ title: "Hospitals" }} />
          <Stack.Screen name="shelters" options={{ title: "Shelters" }} />
        </Stack>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
