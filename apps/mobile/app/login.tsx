import { useState } from "react";
import {
  Headphones,
  LockKeyhole,
  ShieldCheck,
  Smartphone
} from "lucide-react-native";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../src/api";
import { useAuthStore } from "../src/auth-store";
import { BrandWordmark } from "../src/mobile-ui";
import { colors } from "../src/theme";

export default function LoginScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("9000000003");
  const [code, setCode] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    try {
      const result = await api.requestOtp(mobile);
      setHint(result.devCode ? `Demo OTP: ${result.devCode}` : null);
      setStep("otp");
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setError(null);
    if (code.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setBusy(true);
    try {
      const { token, user } = await api.verifyOtp(mobile, code);
      await setSession(token, user);
    } catch (verifyError) {
      setError((verifyError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <View style={styles.brandArea}>
            <BrandWordmark />
          </View>

          <View style={styles.formArea}>
            <Text style={styles.title}>
              {step === "mobile" ? "Welcome back" : "Verify your number"}
            </Text>
            <Text style={styles.subtitle}>
              {step === "mobile"
                ? "Sign in with your registered mobile number"
                : `Enter the OTP sent to +91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`}
            </Text>

            {step === "mobile" ? (
              <>
                <Text style={styles.label}>Mobile number</Text>
                <View style={styles.phoneField}>
                  <Smartphone
                    color={colors.inkSoft}
                    size={20}
                    strokeWidth={1.8}
                  />
                  <Text style={styles.countryCode}>+91</Text>
                  <View style={styles.fieldDivider} />
                  <TextInput
                    keyboardType="number-pad"
                    maxLength={10}
                    onChangeText={setMobile}
                    placeholder="Registered mobile"
                    placeholderTextColor={colors.inkFaint}
                    style={styles.phoneInput}
                    value={mobile}
                  />
                </View>
                <LoginButton
                  busy={busy}
                  label="Send OTP"
                  onPress={sendOtp}
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>One-time password</Text>
                <View style={styles.phoneField}>
                  <LockKeyhole
                    color={colors.inkSoft}
                    size={20}
                    strokeWidth={1.8}
                  />
                  <TextInput
                    autoFocus
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={setCode}
                    placeholder="6-digit OTP"
                    placeholderTextColor={colors.inkFaint}
                    style={styles.phoneInput}
                    value={code}
                  />
                </View>
                {hint ? (
                  <View style={styles.demoHint}>
                    <Text style={styles.demoHintText}>{hint}</Text>
                  </View>
                ) : null}
                <LoginButton
                  busy={busy}
                  label="Verify and sign in"
                  onPress={verify}
                />
                <Pressable
                  onPress={() => {
                    setCode("");
                    setError(null);
                    setStep("mobile");
                  }}
                  style={styles.changeNumber}
                >
                  <Text style={styles.changeNumberText}>Change mobile number</Text>
                </Pressable>
              </>
            )}

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.securityNote}>
              <ShieldCheck color={colors.ok} size={19} strokeWidth={2} />
              <Text style={styles.securityText}>
                Secure access for authorized AutoBat partners
              </Text>
            </View>
          </View>

          <Pressable style={styles.supportRow}>
            <Headphones color={colors.inkSoft} size={18} strokeWidth={1.8} />
            <Text style={styles.supportText}>Need help? Contact support</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LoginButton({
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
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        busy && styles.buttonDisabled,
        pressed && !busy && styles.buttonPressed
      ]}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1
  },
  flex: {
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 26,
    paddingVertical: 24
  },
  brandArea: {
    alignItems: "center",
    paddingTop: 28
  },
  formArea: {
    marginBottom: 24
  },
  title: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 24
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8
  },
  phoneField: {
    alignItems: "center",
    borderColor: colors.lineStrong,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 14
  },
  countryCode: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 9
  },
  fieldDivider: {
    backgroundColor: colors.line,
    height: 26,
    marginHorizontal: 11,
    width: 1
  },
  phoneInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 10
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 54
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonPressed: {
    opacity: 0.88
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800"
  },
  demoHint: {
    backgroundColor: colors.okBg,
    borderRadius: 8,
    marginTop: 10,
    padding: 10
  },
  demoHintText: {
    color: colors.ok,
    fontSize: 12.5,
    fontWeight: "700",
    textAlign: "center"
  },
  changeNumber: {
    alignItems: "center",
    marginTop: 16
  },
  changeNumberText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "700"
  },
  errorBanner: {
    backgroundColor: colors.badBg,
    borderColor: "#EFB9BC",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 11
  },
  errorText: {
    color: colors.bad,
    fontSize: 12.5,
    fontWeight: "600"
  },
  securityNote: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 22
  },
  securityText: {
    color: colors.inkSoft,
    fontSize: 11.5
  },
  supportRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingBottom: 8
  },
  supportText: {
    color: colors.inkSoft,
    fontSize: 12.5,
    fontWeight: "600"
  }
});
