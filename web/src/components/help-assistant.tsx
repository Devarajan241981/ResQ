"use client";

import Link from "next/link";
import { Bot, ChevronRight, Mic, Send, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { synthesizeSpeech } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import type { LanguageCode, TranslationKey } from "@/lib/i18n/translations";

interface Action {
  labelKey: TranslationKey;
  href: string;
}
interface Msg {
  id: number;
  role: "bot" | "user";
  text: string;
  actions?: Action[];
}
interface Topic {
  id: string;
  keys: string[];
  navKey?: TranslationKey;
  answerKey: TranslationKey | "GREETING";
  action?: Action;
}

// Knowledge base. Answers reuse existing translated copy where possible so the
// assistant speaks in the visitor's selected language. `keys` are matched as
// substrings (English + common romanised words); the localized nav term is added
// at match time so native-script queries also match.
const TOPICS: Topic[] = [
  { id: "thanks", keys: ["thank", "thanks", "dhanyavad", "dhanyawad", "nandri", "shukriya", "vandanalu"], answerKey: "nicci.a.thanks" },
  { id: "missing", keys: ["missing", "lost person", "find person", "report person", "gum", "lapata", "kaanaamal", "tappipoyina", "bepatta"], navKey: "nav.missingPersons", answerKey: "modules.missingPersons.description", action: { labelKey: "assistant.q.report", href: "/missing-persons" } },
  { id: "sos", keys: ["sos", "emergency", "help me", "danger", "madad", "sahayam", "bachao", "alert"], navKey: "nav.sos", answerKey: "modules.sos.description", action: { labelKey: "assistant.q.sos", href: "/sos" } },
  { id: "blood", keys: ["blood", "donor", "donate blood", "raktha", "rakt", "khoon", "raktadaan"], navKey: "nav.bloodDonation", answerKey: "modules.bloodDonation.description", action: { labelKey: "assistant.q.blood", href: "/blood-donation" } },
  { id: "disaster", keys: ["disaster", "flood", "earthquake", "cyclone", "relief", "shelter", "aapda", "vipattu", "pralaya"], navKey: "nav.disasterMode", answerKey: "modules.disasterMode.description", action: { labelKey: "assistant.q.disaster", href: "/disaster-mode" } },
  { id: "campaign", keys: ["campaign", "drive", "event", "volunteer", "abhiyan", "muhim"], navKey: "nav.campaigns", answerKey: "modules.campaigns.description", action: { labelKey: "nav.campaigns", href: "/campaigns" } },
  { id: "community", keys: ["community", "group", "join", "samudaya", "samuday"], navKey: "nav.community", answerKey: "infoCat.community.desc", action: { labelKey: "nav.community", href: "/community" } },
  { id: "calendar", keys: ["calendar", "holiday", "festival", "event date", "tyohar", "habba", "panchang"], navKey: "nav.calendar", answerKey: "infoCat.calendar.desc", action: { labelKey: "nav.calendar", href: "/calendar" } },
  { id: "helpline", keys: ["helpline", "number", "phone", "call", "108", "100", "112", "police", "ambulance"], answerKey: "nicci.a.helpline", action: { labelKey: "nicci.q.helpline", href: "/sos" } },
  { id: "gallery", keys: ["gallery", "photo", "picture", "awareness", "image"], navKey: "nav.gallery", answerKey: "infoCat.awareness.desc", action: { labelKey: "nav.gallery", href: "/gallery" } },
  { id: "account", keys: ["login", "log in", "sign up", "register", "account", "profile", "password"], answerKey: "nicci.a.account", action: { labelKey: "nav.login", href: "/login" } },
  { id: "language", keys: ["language", "translate", "hindi", "telugu", "tamil", "bhasha", "mozhi", "bhasa"], answerKey: "nicci.a.languages" },
  { id: "about", keys: ["about", "what is", "who are you", "resq", "platform", "what can you do", "help with"], answerKey: "nicci.a.about", action: { labelKey: "nicci.q.about", href: "/about" } },
  { id: "greeting", keys: ["hi", "hello", "hey", "namaste", "namaskar", "namaskara", "namaskaram", "vanakkam", "salaam", "sat sri akal", "good morning", "good evening"], answerKey: "GREETING" },
];

const QUICK: { topicId: string; labelKey: TranslationKey }[] = [
  { topicId: "missing", labelKey: "assistant.q.report" },
  { topicId: "sos", labelKey: "assistant.q.sos" },
  { topicId: "blood", labelKey: "assistant.q.blood" },
  { topicId: "helpline", labelKey: "nicci.q.helpline" },
  { topicId: "about", labelKey: "nicci.q.about" },
];

const BCP47: Record<LanguageCode, string> = {
  en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN",
  ml: "ml-IN", mr: "mr-IN", bn: "bn-IN", gu: "gu-IN", pa: "pa-IN",
};

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function HelpAssistant() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [speakOn, setSpeakOn] = useState(true);
  const [listening, setListening] = useState(false);

  const idRef = useRef(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakSeqRef = useRef(0);

  // Keep the available TTS voices up to date (loaded asynchronously by the browser).
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Score every installed voice and pick the most natural one for this language:
  // right language > Indian accent (-IN) > neural/Google engine > online > female.
  function pickVoice(lang: LanguageCode): SpeechSynthesisVoice | null {
    const target = BCP47[lang].toLowerCase();
    const short = target.split("-")[0];
    const female = /female|woman|kalpana|swara|prabha|neerja|aditi|heera|lekha|priya|ananya|shruti|pallavi/i;
    const premium = /google|natural|neural|online|premium|enhanced|wavenet/i;
    let best: SpeechSynthesisVoice | null = null;
    let bestScore = -1;
    for (const v of voicesRef.current) {
      const vlang = v.lang.toLowerCase().replace("_", "-");
      let score = 0;
      if (vlang === target) score += 100;
      else if (vlang.startsWith(short)) score += 50;
      else continue; // wrong language entirely
      if (vlang.endsWith("-in")) score += 30; // Indian accent / pronunciation
      if (premium.test(v.name)) score += 20; // higher-quality speech engines
      if (!v.localService) score += 8; // online voices sound more human
      if (female.test(v.name)) score += 10; // female persona (Telugu requested female)
      if (score > bestScore) {
        bestScore = score;
        best = v;
      }
    }
    return best;
  }

  // Remove emoji / arrows / symbols that TTS mispronounces, and turn dashes and
  // bullets into commas so they become natural pauses instead of odd noises.
  function sanitize(text: string) {
    return text
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, "")
      .replace(/[—–·•|]+/g, ", ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Fallback: the browser's built-in Web Speech voices, spoken sentence by
  // sentence so the engine breathes between clauses instead of reading the
  // whole reply in one flat, run-on stream.
  function speakBrowser(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const voice = pickVoice(language);
    const lang = BCP47[language];
    const parts = sanitize(text)
      .split(/(?<=[.!?।])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of parts.length > 0 ? parts : [sanitize(text)]) {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = lang;
      if (voice) u.voice = voice;
      u.rate = 0.9; // a touch slower = clearer, more human pacing
      u.pitch = 1.03;
      u.volume = 1;
      synth.speak(u);
    }
  }

  function playBlob(blob: Blob) {
    if (!audioRef.current) audioRef.current = new Audio();
    const a = audioRef.current;
    a.pause();
    if (a.src) URL.revokeObjectURL(a.src);
    a.src = URL.createObjectURL(blob);
    void a.play().catch(() => {});
  }

  // Prefer the natural neural voice (Sarvam) from our backend; if it isn't
  // configured or fails, fall back to the browser voices. A sequence guard
  // prevents a late-resolving request from talking over a newer reply.
  async function speak(text: string) {
    if (!speakOn) return;
    stopSpeaking();
    const seq = ++speakSeqRef.current;
    const clean = sanitize(text);
    const blob = await synthesizeSpeech(clean, language);
    if (seq !== speakSeqRef.current) return; // superseded by a newer message
    if (blob) {
      playBlob(blob);
      return;
    }
    speakBrowser(text);
  }

  function stopSpeaking() {
    speakSeqRef.current++;
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    audioRef.current?.pause();
  }

  function greetingText() {
    const name = user?.full_name?.trim().split(/\s+/)[0];
    return name ? t("nicci.a.greetingNamed").replace("{name}", name) : t("nicci.a.greeting");
  }

  function matchTopic(text: string): Topic | null {
    const q = text.toLowerCase();
    for (const topic of TOPICS) {
      const extra = topic.navKey ? [t(topic.navKey).toLowerCase()] : [];
      if ([...topic.keys, ...extra].some((k) => k.length > 1 && q.includes(k))) return topic;
    }
    return null;
  }

  function answerFor(topic: Topic | null): { text: string; actions?: Action[] } {
    if (!topic) return { text: t("nicci.a.fallback") };
    if (topic.answerKey === "GREETING") return { text: greetingText() };
    return { text: t(topic.answerKey), actions: topic.action ? [topic.action] : undefined };
  }

  function respond(userText: string, topic: Topic | null) {
    const ans = answerFor(topic);
    const userMsg: Msg = { id: ++idRef.current, role: "user", text: userText };
    const botMsg: Msg = { id: ++idRef.current, role: "bot", text: ans.text, actions: ans.actions };
    setMessages((m) => [...m, userMsg, botMsg]);
    void speak(ans.text);
  }

  function handleSend(raw: string) {
    const text = raw.trim();
    if (!text) return;
    setInput("");
    respond(text, matchTopic(text));
  }

  function handleQuick(topicId: string, label: string) {
    respond(label, TOPICS.find((x) => x.id === topicId) ?? null);
  }

  function toggleOpen() {
    if (open) {
      setOpen(false);
      stopSpeaking();
      setListening(false);
      return;
    }
    setOpen(true);
    if (messages.length === 0) {
      const g: Msg = { id: ++idRef.current, role: "bot", text: greetingText() };
      setMessages([g]);
      void speak(g.text);
    }
  }

  function startListening() {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = BCP47[language];
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      setListening(false);
      handleSend(e.results[0][0].transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      {open && (
        <div
          role="dialog"
          aria-label={t("assistant.title")}
          className="mb-3 flex h-[min(34rem,72vh)] w-[min(24rem,94vw)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-[color:var(--brand)] px-4 py-3 text-white">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20">
              <Bot className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-tight">{t("assistant.title")}</p>
              <p className="truncate text-xs text-white/80">{t("nicci.tagline")}</p>
            </div>
            <button
              type="button"
              onClick={() => setSpeakOn((v) => { if (v) stopSpeaking(); return !v; })}
              aria-label={speakOn ? t("nicci.mute") : t("nicci.unmute")}
              title={speakOn ? t("nicci.mute") : t("nicci.unmute")}
              className="rounded-full p-1.5 hover:bg-white/15"
            >
              {speakOn ? <Volume2 className="h-5 w-5" aria-hidden /> : <VolumeX className="h-5 w-5" aria-hidden />}
            </button>
            <button type="button" onClick={toggleOpen} aria-label={t("a11y.close")} className="rounded-full p-1.5 hover:bg-white/15">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "bg-[color:var(--brand)] text-white" : "bg-surface text-foreground"}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.actions.map((a) => (
                        <Link
                          key={a.href}
                          href={a.href}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-xs font-semibold text-[color:var(--brand)] ring-1 ring-[color:var(--brand)]/30 hover:bg-[color:var(--brand)]/10"
                        >
                          {t(a.labelKey)}
                          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 border-t border-border px-3 pt-3">
            {QUICK.map((q) => (
              <button
                key={q.topicId}
                type="button"
                onClick={() => handleQuick(q.topicId, t(q.labelKey))}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:border-[var(--brand)] hover:bg-surface"
              >
                {t(q.labelKey)}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? t("nicci.listening") : t("nicci.placeholder")}
              aria-label={t("nicci.placeholder")}
              className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
            />
            <button
              type="button"
              onClick={startListening}
              aria-label={t("nicci.micStart")}
              title={t("nicci.micStart")}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${listening ? "bg-red-600 text-white" : "hover:bg-surface"}`}
            >
              <Mic className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="submit"
              aria-label={t("nicci.send")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--brand)] text-white hover:opacity-90"
            >
              <Send className="h-5 w-5" aria-hidden />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        aria-label={t("assistant.open")}
        aria-expanded={open}
        className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--brand)] text-white shadow-xl transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <Bot className="h-6 w-6" aria-hidden />}
      </button>
    </div>
  );
}
