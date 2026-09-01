import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { Button, RESQ, ScreenScroll } from "@/components/ui";
import { Field } from "@/components/form";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { usePalette } from "@/lib/use-theme";

export default function RegisterScreen() {
  const p = usePalette();
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useT();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const valid = fullName.trim() && email.includes("@") && phone.trim().length >= 6 && password.length >= 8;

  async function submit() {
    setBusy(true);
    try {
      await register({ full_name: fullName, email, phone, password, city: city || undefined });
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Could not sign up", extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenScroll>
        <Text style={{ color: p.text, fontSize: 22, fontWeight: "900" }}>{t("form.registerTitle")}</Text>
        <Text style={{ color: p.textMuted, fontSize: 13 }}>
          Join ResQ Bharath to report cases, respond to requests, and get alerts.
        </Text>

        <Field label={t("form.name")} value={fullName} onChangeText={setFullName} placeholder="Your name" autoCapitalize="words" />
        <Field label={t("form.email")} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label={t("form.phone")} value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
        <Field label={t("form.city")} value={city} onChangeText={setCity} placeholder="Your city" autoCapitalize="words" />
        <Field label={t("form.password")} value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry />

        <Button title="Sign up" onPress={submit} loading={busy} disabled={!valid} />

        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 4 }}>
          <Text style={{ color: p.textMuted }}>Already have an account?</Text>
          <Text onPress={() => router.replace("/login")} style={{ color: RESQ.navy, fontWeight: "700" }}>
            {t("common.login")}
          </Text>
        </View>
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}
