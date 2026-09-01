import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, RESQ, ScreenScroll } from "@/components/ui";
import { Field, Segmented } from "@/components/form";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { appendFile, pickImages, type PickedImage } from "@/lib/media";
import { usePalette } from "@/lib/use-theme";

type Gender = "male" | "female" | "other";
type Seen = "now" | "today" | "yesterday" | "days";

const SEEN_OFFSET_MS: Record<Seen, number> = {
  now: 0,
  today: 6 * 3600_000,
  yesterday: 24 * 3600_000,
  days: 3 * 24 * 3600_000,
};

export default function ReportMissingScreen() {
  const p = usePalette();
  const router = useRouter();
  const { isAuthenticated, authFetch } = useAuth();
  const { t } = useT();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [location, setLocation] = useState("");
  const [clothing, setClothing] = useState("");
  const [seen, setSeen] = useState<Seen>("now");
  const [photos, setPhotos] = useState<PickedImage[]>([]);
  const [busy, setBusy] = useState(false);

  const valid = name.trim() && Number(age) > 0 && location.trim();

  async function addPhotos() {
    const picked = await pickImages(3);
    if (picked.length) setPhotos((prev) => [...prev, ...picked].slice(0, 3));
  }

  async function submit() {
    if (!isAuthenticated) {
      Alert.alert("Log in required", "Log in to report a missing person.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log in", onPress: () => router.push("/login") },
      ]);
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("age", String(Number(age)));
      form.append("gender", gender);
      form.append("last_seen_location", location);
      form.append("clothing_description", clothing);
      form.append("last_seen_at", new Date(Date.now() - SEEN_OFFSET_MS[seen]).toISOString());
      photos.forEach((img) => appendFile(form, "photos", img));
      await authFetch("/missing-persons/", { method: "POST", body: form });
      Alert.alert("Report submitted", "Thank you. Nearby volunteers will be alerted.", [
        { text: "OK", onPress: () => router.replace("/missing-persons") },
      ]);
    } catch (err) {
      Alert.alert("Could not submit", extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenScroll>
        <Text style={{ color: p.text, fontSize: 20, fontWeight: "900" }}>{t("form.reportTitle")}</Text>
        <Text style={{ color: p.textMuted, fontSize: 13 }}>
          Share what you know. In an emergency, also call 112.
        </Text>

        <Field label="Full name" value={name} onChangeText={setName} placeholder="Name of the missing person" autoCapitalize="words" />
        <Field label="Age" value={age} onChangeText={setAge} placeholder="Age in years" keyboardType="number-pad" />
        <Segmented
          label="Gender"
          value={gender}
          onChange={setGender}
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Other", value: "other" },
          ]}
        />
        <Field label="Last seen location" value={location} onChangeText={setLocation} placeholder="Area, landmark, city" />
        <Segmented
          label="When last seen"
          value={seen}
          onChange={setSeen}
          options={[
            { label: "Just now", value: "now" },
            { label: "Earlier today", value: "today" },
            { label: "Yesterday", value: "yesterday" },
            { label: "A few days ago", value: "days" },
          ]}
        />
        <Field label="What they were wearing" value={clothing} onChangeText={setClothing} placeholder="Clothing / appearance" multiline />

        <Text style={{ color: p.text, fontWeight: "600", fontSize: 13 }}>Photos (optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {photos.map((img) => (
            <View key={img.uri}>
              <Image source={{ uri: img.uri }} style={styles.thumb} contentFit="cover" />
              <Pressable onPress={() => setPhotos((prev) => prev.filter((x) => x.uri !== img.uri))} style={styles.remove}>
                <Ionicons name="close" size={14} color="#fff" />
              </Pressable>
            </View>
          ))}
          {photos.length < 3 && (
            <Pressable onPress={addPhotos} style={[styles.addPhoto, { borderColor: p.border, backgroundColor: p.surface }]}>
              <Ionicons name="camera" size={24} color={p.textMuted} />
            </Pressable>
          )}
        </ScrollView>

        <Button title="Submit report" color={RESQ.saffron} onPress={submit} loading={busy} disabled={!valid} />
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  thumb: { width: 80, height: 80, borderRadius: 12 },
  remove: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#000",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
});
