import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Loading, Muted, RESQ, ScreenScroll } from "@/components/ui";
import { Field } from "@/components/form";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import type { Paginated, TrustedContact } from "@/lib/types";
import { usePalette } from "@/lib/use-theme";

export default function TrustedContactsScreen() {
  const p = usePalette();
  const router = useRouter();
  const { isAuthenticated, authFetch } = useAuth();
  const { t } = useT();
  const [contacts, setContacts] = useState<TrustedContact[] | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!isAuthenticated) return Promise.resolve().then(() => setContacts([]));
    return authFetch<Paginated<TrustedContact>>("/sos/trusted-contacts/")
      .then((d) => setContacts(d.results))
      .catch(() => setContacts([]));
  }, [isAuthenticated, authFetch]);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    if (!name.trim() || phone.trim().length < 6) return;
    setBusy(true);
    try {
      const created = await authFetch<TrustedContact>("/sos/trusted-contacts/", {
        method: "POST",
        body: { name, phone, relationship },
      });
      setContacts((prev) => [created, ...(prev ?? [])]);
      setName("");
      setPhone("");
      setRelationship("");
    } catch (err) {
      Alert.alert("Could not add", extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setContacts((prev) => prev?.filter((c) => c.id !== id) ?? null);
    try {
      await authFetch(`/sos/trusted-contacts/${id}/`, { method: "DELETE" });
    } catch {
      load();
    }
  }

  if (!isAuthenticated) {
    return (
      <ScreenScroll>
        <Card style={{ alignItems: "center", gap: 12, paddingVertical: 28 }}>
          <Ionicons name="people-outline" size={34} color={p.textMuted} />
          <Text style={{ color: p.text, fontWeight: "800", fontSize: 16 }}>{t("common.login")}</Text>
          <View style={{ width: "100%" }}>
            <Button title={t("common.login")} icon="log-in" onPress={() => router.push("/login")} />
          </View>
        </Card>
      </ScreenScroll>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenScroll>
        <Muted>{t("tc.sub")}</Muted>

        <Card style={{ gap: 12 }}>
          <Text style={{ color: p.text, fontWeight: "800" }}>{t("tc.add")}</Text>
          <Field label={t("form.name")} value={name} onChangeText={setName} placeholder="Contact name" autoCapitalize="words" />
          <Field label={t("form.phone")} value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
          <Field label={t("tc.relationship")} value={relationship} onChangeText={setRelationship} placeholder="Brother, friend…" />
          <Button title={t("tc.save")} icon="person-add" onPress={add} loading={busy} disabled={!name.trim() || phone.trim().length < 6} />
        </Card>

        {contacts == null ? (
          <Loading />
        ) : contacts.length === 0 ? (
          <EmptyState icon="people-outline" title={t("tc.none")} />
        ) : (
          contacts.map((c) => (
            <Card key={c.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={[styles.badge, { backgroundColor: `${RESQ.navy}1A` }]}>
                <Ionicons name="person" size={18} color={RESQ.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: p.text, fontWeight: "700" }}>{c.name}</Text>
                <Muted>
                  {c.phone}
                  {c.relationship ? ` · ${c.relationship}` : ""}
                </Muted>
              </View>
              <Pressable onPress={() => remove(c.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={RESQ.red} />
              </Pressable>
            </Card>
          ))
        )}
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
