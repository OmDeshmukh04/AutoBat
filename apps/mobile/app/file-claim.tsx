import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Battery,
  Camera,
  Check,
  CircleCheck,
  ClipboardPlus
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../src/api";
import {
  Banner,
  Field,
  PrimaryButton,
  Screen,
  SecondaryButton
} from "../src/screen-ui";
import { colors } from "../src/theme";

const REASONS = [
  "Battery not holding charge",
  "Swollen or bulging case",
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
    if (!serialNumber.trim()) {
      setError("Enter or scan the battery serial number.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(customerMobile)) {
      setError("Enter a valid 10-digit customer mobile number.");
      return;
    }
    setBusy(true);
    try {
      const trimmedRemarks = remarks.trim();
      const response = await api.fileClaim({
        serialNumber: serialNumber.trim().toUpperCase(),
        customerMobile: customerMobile.trim(),
        reason,
        ...(trimmedRemarks ? { remarks: trimmedRemarks } : {})
      });
      setResult(`Claim ${response.reference} submitted successfully.`);
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={
        result ? (
          <PrimaryButton
            icon={<ClipboardPlus color="#FFFFFF" size={21} strokeWidth={2} />}
            label="View claims"
            onPress={() => router.push("/claims" as never)}
          />
        ) : (
          <PrimaryButton
            busy={busy}
            icon={<ClipboardPlus color="#FFFFFF" size={21} strokeWidth={2} />}
            label="Submit claim"
            onPress={submit}
          />
        )
      }
      subtitle="Capture the issue clearly so the service team can make a faster decision."
      title="Create claim"
    >
      {result ? (
        <View style={styles.success}>
          <CircleCheck color={colors.ok} size={44} strokeWidth={1.9} />
          <Text style={styles.successTitle}>Claim submitted</Text>
          <Text style={styles.successText}>{result}</Text>
        </View>
      ) : (
        <>
          <View style={styles.batteryHeader}>
            <View style={styles.batteryIcon}>
              <Battery color={colors.brand} size={25} strokeWidth={1.8} />
            </View>
            <View>
              <Text style={styles.batteryTitle}>Battery and customer</Text>
              <Text style={styles.batteryText}>
                Confirm the serial and registered mobile.
              </Text>
            </View>
          </View>

          <Field
            autoCapitalize="characters"
            label="Battery serial number"
            onChangeText={setSerialNumber}
            placeholder="Example: AB24-009184"
            value={serialNumber}
          />
          <Field
            keyboardType="number-pad"
            label="Customer mobile"
            maxLength={10}
            onChangeText={setCustomerMobile}
            placeholder="10-digit mobile"
            value={customerMobile}
          />

          <Text style={styles.sectionTitle}>What is the problem?</Text>
          <View style={styles.reasonList}>
            {REASONS.map((item) => {
              const selected = item === reason;
              return (
                <Pressable
                  key={item}
                  onPress={() => setReason(item)}
                  style={[
                    styles.reasonRow,
                    selected && styles.reasonRowSelected
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selected && styles.checkboxSelected
                    ]}
                  >
                    {selected ? (
                      <Check color="#FFFFFF" size={14} strokeWidth={3} />
                    ) : null}
                  </View>
                  <Text style={styles.reasonText}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          <Field
            label="Remarks"
            multiline
            onChangeText={setRemarks}
            placeholder="Add symptoms or anything the service team should know"
            value={remarks}
          />

          <Text style={styles.sectionTitle}>Evidence photos</Text>
          <View style={styles.photoRow}>
            <PhotoAction label="Battery label" />
            <PhotoAction label="Battery condition" />
          </View>
        </>
      )}

      {error ? <Banner kind="bad">{error}</Banner> : null}
      {result ? (
        <View style={styles.secondaryAction}>
          <SecondaryButton
            label="Create another claim"
            onPress={() => {
              setSerialNumber("");
              setCustomerMobile("");
              setRemarks("");
              setResult(null);
              setError(null);
            }}
          />
        </View>
      ) : null}
    </Screen>
  );
}

function PhotoAction({ label }: { label: string }) {
  return (
    <Pressable style={styles.photoAction}>
      <Camera color={colors.brand} size={25} strokeWidth={1.8} />
      <Text style={styles.photoText}>{label}</Text>
      <Text style={styles.photoHint}>Add photo</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  batteryHeader: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    padding: 13
  },
  batteryIcon: {
    alignItems: "center",
    backgroundColor: colors.badBg,
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  batteryTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  batteryText: {
    color: colors.inkSoft,
    fontSize: 11.5,
    marginTop: 3
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 9,
    marginTop: 18
  },
  reasonList: {
    gap: 7
  },
  reasonRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 12
  },
  reasonRowSelected: {
    borderColor: colors.brand
  },
  checkbox: {
    alignItems: "center",
    borderColor: colors.lineStrong,
    borderRadius: 5,
    borderWidth: 2,
    height: 20,
    justifyContent: "center",
    width: 20
  },
  checkboxSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand
  },
  reasonText: {
    color: colors.ink,
    fontSize: 12.5,
    fontWeight: "600"
  },
  photoRow: {
    flexDirection: "row",
    gap: 9
  },
  photoAction: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.lineStrong,
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    flex: 1,
    minHeight: 108,
    justifyContent: "center"
  },
  photoText: {
    color: colors.ink,
    fontSize: 11.5,
    fontWeight: "700",
    marginTop: 7
  },
  photoHint: {
    color: colors.inkFaint,
    fontSize: 10,
    marginTop: 3
  },
  success: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: "#B9DEC7",
    borderRadius: 8,
    borderWidth: 1,
    padding: 30
  },
  successTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12
  },
  successText: {
    color: colors.inkSoft,
    fontSize: 13,
    marginTop: 6
  },
  secondaryAction: {
    marginTop: 14
  }
});
