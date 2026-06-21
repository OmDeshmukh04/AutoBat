import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DetailHeader } from "./mobile-ui";
import { colors } from "./theme";

export function Screen({
  title,
  subtitle,
  children,
  footer,
  onBack
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <DetailHeader title={title} {...(onBack ? { onBack } : {})} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
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
  maxLength,
  hint,
  multiline = false
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
  autoCapitalize?: "none" | "characters" | "words";
  maxLength?: number;
  hint?: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        style={[styles.input, multiline && styles.inputMultiline]}
        textAlignVertical={multiline ? "top" : "center"}
        value={value}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  busy,
  onPress,
  disabled = false,
  icon
}: {
  label: string;
  busy?: boolean;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const unavailable = Boolean(busy || disabled);
  return (
    <Pressable
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        unavailable && styles.buttonDisabled,
        pressed && !unavailable && styles.buttonPressed
      ]}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {icon}
          <Text style={styles.buttonText}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Banner({
  kind,
  children
}: {
  kind: "ok" | "bad" | "warn";
  children: ReactNode;
}) {
  const tone = {
    ok: {
      backgroundColor: colors.okBg,
      borderColor: "#B9DEC7",
      color: colors.ok
    },
    bad: {
      backgroundColor: colors.badBg,
      borderColor: "#F0BEC1",
      color: colors.bad
    },
    warn: {
      backgroundColor: colors.warnBg,
      borderColor: "#F0D0B2",
      color: colors.warn
    }
  }[kind];

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }
      ]}
    >
      <Text style={[styles.bannerText, { color: tone.color }]}>{children}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  description,
  icon
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <View style={styles.emptyState}>
      {icon}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

export const screenStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  rowMeta: {
    color: colors.inkSoft,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 6,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: "800"
  },
  sectionLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 9,
    marginTop: 18
  }
});

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1
  },
  content: {
    backgroundColor: colors.bg,
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32
  },
  subtitle: {
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    padding: 12
  },
  field: {
    marginTop: 14
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.lineStrong,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 14
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: 13
  },
  hint: {
    color: colors.inkFaint,
    fontSize: 11,
    marginTop: 5
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 8,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 18
  },
  buttonPressed: {
    opacity: 0.88
  },
  buttonDisabled: {
    backgroundColor: "#A9A9A4"
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800"
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.lineStrong,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16
  },
  secondaryButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700"
  },
  banner: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12
  },
  bannerText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 28,
    paddingVertical: 38
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12
  },
  emptyDescription: {
    color: colors.inkSoft,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 5,
    textAlign: "center"
  }
});
