import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "mr", label: "मराठी" },
  { code: "bn", label: "বাংলা" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

/** BCP-47 tags for on-device speech (expo-speech) per language. */
export const BCP47: Record<LanguageCode, string> = {
  en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN",
  ml: "ml-IN", mr: "mr-IN", bn: "bn-IN", gu: "gu-IN", pa: "pa-IN",
};

const en = {
  "tab.home": "Home",
  "tab.search": "Search",
  "tab.sos": "SOS",
  "tab.community": "Community",
  "tab.profile": "Profile",
  "common.login": "Log in",
  "common.logout": "Log out",
  "common.seeAll": "See all",
  "common.goHome": "Go to home",
  "home.badge": "COMMUNITY EMERGENCY RESPONSE",
  "home.greeting": "Namaskar, {name}",
  "home.greetingGuest": "Namaskar 🙏",
  "home.heroSub": "Report, respond, and coordinate help across Bharath — together.",
  "home.emergencySos": "Emergency SOS",
  "home.services": "Services",
  "home.trending": "Trending now",
  "home.noEvents": "No upcoming events yet.",
  "home.latestCampaigns": "Latest campaigns",
  "home.dangerNote": "In immediate danger? Call 112 directly — this app supplements official emergency services.",
  "stats.services": "Services",
  "stats.response": "Response",
  "stats.missing": "Missing",
  "stats.languages": "Languages",
  "svc.missing": "Missing",
  "svc.sos": "SOS",
  "svc.blood": "Blood",
  "svc.disaster": "Disaster",
  "svc.campaigns": "Campaigns",
  "svc.community": "Community",
  "svc.calendar": "Calendar",
  "svc.gallery": "Gallery",
  "sos.title": "Emergency SOS",
  "sos.tapTitle": "Hold-free emergency alert",
  "sos.tapSub": "Tap to alert your trusted contacts and nearby volunteers with your live location.",
  "sos.sending": "SENDING…",
  "sos.sent": "SENT",
  "sos.helplines": "Emergency helplines",
  "sos.disclaimer": "This platform supplements — it does not replace — official emergency services. If you are in immediate danger, call 112 directly.",
  "hl.emergency": "Emergency",
  "hl.ambulance": "Ambulance",
  "hl.fire": "Fire",
  "hl.police": "Police",
  "hl.child": "Child",
  "hl.women": "Women",
  "hl.disaster": "Disaster",
  "hl.road": "Road",
  "prof.welcome": "Welcome to ResQ Bharath",
  "prof.explore": "Explore",
  "prof.account": "Account",
  "prof.city": "City",
  "prof.language": "Language",
  "prof.phone": "Phone",
  "prof.chooseLanguage": "Choose language",
  "menu.missing": "Missing Persons",
  "menu.blood": "Blood Donation",
  "menu.disaster": "Disaster Mode",
  "menu.campaigns": "Campaigns",
  "menu.events": "Events",
  "menu.calendar": "Calendar",
  "menu.gallery": "Gallery",
  "menu.notifications": "Notifications",
  "menu.assistant": "ResQ Assistant",
  "comm.highlights": "Highlights",
  "comm.groups": "Groups near you",
  "comm.noGroups": "No groups yet",
  "comm.join": "Join",
  "comm.joined": "Joined",
  "search.placeholder": "Search people, services, help…",
  "search.recent": "Recent reports",
  "search.noMatches": "No matches",
  "act.report": "Report a missing person",
  "act.raiseBlood": "Raise a blood request",
  "act.sharePhoto": "Share a photo",
  "act.canDonate": "I can donate",
  "act.responded": "You responded",
  "act.rsvp": "RSVP",
  "act.going": "Going",
  "act.markAll": "Mark all read",
  "list.noReports": "No reports",
  "list.noBlood": "No open requests",
  "list.noDisaster": "No active alerts",
  "list.noCampaigns": "No campaigns",
  "list.noEvents": "No upcoming events",
  "list.noImages": "No images yet",
  "list.noHolidays": "No holidays this month",
  "list.caughtUp": "You're all caught up",
  "form.name": "Full name",
  "form.email": "Email",
  "form.phone": "Phone",
  "form.city": "City",
  "form.password": "Password",
  "form.registerTitle": "Create your account",
  "form.reportTitle": "Report a missing person",
  "form.bloodTitle": "Raise a blood request",
  "form.galleryTitle": "Share a photo",
  "sos.call112": "Call 112",
  "sos.call112sub": "Connects instantly to the nearest police, ambulance & fire control room",
  "sos.sendAlert": "Send SOS to my network",
  "sos.sendAlertSub": "Alerts your trusted contacts and nearby verified responders with your live location",
  "sos.active": "SOS ACTIVE",
  "sos.sharing": "Sharing your live location with your contacts and nearby responders",
  "sos.imSafe": "I'm safe — end SOS",
  "sos.quickDial": "Quick dial",
  "sos.manageContacts": "Emergency contacts",
  "tc.title": "Emergency contacts",
  "tc.sub": "People we alert by SMS the moment you send an SOS. Add a few so help reaches you even if one is far away.",
  "tc.add": "Add contact",
  "tc.relationship": "Relationship (e.g. brother)",
  "tc.none": "No contacts yet",
  "tc.save": "Save contact",
  "svc.hospitals": "Hospitals",
  "svc.shelters": "Shelters",
  "hosp.title": "Hospitals near you",
  "shel.title": "Relief shelters near you",
  "dir.call": "Call",
  "dir.emergency": "Emergency",
  "dir.trauma": "Trauma centre",
  "dir.bloodBank": "Blood bank",
  "dir.beds": "beds free",
  "dir.locate": "Turn on location to see the nearest first",
  "dir.none": "Nothing found nearby",
};

export type TKey = keyof typeof en;
type Dict = Record<TKey, string>;

const hi: Partial<Dict> = {
  "tab.home": "होम", "tab.search": "खोज", "tab.sos": "एसओएस", "tab.community": "समुदाय", "tab.profile": "प्रोफ़ाइल",
  "common.login": "लॉग इन", "common.logout": "लॉग आउट", "common.seeAll": "सभी देखें", "common.goHome": "होम पर जाएँ",
  "home.badge": "सामुदायिक आपातकालीन प्रतिक्रिया", "home.greeting": "नमस्कार, {name}", "home.greetingGuest": "नमस्कार 🙏",
  "home.heroSub": "पूरे भारत में मिलकर रिपोर्ट करें, प्रतिक्रिया दें और मदद का समन्वय करें।",
  "home.emergencySos": "आपातकालीन एसओएस", "home.services": "सेवाएं", "home.trending": "अभी ट्रेंडिंग",
  "home.noEvents": "अभी कोई आगामी कार्यक्रम नहीं।", "home.latestCampaigns": "नवीनतम अभियान",
  "home.dangerNote": "तत्काल खतरे में हैं? सीधे 112 पर कॉल करें — यह ऐप आधिकारिक आपातकालीन सेवाओं का पूरक है।",
  "stats.services": "सेवाएं", "stats.response": "प्रतिक्रिया", "stats.missing": "लापता", "stats.languages": "भाषाएं",
  "svc.missing": "लापता", "svc.sos": "एसओएस", "svc.blood": "रक्त", "svc.disaster": "आपदा", "svc.campaigns": "अभियान",
  "svc.community": "समुदाय", "svc.calendar": "कैलेंडर", "svc.gallery": "गैलरी",
  "sos.title": "आपातकालीन एसओएस", "sos.tapTitle": "त्वरित आपातकालीन अलर्ट",
  "sos.tapSub": "अपने विश्वसनीय संपर्कों और नज़दीकी स्वयंसेवकों को अपने लाइव स्थान के साथ सचेत करने के लिए टैप करें।",
  "sos.sending": "भेजा जा रहा है…", "sos.sent": "भेजा गया", "sos.helplines": "आपातकालीन हेल्पलाइन",
  "sos.disclaimer": "यह मंच आधिकारिक आपातकालीन सेवाओं का पूरक है, विकल्प नहीं। तत्काल खतरे में हों तो सीधे 112 पर कॉल करें।",
  "hl.emergency": "आपातकाल", "hl.ambulance": "एम्बुलेंस", "hl.fire": "अग्निशमन", "hl.police": "पुलिस",
  "hl.child": "बाल", "hl.women": "महिला", "hl.disaster": "आपदा", "hl.road": "सड़क",
  "prof.welcome": "रेसक्यू भारत में आपका स्वागत है", "prof.explore": "एक्सप्लोर करें", "prof.account": "खाता",
  "prof.city": "शहर", "prof.language": "भाषा", "prof.phone": "फ़ोन", "prof.chooseLanguage": "भाषा चुनें",
  "menu.missing": "लापता व्यक्ति", "menu.blood": "रक्तदान", "menu.disaster": "आपदा मोड", "menu.campaigns": "अभियान",
  "menu.events": "कार्यक्रम", "menu.calendar": "कैलेंडर", "menu.gallery": "गैलरी", "menu.notifications": "सूचनाएं",
  "menu.assistant": "रेसक्यू सहायक",
  "comm.highlights": "मुख्य अंश", "comm.groups": "आपके पास समूह", "comm.noGroups": "अभी कोई समूह नहीं",
  "comm.join": "शामिल हों", "comm.joined": "शामिल हुए",
  "search.placeholder": "लोग, सेवाएं, मदद खोजें…", "search.recent": "हाल की रिपोर्ट", "search.noMatches": "कोई मिलान नहीं",
};

const ta: Partial<Dict> = {
  "tab.home": "முகப்பு", "tab.search": "தேடல்", "tab.sos": "SOS", "tab.community": "சமூகம்", "tab.profile": "சுயவிவரம்",
  "common.login": "உள்நுழை", "common.logout": "வெளியேறு", "common.seeAll": "அனைத்தையும் காண்க", "common.goHome": "முகப்புக்கு",
  "home.badge": "சமூக அவசர பதில்", "home.greeting": "நமஸ்காரம், {name}", "home.greetingGuest": "நமஸ்காரம் 🙏",
  "home.heroSub": "பாரதம் முழுவதும் ஒன்றாக புகாரளியுங்கள், பதிலளியுங்கள், உதவியை ஒருங்கிணையுங்கள்.",
  "home.emergencySos": "அவசர SOS", "home.services": "சேவைகள்", "home.trending": "இப்போது பிரபலம்",
  "home.noEvents": "வரவிருக்கும் நிகழ்வுகள் இல்லை.", "home.latestCampaigns": "சமீபத்திய பிரச்சாரங்கள்",
  "home.dangerNote": "உடனடி ஆபத்தில் உள்ளீர்களா? நேரடியாக 112 ஐ அழைக்கவும் — இந்த ஆப் அதிகாரப்பூர்வ சேவைகளுக்கு துணை.",
  "stats.services": "சேவைகள்", "stats.response": "பதில்", "stats.missing": "காணவில்லை", "stats.languages": "மொழிகள்",
  "svc.missing": "காணவில்லை", "svc.sos": "SOS", "svc.blood": "இரத்தம்", "svc.disaster": "பேரிடர்", "svc.campaigns": "பிரச்சாரங்கள்",
  "svc.community": "சமூகம்", "svc.calendar": "நாட்காட்டி", "svc.gallery": "தொகுப்பு",
  "sos.title": "அவசர SOS", "sos.tapTitle": "விரைவு அவசர எச்சரிக்கை",
  "sos.tapSub": "உங்கள் நம்பகமான தொடர்புகளையும் அருகிலுள்ள தன்னார்வலர்களையும் உங்கள் நேரடி இருப்பிடத்துடன் எச்சரிக்க தட்டவும்.",
  "sos.sending": "அனுப்புகிறது…", "sos.sent": "அனுப்பப்பட்டது", "sos.helplines": "அவசர உதவி எண்கள்",
  "sos.disclaimer": "இந்த தளம் அதிகாரப்பூர்வ அவசர சேவைகளுக்கு துணையே, மாற்றல்ல. உடனடி ஆபத்தில் இருந்தால் நேரடியாக 112 ஐ அழைக்கவும்.",
  "hl.emergency": "அவசரம்", "hl.ambulance": "ஆம்புலன்ஸ்", "hl.fire": "தீ", "hl.police": "காவல்",
  "hl.child": "குழந்தை", "hl.women": "பெண்கள்", "hl.disaster": "பேரிடர்", "hl.road": "சாலை",
  "prof.welcome": "ரெஸ்க்யூ பாரத்திற்கு வரவேற்கிறோம்", "prof.explore": "ஆராயுங்கள்", "prof.account": "கணக்கு",
  "prof.city": "நகரம்", "prof.language": "மொழி", "prof.phone": "தொலைபேசி", "prof.chooseLanguage": "மொழியைத் தேர்ந்தெடுக்கவும்",
  "menu.missing": "காணாமல் போனவர்கள்", "menu.blood": "இரத்த தானம்", "menu.disaster": "பேரிடர் பயன்முறை", "menu.campaigns": "பிரச்சாரங்கள்",
  "menu.events": "நிகழ்வுகள்", "menu.calendar": "நாட்காட்டி", "menu.gallery": "தொகுப்பு", "menu.notifications": "அறிவிப்புகள்",
  "menu.assistant": "ரெஸ்க்யூ உதவியாளர்",
  "comm.highlights": "சிறப்பம்சங்கள்", "comm.groups": "அருகிலுள்ள குழுக்கள்", "comm.noGroups": "இன்னும் குழுக்கள் இல்லை",
  "comm.join": "இணை", "comm.joined": "இணைந்தது",
  "search.placeholder": "நபர்கள், சேவைகள், உதவியைத் தேடுங்கள்…", "search.recent": "சமீபத்திய அறிக்கைகள்", "search.noMatches": "பொருத்தம் இல்லை",
};

const te: Partial<Dict> = {
  "tab.home": "హోమ్", "tab.search": "శోధన", "tab.sos": "SOS", "tab.community": "సమాజం", "tab.profile": "ప్రొఫైల్",
  "common.login": "లాగిన్", "common.logout": "లాగ్ అవుట్", "common.seeAll": "అన్నీ చూడండి", "common.goHome": "హోమ్‌కు",
  "home.badge": "సమాజ అత్యవసర స్పందన", "home.greeting": "నమస్కారం, {name}", "home.greetingGuest": "నమస్కారం 🙏",
  "home.heroSub": "భారత్ అంతటా కలిసి నివేదించండి, స్పందించండి, సహాయాన్ని సమన్వయం చేయండి.",
  "home.emergencySos": "అత్యవసర SOS", "home.services": "సేవలు", "home.trending": "ఇప్పుడు ట్రెండింగ్",
  "home.noEvents": "రాబోయే కార్యక్రమాలు లేవు.", "home.latestCampaigns": "తాజా ప్రచారాలు",
  "home.dangerNote": "తక్షణ ప్రమాదంలో ఉన్నారా? నేరుగా 112కు కాల్ చేయండి — ఈ యాప్ అధికారిక సేవలకు అనుబంధం.",
  "stats.services": "సేవలు", "stats.response": "స్పందన", "stats.missing": "తప్పిపోయిన", "stats.languages": "భాషలు",
  "svc.missing": "తప్పిపోయిన", "svc.sos": "SOS", "svc.blood": "రక్తం", "svc.disaster": "విపత్తు", "svc.campaigns": "ప్రచారాలు",
  "svc.community": "సమాజం", "svc.calendar": "క్యాలెండర్", "svc.gallery": "గ్యాలరీ",
  "sos.title": "అత్యవసర SOS", "sos.tapTitle": "త్వరిత అత్యవసర హెచ్చరిక",
  "sos.tapSub": "మీ నమ్మకమైన పరిచయాలు మరియు సమీప వాలంటీర్లను మీ ప్రత్యక్ష స్థానంతో హెచ్చరించడానికి నొక్కండి.",
  "sos.sending": "పంపుతోంది…", "sos.sent": "పంపబడింది", "sos.helplines": "అత్యవసర హెల్ప్‌లైన్లు",
  "sos.disclaimer": "ఈ వేదిక అధికారిక అత్యవసర సేవలకు అనుబంధం, ప్రత్యామ్నాయం కాదు. తక్షణ ప్రమాదంలో ఉంటే నేరుగా 112కు కాల్ చేయండి.",
  "hl.emergency": "అత్యవసరం", "hl.ambulance": "అంబులెన్స్", "hl.fire": "అగ్నిమాపక", "hl.police": "పోలీసు",
  "hl.child": "చిన్నారి", "hl.women": "మహిళలు", "hl.disaster": "విపత్తు", "hl.road": "రహదారి",
  "prof.welcome": "రెస్క్యూ భారత్‌కు స్వాగతం", "prof.explore": "అన్వేషించండి", "prof.account": "ఖాతా",
  "prof.city": "నగరం", "prof.language": "భాష", "prof.phone": "ఫోన్", "prof.chooseLanguage": "భాషను ఎంచుకోండి",
  "menu.missing": "తప్పిపోయిన వ్యక్తులు", "menu.blood": "రక్తదానం", "menu.disaster": "విపత్తు మోడ్", "menu.campaigns": "ప్రచారాలు",
  "menu.events": "కార్యక్రమాలు", "menu.calendar": "క్యాలెండర్", "menu.gallery": "గ్యాలరీ", "menu.notifications": "నోటిఫికేషన్లు",
  "menu.assistant": "రెస్క్యూ అసిస్టెంట్",
  "comm.highlights": "ముఖ్యాంశాలు", "comm.groups": "మీ దగ్గర సమూహాలు", "comm.noGroups": "ఇంకా సమూహాలు లేవు",
  "comm.join": "చేరండి", "comm.joined": "చేరారు",
  "search.placeholder": "వ్యక్తులు, సేవలు, సహాయం కోసం వెతకండి…", "search.recent": "ఇటీవలి నివేదికలు", "search.noMatches": "సరిపోలికలు లేవు",
};

const kn: Partial<Dict> = {
  "tab.home": "ಮುಖಪುಟ", "tab.search": "ಹುಡುಕಿ", "tab.sos": "SOS", "tab.community": "ಸಮುದಾಯ", "tab.profile": "ಪ್ರೊಫೈಲ್",
  "common.login": "ಲಾಗಿನ್", "common.logout": "ಲಾಗ್ ಔಟ್", "common.seeAll": "ಎಲ್ಲವನ್ನೂ ನೋಡಿ", "common.goHome": "ಮುಖಪುಟಕ್ಕೆ",
  "home.badge": "ಸಮುದಾಯ ತುರ್ತು ಪ್ರತಿಕ್ರಿಯೆ", "home.greeting": "ನಮಸ್ಕಾರ, {name}", "home.greetingGuest": "ನಮಸ್ಕಾರ 🙏",
  "home.heroSub": "ಭಾರತದಾದ್ಯಂತ ಒಟ್ಟಿಗೆ ವರದಿ ಮಾಡಿ, ಪ್ರತಿಕ್ರಿಯಿಸಿ, ಸಹಾಯವನ್ನು ಸಂಯೋಜಿಸಿ.",
  "home.emergencySos": "ತುರ್ತು SOS", "home.services": "ಸೇವೆಗಳು", "home.trending": "ಈಗ ಟ್ರೆಂಡಿಂಗ್",
  "home.noEvents": "ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮಗಳಿಲ್ಲ.", "home.latestCampaigns": "ಇತ್ತೀಚಿನ ಅಭಿಯಾನಗಳು",
  "home.dangerNote": "ತಕ್ಷಣದ ಅಪಾಯದಲ್ಲಿದ್ದೀರಾ? ನೇರವಾಗಿ 112ಗೆ ಕರೆ ಮಾಡಿ — ಈ ಆ್ಯಪ್ ಅಧಿಕೃತ ಸೇವೆಗಳಿಗೆ ಪೂರಕ.",
  "stats.services": "ಸೇವೆಗಳು", "stats.response": "ಪ್ರತಿಕ್ರಿಯೆ", "stats.missing": "ಕಾಣೆಯಾದ", "stats.languages": "ಭಾಷೆಗಳು",
  "svc.missing": "ಕಾಣೆಯಾದ", "svc.sos": "SOS", "svc.blood": "ರಕ್ತ", "svc.disaster": "ವಿಪತ್ತು", "svc.campaigns": "ಅಭಿಯಾನಗಳು",
  "svc.community": "ಸಮುದಾಯ", "svc.calendar": "ಕ್ಯಾಲೆಂಡರ್", "svc.gallery": "ಗ್ಯಾಲರಿ",
  "sos.title": "ತುರ್ತು SOS", "sos.tapTitle": "ತ್ವರಿತ ತುರ್ತು ಎಚ್ಚರಿಕೆ",
  "sos.tapSub": "ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಸಂಪರ್ಕಗಳು ಮತ್ತು ಹತ್ತಿರದ ಸ್ವಯಂಸೇವಕರಿಗೆ ನಿಮ್ಮ ನೇರ ಸ್ಥಳದೊಂದಿಗೆ ಎಚ್ಚರಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ.",
  "sos.sending": "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…", "sos.sent": "ಕಳುಹಿಸಲಾಗಿದೆ", "sos.helplines": "ತುರ್ತು ಸಹಾಯವಾಣಿಗಳು",
  "sos.disclaimer": "ಈ ವೇದಿಕೆ ಅಧಿಕೃತ ತುರ್ತು ಸೇವೆಗಳಿಗೆ ಪೂರಕ, ಬದಲಿಯಲ್ಲ. ತಕ್ಷಣದ ಅಪಾಯದಲ್ಲಿದ್ದರೆ ನೇರವಾಗಿ 112ಗೆ ಕರೆ ಮಾಡಿ.",
  "hl.emergency": "ತುರ್ತು", "hl.ambulance": "ಆಂಬ್ಯುಲೆನ್ಸ್", "hl.fire": "ಅಗ್ನಿಶಾಮಕ", "hl.police": "ಪೊಲೀಸ್",
  "hl.child": "ಮಗು", "hl.women": "ಮಹಿಳೆ", "hl.disaster": "ವಿಪತ್ತು", "hl.road": "ರಸ್ತೆ",
  "prof.welcome": "ರೆಸ್‌ಕ್ಯೂ ಭಾರತ್‌ಗೆ ಸ್ವಾಗತ", "prof.explore": "ಅನ್ವೇಷಿಸಿ", "prof.account": "ಖಾತೆ",
  "prof.city": "ನಗರ", "prof.language": "ಭಾಷೆ", "prof.phone": "ಫೋನ್", "prof.chooseLanguage": "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
  "menu.missing": "ಕಾಣೆಯಾದವರು", "menu.blood": "ರಕ್ತದಾನ", "menu.disaster": "ವಿಪತ್ತು ಮೋಡ್", "menu.campaigns": "ಅಭಿಯಾನಗಳು",
  "menu.events": "ಕಾರ್ಯಕ್ರಮಗಳು", "menu.calendar": "ಕ್ಯಾಲೆಂಡರ್", "menu.gallery": "ಗ್ಯಾಲರಿ", "menu.notifications": "ಅಧಿಸೂಚನೆಗಳು",
  "menu.assistant": "ರೆಸ್‌ಕ್ಯೂ ಸಹಾಯಕ",
  "comm.highlights": "ಮುಖ್ಯಾಂಶಗಳು", "comm.groups": "ನಿಮ್ಮ ಹತ್ತಿರದ ಗುಂಪುಗಳು", "comm.noGroups": "ಇನ್ನೂ ಗುಂಪುಗಳಿಲ್ಲ",
  "comm.join": "ಸೇರಿ", "comm.joined": "ಸೇರಿದ್ದೀರಿ",
  "search.placeholder": "ಜನರು, ಸೇವೆಗಳು, ಸಹಾಯ ಹುಡುಕಿ…", "search.recent": "ಇತ್ತೀಚಿನ ವರದಿಗಳು", "search.noMatches": "ಹೊಂದಾಣಿಕೆಗಳಿಲ್ಲ",
};

const ml: Partial<Dict> = {
  "tab.home": "ഹോം", "tab.search": "തിരയൽ", "tab.sos": "SOS", "tab.community": "സമൂഹം", "tab.profile": "പ്രൊഫൈൽ",
  "common.login": "ലോഗിൻ", "common.logout": "ലോഗ് ഔട്ട്", "common.seeAll": "എല്ലാം കാണുക", "common.goHome": "ഹോമിലേക്ക്",
  "home.badge": "സമൂഹ അടിയന്തര പ്രതികരണം", "home.greeting": "നമസ്കാരം, {name}", "home.greetingGuest": "നമസ്കാരം 🙏",
  "home.heroSub": "ഭാരതമെമ്പാടും ഒരുമിച്ച് റിപ്പോർട്ട് ചെയ്യൂ, പ്രതികരിക്കൂ, സഹായം ഏകോപിപ്പിക്കൂ.",
  "home.emergencySos": "അടിയന്തര SOS", "home.services": "സേവനങ്ങൾ", "home.trending": "ഇപ്പോൾ ട്രെൻഡിംഗ്",
  "home.noEvents": "വരാനിരിക്കുന്ന പരിപാടികളില്ല.", "home.latestCampaigns": "പുതിയ കാമ്പെയ്‌നുകൾ",
  "home.dangerNote": "ഉടനടി അപകടത്തിലാണോ? നേരിട്ട് 112 വിളിക്കൂ — ഈ ആപ്പ് ഔദ്യോഗിക സേവനങ്ങൾക്ക് അനുബന്ധമാണ്.",
  "stats.services": "സേവനങ്ങൾ", "stats.response": "പ്രതികരണം", "stats.missing": "കാണാതായ", "stats.languages": "ഭാഷകൾ",
  "svc.missing": "കാണാതായ", "svc.sos": "SOS", "svc.blood": "രക്തം", "svc.disaster": "ദുരന്തം", "svc.campaigns": "കാമ്പെയ്‌നുകൾ",
  "svc.community": "സമൂഹം", "svc.calendar": "കലണ്ടർ", "svc.gallery": "ഗാലറി",
  "sos.title": "അടിയന്തര SOS", "sos.tapTitle": "വേഗത്തിലുള്ള അടിയന്തര അലേർട്ട്",
  "sos.tapSub": "നിങ്ങളുടെ വിശ്വസ്ത കോൺടാക്റ്റുകളെയും സമീപത്തെ സന്നദ്ധപ്രവർത്തകരെയും തത്സമയ ലൊക്കേഷനോടെ അറിയിക്കാൻ ടാപ്പ് ചെയ്യുക.",
  "sos.sending": "അയയ്ക്കുന്നു…", "sos.sent": "അയച്ചു", "sos.helplines": "അടിയന്തര ഹെൽപ്പ്‌ലൈനുകൾ",
  "sos.disclaimer": "ഈ പ്ലാറ്റ്ഫോം ഔദ്യോഗിക അടിയന്തര സേവനങ്ങൾക്ക് അനുബന്ധമാണ്, പകരമല്ല. ഉടനടി അപകടത്തിലാണെങ്കിൽ നേരിട്ട് 112 വിളിക്കൂ.",
  "hl.emergency": "അടിയന്തരം", "hl.ambulance": "ആംബുലൻസ്", "hl.fire": "അഗ്നിശമനം", "hl.police": "പോലീസ്",
  "hl.child": "കുട്ടി", "hl.women": "സ്ത്രീകൾ", "hl.disaster": "ദുരന്തം", "hl.road": "റോഡ്",
  "prof.welcome": "റെസ്ക്യൂ ഭാരതിലേക്ക് സ്വാഗതം", "prof.explore": "പര്യവേക്ഷണം", "prof.account": "അക്കൗണ്ട്",
  "prof.city": "നഗരം", "prof.language": "ഭാഷ", "prof.phone": "ഫോൺ", "prof.chooseLanguage": "ഭാഷ തിരഞ്ഞെടുക്കുക",
  "menu.missing": "കാണാതായവർ", "menu.blood": "രക്തദാനം", "menu.disaster": "ദുരന്ത മോഡ്", "menu.campaigns": "കാമ്പെയ്‌നുകൾ",
  "menu.events": "പരിപാടികൾ", "menu.calendar": "കലണ്ടർ", "menu.gallery": "ഗാലറി", "menu.notifications": "അറിയിപ്പുകൾ",
  "menu.assistant": "റെസ്ക്യൂ അസിസ്റ്റന്റ്",
  "comm.highlights": "പ്രധാന ചിത്രങ്ങൾ", "comm.groups": "അടുത്തുള്ള ഗ്രൂപ്പുകൾ", "comm.noGroups": "ഇതുവരെ ഗ്രൂപ്പുകളില്ല",
  "comm.join": "ചേരൂ", "comm.joined": "ചേർന്നു",
  "search.placeholder": "ആളുകൾ, സേവനങ്ങൾ, സഹായം തിരയുക…", "search.recent": "സമീപകാല റിപ്പോർട്ടുകൾ", "search.noMatches": "പൊരുത്തങ്ങളില്ല",
};

const mr: Partial<Dict> = {
  "tab.home": "मुख्यपृष्ठ", "tab.search": "शोध", "tab.sos": "एसओएस", "tab.community": "समुदाय", "tab.profile": "प्रोफाइल",
  "common.login": "लॉग इन", "common.logout": "लॉग आउट", "common.seeAll": "सर्व पहा", "common.goHome": "मुख्यपृष्ठावर",
  "home.badge": "सामुदायिक आपत्कालीन प्रतिसाद", "home.greeting": "नमस्कार, {name}", "home.greetingGuest": "नमस्कार 🙏",
  "home.heroSub": "संपूर्ण भारतात एकत्र नोंदवा, प्रतिसाद द्या आणि मदतीचे समन्वय करा.",
  "home.emergencySos": "आपत्कालीन एसओएस", "home.services": "सेवा", "home.trending": "आत्ता ट्रेंडिंग",
  "home.noEvents": "आगामी कार्यक्रम नाहीत.", "home.latestCampaigns": "नवीनतम मोहिमा",
  "home.dangerNote": "तत्काळ धोक्यात आहात? थेट 112 वर कॉल करा — हे ॲप अधिकृत सेवांना पूरक आहे.",
  "stats.services": "सेवा", "stats.response": "प्रतिसाद", "stats.missing": "बेपत्ता", "stats.languages": "भाषा",
  "svc.missing": "बेपत्ता", "svc.sos": "एसओएस", "svc.blood": "रक्त", "svc.disaster": "आपत्ती", "svc.campaigns": "मोहिमा",
  "svc.community": "समुदाय", "svc.calendar": "दिनदर्शिका", "svc.gallery": "गॅलरी",
  "sos.title": "आपत्कालीन एसओएस", "sos.tapTitle": "त्वरित आपत्कालीन इशारा",
  "sos.tapSub": "तुमच्या विश्वासू संपर्कांना आणि जवळच्या स्वयंसेवकांना तुमच्या थेट स्थानासह सतर्क करण्यासाठी टॅप करा.",
  "sos.sending": "पाठवत आहे…", "sos.sent": "पाठवले", "sos.helplines": "आपत्कालीन हेल्पलाइन",
  "sos.disclaimer": "हे व्यासपीठ अधिकृत आपत्कालीन सेवांना पूरक आहे, पर्याय नाही. तत्काळ धोक्यात असल्यास थेट 112 वर कॉल करा.",
  "hl.emergency": "आणीबाणी", "hl.ambulance": "रुग्णवाहिका", "hl.fire": "अग्निशमन", "hl.police": "पोलीस",
  "hl.child": "बाल", "hl.women": "महिला", "hl.disaster": "आपत्ती", "hl.road": "रस्ता",
  "prof.welcome": "रेसक्यू भारतमध्ये आपले स्वागत आहे", "prof.explore": "एक्सप्लोर करा", "prof.account": "खाते",
  "prof.city": "शहर", "prof.language": "भाषा", "prof.phone": "फोन", "prof.chooseLanguage": "भाषा निवडा",
  "menu.missing": "बेपत्ता व्यक्ती", "menu.blood": "रक्तदान", "menu.disaster": "आपत्ती मोड", "menu.campaigns": "मोहिमा",
  "menu.events": "कार्यक्रम", "menu.calendar": "दिनदर्शिका", "menu.gallery": "गॅलरी", "menu.notifications": "सूचना",
  "menu.assistant": "रेसक्यू सहाय्यक",
  "comm.highlights": "ठळक", "comm.groups": "तुमच्या जवळचे गट", "comm.noGroups": "अद्याप गट नाहीत",
  "comm.join": "सामील व्हा", "comm.joined": "सामील झाले",
  "search.placeholder": "लोक, सेवा, मदत शोधा…", "search.recent": "अलीकडील अहवाल", "search.noMatches": "जुळणी नाही",
};

const bn: Partial<Dict> = {
  "tab.home": "হোম", "tab.search": "অনুসন্ধান", "tab.sos": "SOS", "tab.community": "সম্প্রদায়", "tab.profile": "প্রোফাইল",
  "common.login": "লগ ইন", "common.logout": "লগ আউট", "common.seeAll": "সব দেখুন", "common.goHome": "হোমে যান",
  "home.badge": "সম্প্রদায় জরুরি প্রতিক্রিয়া", "home.greeting": "নমস্কার, {name}", "home.greetingGuest": "নমস্কার 🙏",
  "home.heroSub": "সারা ভারতে একসাথে রিপোর্ট করুন, সাড়া দিন এবং সাহায্য সমন্বয় করুন।",
  "home.emergencySos": "জরুরি SOS", "home.services": "পরিষেবা", "home.trending": "এখন ট্রেন্ডিং",
  "home.noEvents": "আসন্ন কোনো অনুষ্ঠান নেই।", "home.latestCampaigns": "সাম্প্রতিক প্রচারাভিযান",
  "home.dangerNote": "তাৎক্ষণিক বিপদে আছেন? সরাসরি 112 কল করুন — এই অ্যাপ সরকারি পরিষেবার পরিপূরক।",
  "stats.services": "পরিষেবা", "stats.response": "সাড়া", "stats.missing": "নিখোঁজ", "stats.languages": "ভাষা",
  "svc.missing": "নিখোঁজ", "svc.sos": "SOS", "svc.blood": "রক্ত", "svc.disaster": "দুর্যোগ", "svc.campaigns": "প্রচারাভিযান",
  "svc.community": "সম্প্রদায়", "svc.calendar": "ক্যালেন্ডার", "svc.gallery": "গ্যালারি",
  "sos.title": "জরুরি SOS", "sos.tapTitle": "দ্রুত জরুরি সতর্কতা",
  "sos.tapSub": "আপনার বিশ্বস্ত পরিচিতি ও কাছের স্বেচ্ছাসেবকদের আপনার লাইভ অবস্থান সহ সতর্ক করতে ট্যাপ করুন।",
  "sos.sending": "পাঠানো হচ্ছে…", "sos.sent": "পাঠানো হয়েছে", "sos.helplines": "জরুরি হেল্পলাইন",
  "sos.disclaimer": "এই প্ল্যাটফর্ম সরকারি জরুরি পরিষেবার পরিপূরক, বিকল্প নয়। তাৎক্ষণিক বিপদে থাকলে সরাসরি 112 কল করুন।",
  "hl.emergency": "জরুরি", "hl.ambulance": "অ্যাম্বুলেন্স", "hl.fire": "দমকল", "hl.police": "পুলিশ",
  "hl.child": "শিশু", "hl.women": "নারী", "hl.disaster": "দুর্যোগ", "hl.road": "সড়ক",
  "prof.welcome": "রেসকিউ ভারতে স্বাগতম", "prof.explore": "অন্বেষণ করুন", "prof.account": "অ্যাকাউন্ট",
  "prof.city": "শহর", "prof.language": "ভাষা", "prof.phone": "ফোন", "prof.chooseLanguage": "ভাষা বেছে নিন",
  "menu.missing": "নিখোঁজ ব্যক্তি", "menu.blood": "রক্তদান", "menu.disaster": "দুর্যোগ মোড", "menu.campaigns": "প্রচারাভিযান",
  "menu.events": "অনুষ্ঠান", "menu.calendar": "ক্যালেন্ডার", "menu.gallery": "গ্যালারি", "menu.notifications": "বিজ্ঞপ্তি",
  "menu.assistant": "রেসকিউ সহকারী",
  "comm.highlights": "হাইলাইট", "comm.groups": "আপনার কাছের গোষ্ঠী", "comm.noGroups": "এখনও কোনো গোষ্ঠী নেই",
  "comm.join": "যোগ দিন", "comm.joined": "যোগ দিয়েছেন",
  "search.placeholder": "মানুষ, পরিষেবা, সাহায্য খুঁজুন…", "search.recent": "সাম্প্রতিক রিপোর্ট", "search.noMatches": "কোনো মিল নেই",
};

const gu: Partial<Dict> = {
  "tab.home": "હોમ", "tab.search": "શોધ", "tab.sos": "SOS", "tab.community": "સમુદાય", "tab.profile": "પ્રોફાઇલ",
  "common.login": "લોગ ઇન", "common.logout": "લોગ આઉટ", "common.seeAll": "બધું જુઓ", "common.goHome": "હોમ પર જાઓ",
  "home.badge": "સામુદાયિક કટોકટી પ્રતિસાદ", "home.greeting": "નમસ્કાર, {name}", "home.greetingGuest": "નમસ્કાર 🙏",
  "home.heroSub": "સમગ્ર ભારતમાં સાથે મળીને જાણ કરો, પ્રતિસાદ આપો અને મદદનું સંકલન કરો.",
  "home.emergencySos": "કટોકટી SOS", "home.services": "સેવાઓ", "home.trending": "અત્યારે ટ્રેન્ડિંગ",
  "home.noEvents": "આગામી કોઈ કાર્યક્રમ નથી.", "home.latestCampaigns": "તાજેતરની ઝુંબેશો",
  "home.dangerNote": "તાત્કાલિક જોખમમાં છો? સીધા 112 પર કૉલ કરો — આ ઍપ સત્તાવાર સેવાઓની પૂરક છે.",
  "stats.services": "સેવાઓ", "stats.response": "પ્રતિસાદ", "stats.missing": "ગુમ", "stats.languages": "ભાષાઓ",
  "svc.missing": "ગુમ", "svc.sos": "SOS", "svc.blood": "રક્ત", "svc.disaster": "આપત્તિ", "svc.campaigns": "ઝુંબેશ",
  "svc.community": "સમુદાય", "svc.calendar": "કૅલેન્ડર", "svc.gallery": "ગૅલેરી",
  "sos.title": "કટોકટી SOS", "sos.tapTitle": "ઝડપી કટોકટી ચેતવણી",
  "sos.tapSub": "તમારા વિશ્વસનીય સંપર્કો અને નજીકના સ્વયંસેવકોને તમારા લાઇવ સ્થાન સાથે ચેતવવા માટે ટૅપ કરો.",
  "sos.sending": "મોકલી રહ્યું છે…", "sos.sent": "મોકલ્યું", "sos.helplines": "કટોકટી હેલ્પલાઇન",
  "sos.disclaimer": "આ પ્લેટફોર્મ સત્તાવાર કટોકટી સેવાઓની પૂરક છે, વિકલ્પ નથી. તાત્કાલિક જોખમમાં હો તો સીધા 112 પર કૉલ કરો.",
  "hl.emergency": "કટોકટી", "hl.ambulance": "એમ્બ્યુલન્સ", "hl.fire": "ફાયર", "hl.police": "પોલીસ",
  "hl.child": "બાળ", "hl.women": "મહિલા", "hl.disaster": "આપત્તિ", "hl.road": "રસ્તો",
  "prof.welcome": "રેસ્ક્યૂ ભારતમાં આપનું સ્વાગત છે", "prof.explore": "અન્વેષણ કરો", "prof.account": "એકાઉન્ટ",
  "prof.city": "શહેર", "prof.language": "ભાષા", "prof.phone": "ફોન", "prof.chooseLanguage": "ભાષા પસંદ કરો",
  "menu.missing": "ગુમ વ્યક્તિઓ", "menu.blood": "રક્તદાન", "menu.disaster": "આપત્તિ મોડ", "menu.campaigns": "ઝુંબેશ",
  "menu.events": "કાર્યક્રમો", "menu.calendar": "કૅલેન્ડર", "menu.gallery": "ગૅલેરી", "menu.notifications": "સૂચનાઓ",
  "menu.assistant": "રેસ્ક્યૂ સહાયક",
  "comm.highlights": "મુખ્ય અંશો", "comm.groups": "તમારી નજીકના જૂથો", "comm.noGroups": "હજી કોઈ જૂથ નથી",
  "comm.join": "જોડાઓ", "comm.joined": "જોડાયા",
  "search.placeholder": "લોકો, સેવાઓ, મદદ શોધો…", "search.recent": "તાજેતરના અહેવાલો", "search.noMatches": "કોઈ મેળ નથી",
};

const pa: Partial<Dict> = {
  "tab.home": "ਹੋਮ", "tab.search": "ਖੋਜ", "tab.sos": "SOS", "tab.community": "ਭਾਈਚਾਰਾ", "tab.profile": "ਪ੍ਰੋਫਾਈਲ",
  "common.login": "ਲੌਗ ਇਨ", "common.logout": "ਲੌਗ ਆਊਟ", "common.seeAll": "ਸਭ ਵੇਖੋ", "common.goHome": "ਹੋਮ 'ਤੇ ਜਾਓ",
  "home.badge": "ਭਾਈਚਾਰਕ ਐਮਰਜੈਂਸੀ ਜਵਾਬ", "home.greeting": "ਨਮਸਕਾਰ, {name}", "home.greetingGuest": "ਨਮਸਕਾਰ 🙏",
  "home.heroSub": "ਪੂਰੇ ਭਾਰਤ ਵਿੱਚ ਮਿਲ ਕੇ ਰਿਪੋਰਟ ਕਰੋ, ਜਵਾਬ ਦਿਓ ਅਤੇ ਮਦਦ ਦਾ ਤਾਲਮੇਲ ਕਰੋ।",
  "home.emergencySos": "ਐਮਰਜੈਂਸੀ SOS", "home.services": "ਸੇਵਾਵਾਂ", "home.trending": "ਹੁਣ ਟ੍ਰੈਂਡਿੰਗ",
  "home.noEvents": "ਕੋਈ ਆਉਣ ਵਾਲਾ ਸਮਾਗਮ ਨਹੀਂ।", "home.latestCampaigns": "ਤਾਜ਼ਾ ਮੁਹਿੰਮਾਂ",
  "home.dangerNote": "ਤੁਰੰਤ ਖ਼ਤਰੇ ਵਿੱਚ ਹੋ? ਸਿੱਧਾ 112 'ਤੇ ਕਾਲ ਕਰੋ — ਇਹ ਐਪ ਸਰਕਾਰੀ ਸੇਵਾਵਾਂ ਦਾ ਪੂਰਕ ਹੈ।",
  "stats.services": "ਸੇਵਾਵਾਂ", "stats.response": "ਜਵਾਬ", "stats.missing": "ਲਾਪਤਾ", "stats.languages": "ਭਾਸ਼ਾਵਾਂ",
  "svc.missing": "ਲਾਪਤਾ", "svc.sos": "SOS", "svc.blood": "ਖੂਨ", "svc.disaster": "ਆਫ਼ਤ", "svc.campaigns": "ਮੁਹਿੰਮਾਂ",
  "svc.community": "ਭਾਈਚਾਰਾ", "svc.calendar": "ਕੈਲੰਡਰ", "svc.gallery": "ਗੈਲਰੀ",
  "sos.title": "ਐਮਰਜੈਂਸੀ SOS", "sos.tapTitle": "ਤੇਜ਼ ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ",
  "sos.tapSub": "ਆਪਣੇ ਭਰੋਸੇਯੋਗ ਸੰਪਰਕਾਂ ਅਤੇ ਨੇੜਲੇ ਵਲੰਟੀਅਰਾਂ ਨੂੰ ਆਪਣੇ ਲਾਈਵ ਟਿਕਾਣੇ ਨਾਲ ਸੁਚੇਤ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ।",
  "sos.sending": "ਭੇਜਿਆ ਜਾ ਰਿਹਾ…", "sos.sent": "ਭੇਜਿਆ ਗਿਆ", "sos.helplines": "ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ",
  "sos.disclaimer": "ਇਹ ਪਲੇਟਫਾਰਮ ਸਰਕਾਰੀ ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਦਾ ਪੂਰਕ ਹੈ, ਬਦਲ ਨਹੀਂ। ਤੁਰੰਤ ਖ਼ਤਰੇ ਵਿੱਚ ਹੋ ਤਾਂ ਸਿੱਧਾ 112 'ਤੇ ਕਾਲ ਕਰੋ।",
  "hl.emergency": "ਐਮਰਜੈਂਸੀ", "hl.ambulance": "ਐਂਬੂਲੈਂਸ", "hl.fire": "ਅੱਗ", "hl.police": "ਪੁਲਿਸ",
  "hl.child": "ਬਾਲ", "hl.women": "ਮਹਿਲਾ", "hl.disaster": "ਆਫ਼ਤ", "hl.road": "ਸੜਕ",
  "prof.welcome": "ਰੈਸਕਿਊ ਭਾਰਤ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ", "prof.explore": "ਖੋਜੋ", "prof.account": "ਖਾਤਾ",
  "prof.city": "ਸ਼ਹਿਰ", "prof.language": "ਭਾਸ਼ਾ", "prof.phone": "ਫ਼ੋਨ", "prof.chooseLanguage": "ਭਾਸ਼ਾ ਚੁਣੋ",
  "menu.missing": "ਲਾਪਤਾ ਵਿਅਕਤੀ", "menu.blood": "ਖੂਨਦਾਨ", "menu.disaster": "ਆਫ਼ਤ ਮੋਡ", "menu.campaigns": "ਮੁਹਿੰਮਾਂ",
  "menu.events": "ਸਮਾਗਮ", "menu.calendar": "ਕੈਲੰਡਰ", "menu.gallery": "ਗੈਲਰੀ", "menu.notifications": "ਸੂਚਨਾਵਾਂ",
  "menu.assistant": "ਰੈਸਕਿਊ ਸਹਾਇਕ",
  "comm.highlights": "ਖਾਸ", "comm.groups": "ਤੁਹਾਡੇ ਨੇੜੇ ਸਮੂਹ", "comm.noGroups": "ਹਾਲੇ ਕੋਈ ਸਮੂਹ ਨਹੀਂ",
  "comm.join": "ਸ਼ਾਮਲ ਹੋਵੋ", "comm.joined": "ਸ਼ਾਮਲ ਹੋਏ",
  "search.placeholder": "ਲੋਕ, ਸੇਵਾਵਾਂ, ਮਦਦ ਖੋਜੋ…", "search.recent": "ਹਾਲੀਆ ਰਿਪੋਰਟਾਂ", "search.noMatches": "ਕੋਈ ਮੇਲ ਨਹੀਂ",
};

// Secondary-screen strings (lists, forms, actions) — merged into the base dicts.
const MORE: Record<LanguageCode, Partial<Dict>> = {
  en: {},
  hi: {
    "act.report": "किसी लापता व्यक्ति की रिपोर्ट करें", "act.raiseBlood": "रक्त अनुरोध करें", "act.sharePhoto": "फ़ोटो साझा करें",
    "act.canDonate": "मैं दान कर सकता हूँ", "act.responded": "आपने जवाब दिया", "act.rsvp": "आरएसवीपी", "act.going": "जा रहे हैं", "act.markAll": "सभी पढ़े चिह्नित करें",
    "list.noReports": "कोई रिपोर्ट नहीं", "list.noBlood": "कोई खुला अनुरोध नहीं", "list.noDisaster": "कोई सक्रिय अलर्ट नहीं", "list.noCampaigns": "कोई अभियान नहीं",
    "list.noEvents": "कोई आगामी कार्यक्रम नहीं", "list.noImages": "अभी कोई छवि नहीं", "list.noHolidays": "इस महीने कोई अवकाश नहीं", "list.caughtUp": "आप सब देख चुके हैं",
    "form.name": "पूरा नाम", "form.email": "ईमेल", "form.phone": "फ़ोन", "form.city": "शहर", "form.password": "पासवर्ड",
    "form.registerTitle": "अपना खाता बनाएं", "form.reportTitle": "किसी लापता व्यक्ति की रिपोर्ट करें", "form.bloodTitle": "रक्त अनुरोध करें", "form.galleryTitle": "फ़ोटो साझा करें",
  },
  ta: {
    "act.report": "காணாமல் போன ஒருவரைப் புகாரளிக்க", "act.raiseBlood": "இரத்த கோரிக்கை", "act.sharePhoto": "படத்தைப் பகிர்",
    "act.canDonate": "நான் தானம் செய்யலாம்", "act.responded": "நீங்கள் பதிலளித்தீர்கள்", "act.rsvp": "பங்கேற்பு", "act.going": "வருகிறேன்", "act.markAll": "அனைத்தையும் படித்ததாகக் குறி",
    "list.noReports": "அறிக்கைகள் இல்லை", "list.noBlood": "திறந்த கோரிக்கைகள் இல்லை", "list.noDisaster": "செயலில் எச்சரிக்கைகள் இல்லை", "list.noCampaigns": "பிரச்சாரங்கள் இல்லை",
    "list.noEvents": "வரவிருக்கும் நிகழ்வுகள் இல்லை", "list.noImages": "படங்கள் இல்லை", "list.noHolidays": "இந்த மாதம் விடுமுறை இல்லை", "list.caughtUp": "எல்லாம் பார்த்துவிட்டீர்கள்",
    "form.name": "முழு பெயர்", "form.email": "மின்னஞ்சல்", "form.phone": "தொலைபேசி", "form.city": "நகரம்", "form.password": "கடவுச்சொல்",
    "form.registerTitle": "உங்கள் கணக்கை உருவாக்கவும்", "form.reportTitle": "காணாமல் போன ஒருவரைப் புகாரளிக்க", "form.bloodTitle": "இரத்த கோரிக்கை", "form.galleryTitle": "படத்தைப் பகிர்",
  },
  te: {
    "act.report": "తప్పిపోయిన వ్యక్తిని నివేదించండి", "act.raiseBlood": "రక్త అభ్యర్థన చేయండి", "act.sharePhoto": "ఫోటోను షేర్ చేయండి",
    "act.canDonate": "నేను దానం చేయగలను", "act.responded": "మీరు స్పందించారు", "act.rsvp": "RSVP", "act.going": "వెళ్తున్నాను", "act.markAll": "అన్నీ చదివినట్లు గుర్తించు",
    "list.noReports": "నివేదికలు లేవు", "list.noBlood": "తెరిచిన అభ్యర్థనలు లేవు", "list.noDisaster": "క్రియాశీల హెచ్చరికలు లేవు", "list.noCampaigns": "ప్రచారాలు లేవు",
    "list.noEvents": "రాబోయే కార్యక్రమాలు లేవు", "list.noImages": "చిత్రాలు లేవు", "list.noHolidays": "ఈ నెలలో సెలవులు లేవు", "list.caughtUp": "అన్నీ చూశారు",
    "form.name": "పూర్తి పేరు", "form.email": "ఇమెయిల్", "form.phone": "ఫోన్", "form.city": "నగరం", "form.password": "పాస్‌వర్డ్",
    "form.registerTitle": "మీ ఖాతాను సృష్టించండి", "form.reportTitle": "తప్పిపోయిన వ్యక్తిని నివేదించండి", "form.bloodTitle": "రక్త అభ్యర్థన చేయండి", "form.galleryTitle": "ఫోటోను షేర్ చేయండి",
  },
  kn: {
    "act.report": "ಕಾಣೆಯಾದ ವ್ಯಕ್ತಿಯನ್ನು ವರದಿ ಮಾಡಿ", "act.raiseBlood": "ರಕ್ತ ವಿನಂತಿ ಮಾಡಿ", "act.sharePhoto": "ಫೋಟೋ ಹಂಚಿಕೊಳ್ಳಿ",
    "act.canDonate": "ನಾನು ದಾನ ಮಾಡಬಲ್ಲೆ", "act.responded": "ನೀವು ಸ್ಪಂದಿಸಿದ್ದೀರಿ", "act.rsvp": "RSVP", "act.going": "ಹೋಗುತ್ತಿದ್ದೇನೆ", "act.markAll": "ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ",
    "list.noReports": "ವರದಿಗಳಿಲ್ಲ", "list.noBlood": "ತೆರೆದ ವಿನಂತಿಗಳಿಲ್ಲ", "list.noDisaster": "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ", "list.noCampaigns": "ಅಭಿಯಾನಗಳಿಲ್ಲ",
    "list.noEvents": "ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮಗಳಿಲ್ಲ", "list.noImages": "ಚಿತ್ರಗಳಿಲ್ಲ", "list.noHolidays": "ಈ ತಿಂಗಳು ರಜೆಗಳಿಲ್ಲ", "list.caughtUp": "ಎಲ್ಲವನ್ನೂ ನೋಡಿದ್ದೀರಿ",
    "form.name": "ಪೂರ್ಣ ಹೆಸರು", "form.email": "ಇಮೇಲ್", "form.phone": "ಫೋನ್", "form.city": "ನಗರ", "form.password": "ಪಾಸ್‌ವರ್ಡ್",
    "form.registerTitle": "ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ", "form.reportTitle": "ಕಾಣೆಯಾದ ವ್ಯಕ್ತಿಯನ್ನು ವರದಿ ಮಾಡಿ", "form.bloodTitle": "ರಕ್ತ ವಿನಂತಿ ಮಾಡಿ", "form.galleryTitle": "ಫೋಟೋ ಹಂಚಿಕೊಳ್ಳಿ",
  },
  ml: {
    "act.report": "കാണാതായ ഒരാളെ റിപ്പോർട്ട് ചെയ്യുക", "act.raiseBlood": "രക്ത അഭ്യർത്ഥന നടത്തുക", "act.sharePhoto": "ഫോട്ടോ പങ്കിടുക",
    "act.canDonate": "എനിക്ക് ദാനം ചെയ്യാം", "act.responded": "നിങ്ങൾ പ്രതികരിച്ചു", "act.rsvp": "RSVP", "act.going": "പോകുന്നു", "act.markAll": "എല്ലാം വായിച്ചതായി അടയാളപ്പെടുത്തുക",
    "list.noReports": "റിപ്പോർട്ടുകളില്ല", "list.noBlood": "തുറന്ന അഭ്യർത്ഥനകളില്ല", "list.noDisaster": "സജീവ അലേർട്ടുകളില്ല", "list.noCampaigns": "കാമ്പെയ്‌നുകളില്ല",
    "list.noEvents": "വരാനിരിക്കുന്ന പരിപാടികളില്ല", "list.noImages": "ചിത്രങ്ങളില്ല", "list.noHolidays": "ഈ മാസം അവധികളില്ല", "list.caughtUp": "എല്ലാം കണ്ടു കഴിഞ്ഞു",
    "form.name": "പൂർണ്ണ പേര്", "form.email": "ഇമെയിൽ", "form.phone": "ഫോൺ", "form.city": "നഗരം", "form.password": "പാസ്‌വേഡ്",
    "form.registerTitle": "നിങ്ങളുടെ അക്കൗണ്ട് സൃഷ്ടിക്കുക", "form.reportTitle": "കാണാതായ ഒരാളെ റിപ്പോർട്ട് ചെയ്യുക", "form.bloodTitle": "രക്ത അഭ്യർത്ഥന നടത്തുക", "form.galleryTitle": "ഫോട്ടോ പങ്കിടുക",
  },
  mr: {
    "act.report": "बेपत्ता व्यक्तीची नोंद करा", "act.raiseBlood": "रक्त विनंती करा", "act.sharePhoto": "फोटो शेअर करा",
    "act.canDonate": "मी दान करू शकतो", "act.responded": "तुम्ही प्रतिसाद दिला", "act.rsvp": "आरएसव्हीपी", "act.going": "जात आहे", "act.markAll": "सर्व वाचले म्हणून चिन्हांकित करा",
    "list.noReports": "अहवाल नाहीत", "list.noBlood": "खुल्या विनंत्या नाहीत", "list.noDisaster": "सक्रिय अलर्ट नाहीत", "list.noCampaigns": "मोहिमा नाहीत",
    "list.noEvents": "आगामी कार्यक्रम नाहीत", "list.noImages": "प्रतिमा नाहीत", "list.noHolidays": "या महिन्यात सुट्टी नाही", "list.caughtUp": "सर्व पाहून झाले",
    "form.name": "पूर्ण नाव", "form.email": "ईमेल", "form.phone": "फोन", "form.city": "शहर", "form.password": "पासवर्ड",
    "form.registerTitle": "तुमचे खाते तयार करा", "form.reportTitle": "बेपत्ता व्यक्तीची नोंद करा", "form.bloodTitle": "रक्त विनंती करा", "form.galleryTitle": "फोटो शेअर करा",
  },
  bn: {
    "act.report": "একজন নিখোঁজ ব্যক্তির রিপোর্ট করুন", "act.raiseBlood": "রক্তের অনুরোধ করুন", "act.sharePhoto": "ছবি শেয়ার করুন",
    "act.canDonate": "আমি দান করতে পারি", "act.responded": "আপনি সাড়া দিয়েছেন", "act.rsvp": "আরএসভিপি", "act.going": "যাচ্ছি", "act.markAll": "সব পঠিত হিসেবে চিহ্নিত করুন",
    "list.noReports": "কোনো রিপোর্ট নেই", "list.noBlood": "খোলা অনুরোধ নেই", "list.noDisaster": "সক্রিয় সতর্কতা নেই", "list.noCampaigns": "কোনো প্রচারাভিযান নেই",
    "list.noEvents": "আসন্ন কোনো অনুষ্ঠান নেই", "list.noImages": "কোনো ছবি নেই", "list.noHolidays": "এই মাসে কোনো ছুটি নেই", "list.caughtUp": "সব দেখা হয়ে গেছে",
    "form.name": "পুরো নাম", "form.email": "ইমেল", "form.phone": "ফোন", "form.city": "শহর", "form.password": "পাসওয়ার্ড",
    "form.registerTitle": "আপনার অ্যাকাউন্ট তৈরি করুন", "form.reportTitle": "একজন নিখোঁজ ব্যক্তির রিপোর্ট করুন", "form.bloodTitle": "রক্তের অনুরোধ করুন", "form.galleryTitle": "ছবি শেয়ার করুন",
  },
  gu: {
    "act.report": "ગુમ થયેલ વ્યક્તિની જાણ કરો", "act.raiseBlood": "રક્ત વિનંતી કરો", "act.sharePhoto": "ફોટો શેર કરો",
    "act.canDonate": "હું દાન કરી શકું છું", "act.responded": "તમે પ્રતિસાદ આપ્યો", "act.rsvp": "આરએસવીપી", "act.going": "જઈ રહ્યો છું", "act.markAll": "બધા વાંચ્યા તરીકે ચિહ્નિત કરો",
    "list.noReports": "કોઈ અહેવાલ નથી", "list.noBlood": "ખુલ્લી વિનંતીઓ નથી", "list.noDisaster": "સક્રિય ચેતવણીઓ નથી", "list.noCampaigns": "કોઈ ઝુંબેશ નથી",
    "list.noEvents": "આગામી કોઈ કાર્યક્રમ નથી", "list.noImages": "કોઈ છબી નથી", "list.noHolidays": "આ મહિને કોઈ રજા નથી", "list.caughtUp": "બધું જોઈ લીધું",
    "form.name": "પૂરું નામ", "form.email": "ઇમેઇલ", "form.phone": "ફોન", "form.city": "શહેર", "form.password": "પાસવર્ડ",
    "form.registerTitle": "તમારું એકાઉન્ટ બનાવો", "form.reportTitle": "ગુમ થયેલ વ્યક્તિની જાણ કરો", "form.bloodTitle": "રક્ત વિનંતી કરો", "form.galleryTitle": "ફોટો શેર કરો",
  },
  pa: {
    "act.report": "ਕਿਸੇ ਲਾਪਤਾ ਵਿਅਕਤੀ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", "act.raiseBlood": "ਖੂਨ ਦੀ ਬੇਨਤੀ ਕਰੋ", "act.sharePhoto": "ਫੋਟੋ ਸਾਂਝੀ ਕਰੋ",
    "act.canDonate": "ਮੈਂ ਦਾਨ ਕਰ ਸਕਦਾ ਹਾਂ", "act.responded": "ਤੁਸੀਂ ਜਵਾਬ ਦਿੱਤਾ", "act.rsvp": "ਆਰਐਸਵੀਪੀ", "act.going": "ਜਾ ਰਿਹਾ ਹਾਂ", "act.markAll": "ਸਭ ਪੜ੍ਹੇ ਵਜੋਂ ਨਿਸ਼ਾਨ ਲਗਾਓ",
    "list.noReports": "ਕੋਈ ਰਿਪੋਰਟ ਨਹੀਂ", "list.noBlood": "ਕੋਈ ਖੁੱਲ੍ਹੀ ਬੇਨਤੀ ਨਹੀਂ", "list.noDisaster": "ਕੋਈ ਸਰਗਰਮ ਚੇਤਾਵਨੀ ਨਹੀਂ", "list.noCampaigns": "ਕੋਈ ਮੁਹਿੰਮ ਨਹੀਂ",
    "list.noEvents": "ਕੋਈ ਆਉਣ ਵਾਲਾ ਸਮਾਗਮ ਨਹੀਂ", "list.noImages": "ਕੋਈ ਤਸਵੀਰ ਨਹੀਂ", "list.noHolidays": "ਇਸ ਮਹੀਨੇ ਕੋਈ ਛੁੱਟੀ ਨਹੀਂ", "list.caughtUp": "ਸਭ ਵੇਖ ਲਿਆ",
    "form.name": "ਪੂਰਾ ਨਾਮ", "form.email": "ਈਮੇਲ", "form.phone": "ਫ਼ੋਨ", "form.city": "ਸ਼ਹਿਰ", "form.password": "ਪਾਸਵਰਡ",
    "form.registerTitle": "ਆਪਣਾ ਖਾਤਾ ਬਣਾਓ", "form.reportTitle": "ਕਿਸੇ ਲਾਪਤਾ ਵਿਅਕਤੀ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", "form.bloodTitle": "ਖੂਨ ਦੀ ਬੇਨਤੀ ਕਰੋ", "form.galleryTitle": "ਫੋਟੋ ਸਾਂਝੀ ਕਰੋ",
  },
};

const BASE: Record<LanguageCode, Partial<Dict>> = { en, hi, ta, te, kn, ml, mr, bn, gu, pa };
const DICTS = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.code, { ...BASE[l.code], ...MORE[l.code] }]),
) as Record<LanguageCode, Partial<Dict>>;

const STORAGE_KEY = "resq.lang";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TKey, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((v) => {
        if (v && v in DICTS) setLanguageState(v as LanguageCode);
      })
      .catch(() => {});
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    SecureStore.setItemAsync(STORAGE_KEY, lang).catch(() => {});
  }, []);

  const t = useCallback(
    (key: TKey, params?: Record<string, string>) => {
      let str = DICTS[language][key] ?? en[key];
      if (params) for (const [k, val] of Object.entries(params)) str = str.replace(`{${k}}`, val);
      return str;
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useT(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useT must be used within a LanguageProvider");
  return ctx;
}
