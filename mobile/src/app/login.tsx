import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card, Heading, Muted, ScreenScroll } from "@/components/ui";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { RESQ, statusColor } from "@/lib/theme";
import { usePalette } from "@/lib/use-theme";

export default function LoginScreen() {
  const p = usePalette();
  const router = useRouter();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithEmail(email.trim(), password);
      router.back();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const input = [styles.input, { color: p.text, borderColor: p.border, backgroundColor: p.card }];

  return (
    <ScreenScroll>
      <Heading>Welcome back</Heading>
      <Muted>Log in to your ResQ Bharath account.</Muted>

      {error ? (
        <Card style={{ borderColor: statusColor("critical") }}>
          <Text style={{ color: statusColor("critical") }}>{error}</Text>
        </Card>
      ) : null}

      <View style={{ gap: 6 }}>
        <Muted>Email</Muted>
        <TextInput
          style={input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={p.textMuted}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Muted>Password</Muted>
        <TextInput
          style={input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={p.textMuted}
        />
      </View>

      <Button title={submitting ? "Logging in…" : "Log in"} color={RESQ.navy} loading={submitting} onPress={submit} />

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 4 }}>
        <Muted>New to ResQ Bharath?</Muted>
        <Text onPress={() => router.replace("/register")} style={{ color: RESQ.navy, fontWeight: "700" }}>
          Sign up
        </Text>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
});
