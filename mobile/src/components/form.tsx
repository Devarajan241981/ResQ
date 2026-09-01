import { Pressable, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";
import { RESQ } from "@/lib/theme";
import { usePalette } from "@/lib/use-theme";

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  multiline,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words";
}) {
  const p = usePalette();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: p.text, fontWeight: "600", fontSize: 13 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={p.textMuted}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          { color: p.text, backgroundColor: p.surface, borderColor: p.border },
          multiline && { height: 90, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const p = usePalette();
  return (
    <View style={{ gap: 6 }}>
      {label && <Text style={{ color: p.text, fontWeight: "600", fontSize: 13 }}>{label}</Text>}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              style={[
                styles.seg,
                active
                  ? { backgroundColor: RESQ.navy, borderColor: RESQ.navy }
                  : { backgroundColor: p.surface, borderColor: p.border },
              ]}
            >
              <Text style={{ color: active ? "#fff" : p.text, fontWeight: "600", fontSize: 13 }}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 },
  seg: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
});
