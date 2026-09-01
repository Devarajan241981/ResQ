import type { TranslationKey } from "@/lib/i18n/translations";

export type HolidayCategory = "national" | "festival" | "health" | "awareness";

export interface Holiday {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  nameKey: TranslationKey;
  category: HolidayCategory;
  /** Lunar-calendar festivals shift with the moon; flag them so the UI can note it. */
  approximate?: boolean;
}

/**
 * 2026 national holidays, festivals, and the health / labour / awareness
 * observances that matter to an emergency-response platform. Lunar festival
 * dates are marked approximate. Kept sorted by date.
 */
export const HOLIDAYS_2026: Holiday[] = [
  { date: "2026-01-12", nameKey: "holiday.youthDay", category: "national" },
  { date: "2026-01-14", nameKey: "holiday.makarSankranti", category: "festival" },
  { date: "2026-01-15", nameKey: "holiday.armyDay", category: "national" },
  { date: "2026-01-26", nameKey: "holiday.republicDay", category: "national" },
  { date: "2026-01-30", nameKey: "holiday.martyrsDay", category: "national" },
  { date: "2026-03-04", nameKey: "holiday.holi", category: "festival", approximate: true },
  { date: "2026-03-08", nameKey: "holiday.womensDay", category: "awareness" },
  { date: "2026-03-21", nameKey: "holiday.eidUlFitr", category: "festival", approximate: true },
  { date: "2026-04-03", nameKey: "holiday.goodFriday", category: "festival" },
  { date: "2026-04-07", nameKey: "holiday.worldHealthDay", category: "health" },
  { date: "2026-04-14", nameKey: "holiday.ambedkarJayanti", category: "national" },
  { date: "2026-05-01", nameKey: "holiday.labourDay", category: "awareness" },
  { date: "2026-05-08", nameKey: "holiday.redCrossDay", category: "health" },
  { date: "2026-05-25", nameKey: "holiday.missingChildrenDay", category: "awareness" },
  { date: "2026-05-27", nameKey: "holiday.eidUlAdha", category: "festival", approximate: true },
  { date: "2026-06-05", nameKey: "holiday.environmentDay", category: "awareness" },
  { date: "2026-06-14", nameKey: "holiday.bloodDonorDay", category: "health" },
  { date: "2026-06-21", nameKey: "holiday.yogaDay", category: "health" },
  { date: "2026-07-01", nameKey: "holiday.doctorsDay", category: "health" },
  { date: "2026-08-15", nameKey: "holiday.independenceDay", category: "national" },
  { date: "2026-08-19", nameKey: "holiday.humanitarianDay", category: "awareness" },
  { date: "2026-08-28", nameKey: "holiday.rakshaBandhan", category: "festival", approximate: true },
  { date: "2026-09-04", nameKey: "holiday.janmashtami", category: "festival", approximate: true },
  { date: "2026-09-12", nameKey: "holiday.firstAidDay", category: "health", approximate: true },
  { date: "2026-09-14", nameKey: "holiday.ganeshChaturthi", category: "festival", approximate: true },
  { date: "2026-10-02", nameKey: "holiday.gandhiJayanti", category: "national" },
  { date: "2026-10-13", nameKey: "holiday.disasterReductionDay", category: "awareness" },
  { date: "2026-10-20", nameKey: "holiday.dussehra", category: "festival", approximate: true },
  { date: "2026-11-08", nameKey: "holiday.diwali", category: "festival", approximate: true },
  { date: "2026-11-14", nameKey: "holiday.childrensDay", category: "national" },
  { date: "2026-11-24", nameKey: "holiday.guruNanakJayanti", category: "festival", approximate: true },
  { date: "2026-11-26", nameKey: "holiday.constitutionDay", category: "national" },
  { date: "2026-12-01", nameKey: "holiday.worldAidsDay", category: "health" },
  { date: "2026-12-10", nameKey: "holiday.humanRightsDay", category: "awareness" },
  { date: "2026-12-25", nameKey: "holiday.christmas", category: "festival" },
];

export function holidaysInMonth(year: number, month: number): Holiday[] {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  return HOLIDAYS_2026.filter((h) => h.date.startsWith(prefix));
}
