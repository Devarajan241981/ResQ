import type { CampaignCategory } from "@/lib/api/types";
import type { TranslationKey } from "@/lib/i18n/translations";

export const CATEGORY_LABEL_KEYS: Record<CampaignCategory, TranslationKey> = {
  awareness: "categories.awareness",
  hackathon: "categories.hackathon",
  cleanliness_drive: "categories.cleanlinessDrive",
  blood_camp: "categories.bloodCamp",
  plantation: "categories.plantation",
  relief_collection: "categories.reliefCollection",
  other: "categories.other",
};

export const CATEGORIES: CampaignCategory[] = [
  "awareness",
  "hackathon",
  "cleanliness_drive",
  "blood_camp",
  "plantation",
  "relief_collection",
  "other",
];
