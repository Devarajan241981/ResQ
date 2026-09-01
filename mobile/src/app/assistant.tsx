import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter, type Href } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { RESQ } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { usePalette } from "@/lib/use-theme";

interface Topic {
  id: string;
  keys: string[];
  answer: string;
  href?: Href;
}

const TOPICS: Topic[] = [
  { id: "thanks", keys: ["thank", "thanks", "nandri", "dhanyavad"], answer: "Happy to help! Stay safe. 🙏" },
  { id: "missing", keys: ["missing", "lost", "gum", "lapata"], answer: "Use Missing Persons to report or find someone. I can take you there.", href: "/missing-persons" },
  { id: "sos", keys: ["sos", "emergency", "help", "danger", "madad"], answer: "Tap SOS to alert your contacts and nearby volunteers with your live location.", href: "/sos" },
  { id: "blood", keys: ["blood", "donor", "rakt", "khoon"], answer: "Find or respond to open blood requests by group and city.", href: "/blood-donation" },
  { id: "disaster", keys: ["disaster", "flood", "relief", "shelter", "aapda"], answer: "Disaster Mode shows active alerts, needs and relief near you.", href: "/disaster-mode" },
  { id: "campaign", keys: ["campaign", "drive", "volunteer", "event"], answer: "Join relief drives, blood camps and awareness campaigns near you.", href: "/campaigns" },
  { id: "community", keys: ["community", "group", "join"], answer: "Join local community groups to coordinate help.", href: "/community" },
  { id: "calendar", keys: ["calendar", "holiday", "festival"], answer: "The calendar lists national holidays, health days and community events.", href: "/calendar" },
  { id: "helpline", keys: ["helpline", "number", "call", "108", "112", "police"], answer: "Key helplines — Emergency 112, Police 100, Ambulance 108, Fire 101, Women 1091, Child 1098, Disaster 1077.", href: "/sos" },
  { id: "about", keys: ["about", "what is", "who are you", "resq"], answer: "ResQ Bharath is a community emergency platform: missing persons, SOS, blood, disaster relief, campaigns and community help — in 10 Indian languages." },
];

const QUICK = [
  { id: "missing", label: "Report missing" },
  { id: "sos", label: "Send SOS" },
  { id: "blood", label: "Find blood" },
  { id: "helpline", label: "Helplines" },
];

interface Msg {
  id: number;
  role: "bot" | "user";
  text: string;
  href?: Href;
}

export default function AssistantScreen() {
  const p = usePalette();
  const router = useRouter();
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const idRef = useRef(1);

  const greeting = useMemo(() => {
    const name = user?.full_name?.trim().split(/\s+/)[0];
    return name
      ? `Namaskar ${name}! I'm your ResQ Bharath assistant. Ask me about any service.`
      : "Namaskar! I'm your ResQ Bharath assistant. Ask me about any service.";
  }, [user]);

  const [messages, setMessages] = useState<Msg[]>(() => [{ id: 0, role: "bot", text: greeting }]);
  const [input, setInput] = useState("");
  const [speakOn, setSpeakOn] = useState(true);

  // Stop any speech when leaving the screen.
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  function say(text: string) {
    if (!speakOn) return;
    Speech.stop();
    Speech.speak(text, { language: "en-IN", pitch: 1.05, rate: 0.95 });
  }

  function toggleSpeak() {
    setSpeakOn((v) => {
      if (v) Speech.stop();
      return !v;
    });
  }

  function reply(text: string) {
    const q = text.toLowerCase();
    const topic = TOPICS.find((t) => t.keys.some((k) => q.includes(k)));
    return topic
      ? { text: topic.answer, href: topic.href }
      : { text: "I can help with missing persons, SOS, blood, disaster relief, campaigns, community, the calendar and helplines. What do you need?" };
  }

  function send(raw: string) {
    const text = raw.trim();
    if (!text) return;
    const r = reply(text);
    setMessages((m) => [
      ...m,
      { id: idRef.current++, role: "user", text },
      { id: idRef.current++, role: "bot", text: r.text, href: r.href },
    ]);
    setInput("");
    say(r.text);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: p.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={toggleSpeak} hitSlop={10}>
              <Ionicons name={speakOn ? "volume-high" : "volume-mute"} size={22} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, gap: 10 }}>
        {messages.map((m) => (
          <View key={m.id} style={{ alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <View
              style={[
                styles.bubble,
                m.role === "user"
                  ? { backgroundColor: RESQ.navy, borderTopRightRadius: 4 }
                  : { backgroundColor: p.card, borderColor: p.border, borderWidth: 1, borderTopLeftRadius: 4 },
              ]}
            >
              <Text style={{ color: m.role === "user" ? "#fff" : p.text, fontSize: 14, lineHeight: 20 }}>{m.text}</Text>
              {m.href && (
                <Pressable onPress={() => router.push(m.href as Href)} style={styles.action}>
                  <Text style={{ color: RESQ.navy, fontWeight: "700", fontSize: 13 }}>Open</Text>
                  <Ionicons name="chevron-forward" size={14} color={RESQ.navy} />
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
          {QUICK.map((q) => (
            <Pressable key={q.id} onPress={() => send(q.label)} style={[styles.chip, { borderColor: p.border, backgroundColor: p.card }]}>
              <Text style={{ color: p.text, fontSize: 13, fontWeight: "600" }}>{q.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={[styles.inputRow, { backgroundColor: p.card, borderColor: p.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message…"
            placeholderTextColor={p.textMuted}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
            style={{ flex: 1, color: p.text, fontSize: 15 }}
          />
          <Pressable onPress={() => send(input)} style={[styles.sendBtn, { backgroundColor: RESQ.navy }]}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "85%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  action: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 6 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 24, paddingLeft: 16, paddingRight: 6, paddingVertical: 6 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
});
