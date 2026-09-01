import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text } from "react-native";
import { Button, RESQ, ScreenScroll } from "@/components/ui";
import { Field } from "@/components/form";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { appendFile, pickImages, type PickedImage } from "@/lib/media";
import { usePalette } from "@/lib/use-theme";

export default function GalleryUploadScreen() {
  const p = usePalette();
  const router = useRouter();
  const { isAuthenticated, authFetch } = useAuth();
  const { t } = useT();
  const [image, setImage] = useState<PickedImage | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  async function pick() {
    const [img] = await pickImages(1);
    if (img) setImage(img);
  }

  async function submit() {
    if (!isAuthenticated) {
      Alert.alert("Log in required", "Log in to share photos.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log in", onPress: () => router.push("/login") },
      ]);
      return;
    }
    if (!image) return;
    setBusy(true);
    try {
      const form = new FormData();
      appendFile(form, "image", image);
      form.append("caption", caption);
      await authFetch("/gallery/images/", { method: "POST", body: form });
      Alert.alert("Shared", "Your photo has been posted to the gallery.", [
        { text: "OK", onPress: () => router.replace("/gallery") },
      ]);
    } catch (err) {
      Alert.alert("Could not upload", extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenScroll>
        <Text style={{ color: p.text, fontSize: 20, fontWeight: "900" }}>{t("form.galleryTitle")}</Text>
        <Text style={{ color: p.textMuted, fontSize: 13 }}>Community awareness photos help everyone stay informed.</Text>

        {image ? (
          <Pressable onPress={pick}>
            <Image source={{ uri: image.uri }} style={styles.preview} contentFit="cover" />
          </Pressable>
        ) : (
          <Pressable onPress={pick} style={[styles.picker, { borderColor: p.border, backgroundColor: p.surface }]}>
            <Ionicons name="image" size={30} color={p.textMuted} />
            <Text style={{ color: p.textMuted, fontWeight: "600" }}>Choose a photo</Text>
          </Pressable>
        )}

        <Field label="Caption" value={caption} onChangeText={setCaption} placeholder="Say something about this photo" multiline />

        <Button title="Post to gallery" icon="cloud-upload" color={RESQ.indigo} onPress={submit} loading={busy} disabled={!image} />
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  picker: { height: 180, borderWidth: 1, borderStyle: "dashed", borderRadius: 16, alignItems: "center", justifyContent: "center", gap: 8 },
  preview: { width: "100%", height: 220, borderRadius: 16 },
});
