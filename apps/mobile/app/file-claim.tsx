import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../src/api";
import { Banner, Field, PrimaryButton, Screen, screenStyles } from "../src/screen-ui";
import { colors } from "../src/theme";

// Common warranty failure reasons. Keeps claim reasons consistent for the
// service team while still allowing a free-text remark.
const REASONS = [
  "Battery not holding charge",
  "Swollen / bulging case",
  "Leakage",
  "Low cranking power",
  "Dead on arrival",
  "Other"
];

export default function FileClaimScreen() {
  const router = useRouter();
  const [serialNumber, setSerialNumber] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [reason, setReason] = useState(REASONS[0]!);
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setResult(null);
    if (!serialNumber.trim() || !customerMobile.trim()) {
      setError("Battery serial number and customer mobile are required.");
      return;
    }
    setBusy(true);
    try {
      const trimmedRemarks = remarks.trim();
      const res = await api.fileClaim({
        serialNumber: serialNumber.trim().toUpperCase(),
        customerMobile: customerMobile.trim(),
        reason,
        ...(trimmedRemarks ? { remarks: trimmedRemarks } : {})
      });
      setResult(
        `Claim ${res.reference} filed.${res.overSla ? " (Flagged: warranty already expired.)" : ""}`
      );
      setSerialNumber("");
      setCustomerMobile("");
      setRemarks("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      title="File a claim"
      subtitle="Raise a warranty claim for a battery you have sold."
    >
      <Field
        label="Battery serial number"
        value={serialNumber}
        onChangeText={setSerialNumber}
        placeholder="e.g. AB24-009184"
        autoCapitalize="characters"
      />
      <Field
        label="Customer mobile"
        value={customerMobile}
        onChangeText={setCustomerMobile}
        placeholder="10-digit mobile"
        keyboardType="number-pad"
        maxLength={10}
      />

      <View style={{ marginTop: 14 }}>
        <Text style={{ color: colors.inkSoft, fontSize: 13, fontWeight: "700", marginBottom: 8 }}>
          Reason
        </Text>
        {REASONS.map((r) => {
          const selected = r === reason;
          return (
            <Pressable
              key={r}
              onPress={() => setReason(r)}
              style={[
                screenStyles.card,
                { borderColor: selected ? colors.brand : colors.line, borderWidth: selected ? 2 : 1 }
              ]}
            >
              <Text style={screenStyles.rowTitle}>{r}</Text>
            </Pressable>
          );
        })}
      </View>

      <Field
        label="Remarks (optional)"
        value={remarks}
        onChangeText={setRemarks}
        placeholder="Anything the service team should know"
      />

      {error ? <Banner kind="bad">{error}</Banner> : null}
      {result ? <Banner kind="ok">{result}</Banner> : null}

      <PrimaryButton label="Submit claim" busy={busy} onPress={submit} />

      {result ? (
        <Pressable onPress={() => router.push("/claims" as never)} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.brand, fontWeight: "800", textAlign: "center" }}>
            View all claims →
          </Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}
