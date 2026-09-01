/** 2026 national holidays, festivals and health/awareness observances — mirrors
 * the web calendar. `category` drives the accent colour in the UI. */
export type HolidayCategory = "national" | "festival" | "health" | "awareness";

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  category: HolidayCategory;
}

export const HOLIDAYS_2026: Holiday[] = [
  { date: "2026-01-12", name: "National Youth Day", category: "national" },
  { date: "2026-01-14", name: "Makar Sankranti / Pongal", category: "festival" },
  { date: "2026-01-26", name: "Republic Day", category: "national" },
  { date: "2026-03-04", name: "Holi", category: "festival" },
  { date: "2026-03-08", name: "International Women's Day", category: "awareness" },
  { date: "2026-04-07", name: "World Health Day", category: "health" },
  { date: "2026-04-14", name: "Ambedkar Jayanti", category: "national" },
  { date: "2026-05-01", name: "Labour Day", category: "awareness" },
  { date: "2026-05-08", name: "World Red Cross Day", category: "health" },
  { date: "2026-06-14", name: "World Blood Donor Day", category: "health" },
  { date: "2026-06-21", name: "International Yoga Day", category: "health" },
  { date: "2026-07-01", name: "National Doctors' Day", category: "health" },
  { date: "2026-08-15", name: "Independence Day", category: "national" },
  { date: "2026-08-19", name: "World Humanitarian Day", category: "awareness" },
  { date: "2026-09-14", name: "Ganesh Chaturthi", category: "festival" },
  { date: "2026-10-02", name: "Gandhi Jayanti", category: "national" },
  { date: "2026-10-13", name: "Disaster Reduction Day", category: "awareness" },
  { date: "2026-11-08", name: "Diwali", category: "festival" },
  { date: "2026-11-14", name: "Children's Day", category: "national" },
  { date: "2026-11-26", name: "Constitution Day", category: "national" },
  { date: "2026-12-01", name: "World AIDS Day", category: "health" },
  { date: "2026-12-25", name: "Christmas", category: "festival" },
];

export function holidaysInMonth(year: number, month: number): Holiday[] {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  return HOLIDAYS_2026.filter((h) => h.date.startsWith(prefix));
}
