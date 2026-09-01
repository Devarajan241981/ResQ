import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card, Muted, RESQ } from "@/components/ui";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usePalette } from "@/lib/use-theme";

export default function VerifyPhoneScreen() {
  const p = usePalette();
  const router = useRouter();
  const { user, isAuthenticated, authFetch, refresh } = useAuth();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code" | "done">(user?.is_verified ? "done" : "phone");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    setError(null);
    setBusy(true);
    try {
      await authFetch("/auth/phone/request/", { method: "POST", body: { phone } });
      setStep("code");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setError(null);
    setBusy(true);
    try {
      await authFetch("/auth/phone/verify/", { method: "POST", body: { phone, code } });
      await refresh();
      setStep("done");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = [styles.input, { color: p.text, backgroundColor: p.surface, borderColor: p.border }];

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: p.background }]}>
        <Card style={{ alignItems: "center", gap: 12, paddingVertical: 28 }}>
          <Ionicons name="lock-closed-outline" size={34} color={p.textMuted} />
          <Text style={{ color: p.text, fontWeight: "800", fontSize: 16 }}>Log in to verify your phone</Text>
          <View style={{ width: "100%" }}>
            <Button title="Log in" icon="log-in" onPress={() => router.push("/login")} />
          </View>
        </Card>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: p.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Card style={{ gap: 14 }}>
        <View style={{ alignItems: "center", gap: 6 }}>
          <View style={[styles.badge, { backgroundColor: `${RESQ.navy}1A` }]}>
            <Ionicons name={step === "done" ? "shield-checkmark" : "call"} size={26} color={RESQ.navy} />
          </View>
          <Text style={{ color: p.text, fontSize: 18, fontWeight: "800" }}>Verify your phone</Text>
          <Muted>Verify your phone number to unlock reporting features.</Muted>
        </View>

        {error && (
          <Text style={{ color: RESQ.red, fontSize: 13, backgroundColor: `${RESQ.red}14`, padding: 10, borderRadius: 10 }}>
            {error}
          </Text>
        )}

        {step === "done" ? (
          <View style={{ alignItems: "center", gap: 12 }}>
            <Ionicons name="checkmark-circle" size={44} color={RESQ.green} />
            <Text style={{ color: p.text, fontWeight: "800", fontSize: 16 }}>Your phone is verified!</Text>
            <View style={{ width: "100%" }}>
              <Button title="Go to home" color={RESQ.green} onPress={() => router.replace("/(tabs)")} />
            </View>
          </View>
        ) : step === "phone" ? (
          <>
            <Text style={{ color: p.text, fontWeight: "600", fontSize: 13 }}>Phone number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor={p.textMuted}
              keyboardType="phone-pad"
              style={inputStyle}
            />
            <Button title="Send code" onPress={sendCode} loading={busy} disabled={phone.trim().length < 6} />
          </>
        ) : (
          <>
            <Muted>We&apos;ve sent a 6-digit code to your phone.</Muted>
            <Text style={{ color: p.text, fontWeight: "600", fontSize: 13 }}>Verification code</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="6-digit code"
              placeholderTextColor={p.textMuted}
              keyboardType="number-pad"
              style={[...inputStyle, { textAlign: "center", letterSpacing: 8, fontSize: 20 }]}
            />
            <Button title="Verify" onPress={confirm} loading={busy} disabled={code.trim().length < 4} />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text onPress={() => setStep("phone")} style={{ color: p.textMuted, fontSize: 13 }}>
                Change number
              </Text>
              <Text onPress={sendCode} style={{ color: RESQ.navy, fontSize: 13, fontWeight: "700" }}>
                Resend code
              </Text>
            </View>
          </>
        )}
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  badge: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
});
