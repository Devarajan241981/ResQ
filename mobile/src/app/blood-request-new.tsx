import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text } from "react-native";
import { Button, RESQ, ScreenScroll } from "@/components/ui";
import { Field, Segmented } from "@/components/form";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { usePalette } from "@/lib/use-theme";

type Urgency = "normal" | "urgent" | "critical";
const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export default function BloodRequestNewScreen() {
  const p = usePalette();
  const router = useRouter();
  const { isAuthenticated, authFetch } = useAuth();
  const { t } = useT();
  const [patient, setPatient] = useState("");
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("O+");
  const [units, setUnits] = useState("1");
  const [city, setCity] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("normal");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const valid = patient.trim() && Number(units) > 0 && city.trim();

  async function submit() {
    if (!isAuthenticated) {
      Alert.alert("Log in required", "Log in to raise a blood request.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log in", onPress: () => router.push("/login") },
      ]);
      return;
    }
    setBusy(true);
    try {
      await authFetch("/blood-donation/requests/", {
        method: "POST",
        body: {
          patient_name: patient,
          blood_group: group,
          units_needed: Number(units),
          city,
          urgency,
          notes,
        },
      });
      Alert.alert("Request posted", "Nearby donors will be notified.", [
        { text: "OK", onPress: () => router.replace("/blood-donation") },
      ]);
    } catch (err) {
      Alert.alert("Could not post request", extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenScroll>
        <Text style={{ color: p.text, fontSize: 20, fontWeight: "900" }}>{t("form.bloodTitle")}</Text>
        <Text style={{ color: p.textMuted, fontSize: 13 }}>Donors near the patient&apos;s city will be alerted.</Text>

        <Field label="Patient name" value={patient} onChangeText={setPatient} placeholder="Patient's name" autoCapitalize="words" />
        <Segmented label="Blood group" value={group} onChange={setGroup} options={GROUPS.map((g) => ({ label: g, value: g }))} />
        <Field label="Units needed" value={units} onChangeText={setUnits} placeholder="1" keyboardType="number-pad" />
        <Field label="City" value={city} onChangeText={setCity} placeholder="Hospital city" autoCapitalize="words" />
        <Segmented
          label="Urgency"
          value={urgency}
          onChange={setUrgency}
          options={[
            { label: "Normal", value: "normal" },
            { label: "Urgent", value: "urgent" },
            { label: "Critical", value: "critical" },
          ]}
        />
        <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Hospital, contact, details" multiline />

        <Button title="Post request" color={RESQ.red} onPress={submit} loading={busy} disabled={!valid} />
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}
