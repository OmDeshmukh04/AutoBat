import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { api } from "../src/api";
import { useAuthStore } from "../src/auth-store";
import { colors } from "../src/theme";

export default function LoginScreen() {
  const setSession = useAuthStore((s) => s.setSession);
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("9000000003");
  const [code, setCode] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await api.requestOtp(mobile);
      setHint(res.devCode ? `Demo code: ${res.devCode}` : null);
      setStep("otp");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setError(null);
    setBusy(true);
    try {
      const { token, user } = await api.verifyOtp(mobile, code);
      await setSession(token, user);
      // Root layout effect redirects to "/" once token is set.
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>AB</Text>
            </View>
            <View>
              <Text style={styles.brandName}>AUTOBAT</Text>
              <Text style={styles.brandSub}>Partner App</Text>
            </View>
          </View>

          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>
            Log in with your registered mobile number.
          </Text>

          {step === "mobile" ? (
            <>
              <Text style={styles.label}>Mobile number</Text>
              <TextInput
                value={mobile}
                onChangeText={setMobile}
                keyboardType="number-pad"
                placeholder="10-digit mobile"
                placeholderTextColor={colors.inkFaint}
                style={styles.input}
                maxLength={10}
              />
              <PrimaryButton label="Send OTP" busy={busy} onPress={sendOtp} />
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter OTP</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholder="6-digit code"
                placeholderTextColor={colors.inkFaint}
                style={styles.input}
                maxLength={6}
                autoFocus
              />
              {hint ? <Text style={styles.hint}>{hint}</Text> : null}
              <PrimaryButton label="Verify & sign in" busy={busy} onPress={verify} />
              <Pressable onPress={() => setStep("mobile")}>
                <Text style={styles.linkBtn}>Change number</Text>
              </Pressable>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PrimaryButton({
  label,
  busy,
  onPress
}: {
  label: string;
  busy: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.button, busy && styles.buttonDisabled]}
      onPress={onPress}
      disabled={busy}
    >
      {busy ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 28, gap: 6 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 28 },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center"
  },
  brandMarkText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  brandName: { fontSize: 16, fontWeight: "800", letterSpacing: 0.6, color: colors.ink },
  brandSub: { fontSize: 12, color: colors.inkFaint },
  title: { fontSize: 26, fontWeight: "800", color: colors.ink },
  subtitle: { fontSize: 14, color: colors.inkSoft, marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "700", color: colors.inkSoft, marginBottom: 7, marginTop: 6 },
  input: {
    minHeight: 52,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink
  },
  hint: {
    marginTop: 10,
    fontSize: 13,
    color: colors.ok,
    backgroundColor: colors.okBg,
    padding: 9,
    borderRadius: 8,
    overflow: "hidden"
  },
  button: {
    minHeight: 52,
    backgroundColor: colors.brand,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  linkBtn: { textAlign: "center", color: colors.inkSoft, marginTop: 14, fontSize: 14 },
  error: { color: colors.bad, fontSize: 14, fontWeight: "600", marginTop: 16 }
});
