import { HolidayCalendar } from "@/components/calendar/holiday-calendar";

export default function CalendarPage() {
  return (
    <div className="mx-auto w-full max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
      <HolidayCalendar />
    </div>
  );
}
