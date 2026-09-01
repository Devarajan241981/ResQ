import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card, EmptyState, Muted, RESQ, ScreenScroll } from "@/components/ui";
import { holidaysInMonth, type HolidayCategory } from "@/lib/holidays";
import { useT } from "@/lib/i18n";
import { usePalette } from "@/lib/use-theme";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const CAT_COLOR: Record<HolidayCategory, string> = {
  national: RESQ.navy,
  festival: RESQ.saffron,
  health: RESQ.red,
  awareness: RESQ.green,
};

export default function CalendarScreen() {
  const p = usePalette();
  const { t } = useT();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const holidays = holidaysInMonth(year, month);

  function shift(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  return (
    <ScreenScroll>
      <Card style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable onPress={() => shift(-1)} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={p.text} />
        </Pressable>
        <Text style={{ color: p.text, fontSize: 18, fontWeight: "800" }}>
          {MONTHS[month]} {year}
        </Text>
        <Pressable onPress={() => shift(1)} hitSlop={10}>
          <Ionicons name="chevron-forward" size={22} color={p.text} />
        </Pressable>
      </Card>

      {holidays.length === 0 ? (
        <EmptyState icon="calendar-outline" title={t("list.noHolidays")} />
      ) : (
        holidays.map((h) => {
          const day = Number(h.date.slice(8, 10));
          const color = CAT_COLOR[h.category];
          return (
            <Card key={h.date} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={[styles.day, { backgroundColor: `${color}1F` }]}>
                <Text style={{ color, fontWeight: "900", fontSize: 18 }}>{day}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: p.text, fontWeight: "700" }}>{h.name}</Text>
                <Muted>{h.category}</Muted>
              </View>
              <View style={[styles.dot, { backgroundColor: color }]} />
            </Card>
          );
        })
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  day: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
