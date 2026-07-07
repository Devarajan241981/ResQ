/**
 * Minimal i18n mechanism: dictionaries keyed by language code, with English as
 * the guaranteed-complete fallback. Matches the language codes the backend
 * accepts (accounts.User.preferred_language / config.settings.base.LANGUAGES).
 *
 * Only `en` and `hi` are fully translated today — the rest are registered as
 * supported (selectable in the UI) but fall back to English key-by-key until
 * translated. That's tracked here explicitly rather than silently shipping
 * English text under a different language's label.
 */
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", translated: true },
  { code: "hi", label: "हिन्दी (Hindi)", translated: true },
  { code: "ta", label: "தமிழ் (Tamil)", translated: false },
  { code: "te", label: "తెలుగు (Telugu)", translated: false },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)", translated: false },
  { code: "ml", label: "മലയാളം (Malayalam)", translated: false },
  { code: "mr", label: "मराठी (Marathi)", translated: false },
  { code: "bn", label: "বাংলা (Bengali)", translated: false },
  { code: "gu", label: "ગુજરાતી (Gujarati)", translated: false },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)", translated: false },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const translations = {
  en: {
    "nav.home": "Home",
    "nav.missingPersons": "Missing Persons",
    "nav.sos": "SOS",
    "nav.bloodDonation": "Blood Donation",
    "nav.disasterMode": "Disaster Mode",
    "nav.about": "About",
    "nav.login": "Log in",
    "nav.register": "Sign up",
    "nav.logout": "Log out",
    "common.loading": "Loading…",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.retry": "Try again",
    "home.title": "ResQ India",
    "home.subtitle": "AI-powered community platform for emergencies — missing persons, SOS, blood donation, and disaster coordination.",
  },
  hi: {
    "nav.home": "होम",
    "nav.missingPersons": "लापता व्यक्ति",
    "nav.sos": "एसओएस",
    "nav.bloodDonation": "रक्तदान",
    "nav.disasterMode": "आपदा मोड",
    "nav.about": "हमारे बारे में",
    "nav.login": "लॉग इन करें",
    "nav.register": "साइन अप करें",
    "nav.logout": "लॉग आउट",
    "common.loading": "लोड हो रहा है…",
    "common.submit": "जमा करें",
    "common.cancel": "रद्द करें",
    "common.save": "सहेजें",
    "common.retry": "पुनः प्रयास करें",
    "home.title": "रेसक्यू इंडिया",
    "home.subtitle": "आपातकालीन स्थितियों के लिए एआई-संचालित सामुदायिक मंच — लापता व्यक्ति, एसओएस, रक्तदान और आपदा समन्वय।",
  },
} satisfies Partial<Record<LanguageCode, Record<string, string>>>;

export type TranslationKey = keyof (typeof translations)["en"];

export function translate(lang: LanguageCode, key: TranslationKey): string {
  const dict = (translations as Record<string, Record<string, string> | undefined>)[lang];
  return dict?.[key] ?? translations.en[key] ?? key;
}
