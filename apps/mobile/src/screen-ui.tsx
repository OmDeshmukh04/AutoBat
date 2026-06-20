import { ReactNode } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { colors } from "./theme";

export function Screen({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  maxLength
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
  autoCapitalize?: "none" | "characters";
  maxLength?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        style={styles.input}
      />
    </View>
  );
}

export function PrimaryButton({
  label,
  busy,
  onPress
}: {
  label: string;
  busy?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.button, busy && styles.buttonDisabled]}
      onPress={onPress}
      disabled={busy}
    >
      {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

export function Banner({ kind, children }: { kind: "ok" | "bad"; children: ReactNode }) {
  return (
    <View style={[styles.banner, kind === "ok" ? styles.bannerOk : styles.bannerBad]}>
      <Text style={[styles.bannerText, kind === "ok" ? styles.bannerTextOk : styles.bannerTextBad]}>
        {children}
      </Text>
    </View>
  );
}

export const screenStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10
  },
  rowTitle: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  rowMeta: { color: colors.inkSoft, fontSize: 13, marginTop: 3 },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8
  },
  pillText: { fontSize: 11.5, fontWeight: "700" }
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 22, paddingBottom: 48 },
  back: { marginBottom: 8 },
  backText: { color: colors.inkSoft, fontSize: 15, fontWeight: "600" },
  title: { color: colors.ink, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: 6, marginBottom: 16, lineHeight: 20 },
  field: { marginTop: 14 },
  label: { color: colors.inkSoft, fontSize: 13, fontWeight: "700", marginBottom: 7 },
  input: {
    minHeight: 50,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink
  },
  button: {
    minHeight: 52,
    backgroundColor: colors.brand,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  banner: { borderRadius: 10, padding: 12, marginTop: 16 },
  bannerOk: { backgroundColor: colors.okBg, borderColor: "#abefc6", borderWidth: 1 },
  bannerBad: { backgroundColor: colors.badBg, borderColor: "#fecaca", borderWidth: 1 },
  bannerText: { fontSize: 14, fontWeight: "600" },
  bannerTextOk: { color: colors.ok },
  bannerTextBad: { color: colors.bad }
});
