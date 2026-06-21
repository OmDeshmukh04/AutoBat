import { useEffect, useState } from "react";
import {
  Battery,
  CalendarDays,
  Check,
  CircleCheck,
  ScanLine,
  UserRound
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api, type PolicyRow } from "../src/api";
import {
  Banner,
  Field,
  PrimaryButton,
  Screen,
  SecondaryButton
} from "../src/screen-ui";
import { colors } from "../src/theme";

function today(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

export default function SaleScreen() {
  const [step, setStep] = useState(1);
  const [serialNumber, setSerialNumber] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [oldBatteryExchanged, setOldBatteryExchanged] = useState(false);
  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [policyId, setPolicyId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api
      .policies()
      .then((rows) => {
        setPolicies(rows);
        if (rows[0]) setPolicyId(rows[0].id);
      })
      .catch((loadError) => setError((loadError as Error).message));
  }, []);

  const selectedPolicy = policies.find((policy) => policy.id === policyId);

  const continueFlow = () => {
    setError(null);
    if (step === 1) {
      if (!serialNumber.trim() || !policyId) {
        setError("Enter the battery serial and select its warranty policy.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!/^[6-9]\d{9}$/.test(customerMobile)) {
        setError("Enter a valid 10-digit customer mobile number.");
        return;
      }
      if (!customerName.trim()) {
        setError("Enter the customer name.");
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
        setError("Use purchase date format YYYY-MM-DD.");
        return;
      }
      setStep(3);
    }
  };

  const submit = async () => {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const response = (await api.registerSale({
        serialNumber: serialNumber.trim().toUpperCase(),
        customerMobile: customerMobile.trim(),
        policyId,
        purchaseDate
      })) as { status: string; backdated: boolean; expiryDate: string };

      setResult(
        response.backdated
          ? `Sale recorded and sent for approval. Warranty expiry: ${response.expiryDate}.`
          : `Warranty activated successfully. Expiry: ${response.expiryDate}.`
      );
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSerialNumber("");
    setCustomerMobile("");
    setCustomerName("");
    setPurchaseDate(today());
    setOldBatteryExchanged(false);
    setResult(null);
    setError(null);
  };

  return (
    <Screen
      footer={
        result ? (
          <PrimaryButton label="Register another sale" onPress={reset} />
        ) : step < 3 ? (
          <PrimaryButton label="Continue" onPress={continueFlow} />
        ) : (
          <PrimaryButton
            busy={busy}
            icon={<CircleCheck color="#FFFFFF" size={21} strokeWidth={2.2} />}
            label="Activate warranty"
            onPress={submit}
          />
        )
      }
      subtitle={
        result
          ? "The customer warranty record is ready."
          : "A guided three-step registration."
      }
      title="Register sale"
    >
      <Progress step={step} />

      {result ? (
        <View style={styles.successPanel}>
          <CircleCheck color={colors.ok} size={44} strokeWidth={1.9} />
          <Text style={styles.successTitle}>Sale registered</Text>
          <Text style={styles.successText}>{result}</Text>
        </View>
      ) : null}

      {!result && step === 1 ? (
        <>
          <View style={styles.batteryPrompt}>
            <View style={styles.promptIcon}>
              <Battery color={colors.brand} size={27} strokeWidth={1.8} />
            </View>
            <View style={styles.promptCopy}>
              <Text style={styles.promptTitle}>Identify the battery</Text>
              <Text style={styles.promptText}>
                Scan its label or enter the serial manually.
              </Text>
            </View>
            <ScanLine color={colors.inkSoft} size={24} strokeWidth={1.9} />
          </View>

          <Field
            autoCapitalize="characters"
            label="Battery serial number"
            onChangeText={setSerialNumber}
            placeholder="Example: AB24-009184"
            value={serialNumber}
          />

          <Text style={styles.fieldHeading}>Warranty policy</Text>
          <View style={styles.optionList}>
            {policies.map((policy) => {
              const selected = policy.id === policyId;
              return (
                <Pressable
                  key={policy.id}
                  onPress={() => setPolicyId(policy.id)}
                  style={[
                    styles.option,
                    selected && styles.optionSelected
                  ]}
                >
                  <View
                    style={[
                      styles.radio,
                      selected && styles.radioSelected
                    ]}
                  />
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>{policy.productName}</Text>
                    <Text style={styles.optionText}>
                      {policy.freeReplacementMonths} months free |{" "}
                      {policy.totalWarrantyMonths} months total
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {!result && step === 2 ? (
        <>
          <View style={styles.summaryPanel}>
            <Battery color={colors.brand} size={24} strokeWidth={1.8} />
            <View>
              <Text style={styles.summarySerial}>
                {serialNumber.toUpperCase()}
              </Text>
              <Text style={styles.summaryProduct}>
                {selectedPolicy?.productName ?? "Selected battery"}
              </Text>
            </View>
          </View>

          <Field
            autoCapitalize="words"
            label="Customer name"
            onChangeText={setCustomerName}
            placeholder="Full name"
            value={customerName}
          />
          <Field
            keyboardType="number-pad"
            label="Customer mobile"
            maxLength={10}
            onChangeText={setCustomerMobile}
            placeholder="10-digit mobile"
            value={customerMobile}
          />
          <Field
            hint="Use YYYY-MM-DD"
            label="Purchase date"
            onChangeText={setPurchaseDate}
            placeholder="YYYY-MM-DD"
            value={purchaseDate}
          />

          <Pressable
            onPress={() => setOldBatteryExchanged((value) => !value)}
            style={styles.checkboxRow}
          >
            <View
              style={[
                styles.checkbox,
                oldBatteryExchanged && styles.checkboxChecked
              ]}
            >
              {oldBatteryExchanged ? (
                <Check color="#FFFFFF" size={15} strokeWidth={3} />
              ) : null}
            </View>
            <Text style={styles.checkboxLabel}>Old battery exchanged</Text>
          </Pressable>
        </>
      ) : null}

      {!result && step === 3 ? (
        <View style={styles.confirmPanel}>
          <Text style={styles.confirmTitle}>Confirm sale details</Text>
          <ConfirmRow label="Battery serial" value={serialNumber.toUpperCase()} />
          <ConfirmRow
            label="Product"
            value={selectedPolicy?.productName ?? "-"}
          />
          <ConfirmRow label="Customer" value={customerName} />
          <ConfirmRow label="Mobile" value={customerMobile} />
          <ConfirmRow label="Purchase date" value={purchaseDate} />
          <ConfirmRow
            label="Old battery"
            value={oldBatteryExchanged ? "Exchanged" : "Not exchanged"}
          />
          <View style={styles.confirmNotice}>
            <CalendarDays color={colors.warn} size={21} strokeWidth={1.9} />
            <Text style={styles.confirmNoticeText}>
              Warranty dates will be calculated from the purchase date.
            </Text>
          </View>
        </View>
      ) : null}

      {error ? <Banner kind="bad">{error}</Banner> : null}

      {!result && step > 1 ? (
        <View style={styles.backAction}>
          <SecondaryButton
            label="Back to previous step"
            onPress={() => {
              setError(null);
              setStep((current) => current - 1);
            }}
          />
        </View>
      ) : null}
    </Screen>
  );
}

function Progress({ step }: { step: number }) {
  const steps = [
    { label: "Battery", icon: Battery },
    { label: "Customer", icon: UserRound },
    { label: "Confirm", icon: CircleCheck }
  ];

  return (
    <View style={styles.progress}>
      <View style={styles.progressLine} />
      {steps.map((item, index) => {
        const current = index + 1;
        const complete = current < step;
        const active = current === step;
        const Icon = item.icon;
        return (
          <View key={item.label} style={styles.progressStep}>
            <View
              style={[
                styles.progressCircle,
                (complete || active) && styles.progressCircleActive
              ]}
            >
              {complete ? (
                <Check color="#FFFFFF" size={15} strokeWidth={3} />
              ) : (
                <Icon
                  color={active ? "#FFFFFF" : colors.inkFaint}
                  size={16}
                  strokeWidth={2}
                />
              )}
            </View>
            <Text
              style={[
                styles.progressLabel,
                active && styles.progressLabelActive
              ]}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.confirmRow}>
      <Text style={styles.confirmLabel}>{label}</Text>
      <Text style={styles.confirmValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    position: "relative"
  },
  progressLine: {
    backgroundColor: colors.lineStrong,
    height: 2,
    left: "16%",
    position: "absolute",
    right: "16%",
    top: 17
  },
  progressStep: {
    alignItems: "center",
    flex: 1
  },
  progressCircle: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.lineStrong,
    borderRadius: 18,
    borderWidth: 2,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  progressCircleActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand
  },
  progressLabel: {
    color: colors.inkFaint,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 7
  },
  progressLabelActive: {
    color: colors.ink,
    fontWeight: "800"
  },
  batteryPrompt: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 13
  },
  promptIcon: {
    alignItems: "center",
    backgroundColor: colors.badBg,
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  promptCopy: {
    flex: 1
  },
  promptTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  promptText: {
    color: colors.inkSoft,
    fontSize: 11.5,
    marginTop: 3
  },
  fieldHeading: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 18
  },
  optionList: {
    gap: 8
  },
  option: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 66,
    padding: 12
  },
  optionSelected: {
    borderColor: colors.brand,
    borderWidth: 2,
    padding: 11
  },
  radio: {
    borderColor: colors.lineStrong,
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    width: 18
  },
  radioSelected: {
    borderColor: colors.brand,
    borderWidth: 5
  },
  optionCopy: {
    flex: 1
  },
  optionTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  optionText: {
    color: colors.inkSoft,
    fontSize: 11.5,
    marginTop: 4
  },
  summaryPanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 13
  },
  summarySerial: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  summaryProduct: {
    color: colors.inkSoft,
    fontSize: 12,
    marginTop: 3
  },
  checkboxRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 18
  },
  checkbox: {
    alignItems: "center",
    borderColor: colors.lineStrong,
    borderRadius: 5,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    width: 22
  },
  checkboxChecked: {
    backgroundColor: colors.brand,
    borderColor: colors.brand
  },
  checkboxLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600"
  },
  confirmPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 15
  },
  confirmTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10
  },
  confirmRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 7
  },
  confirmLabel: {
    color: colors.inkSoft,
    flex: 1,
    fontSize: 12.5
  },
  confirmValue: {
    color: colors.ink,
    flex: 1.3,
    fontSize: 12.5,
    fontWeight: "700",
    textAlign: "right"
  },
  confirmNotice: {
    alignItems: "center",
    backgroundColor: colors.warnBg,
    borderRadius: 8,
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
    padding: 11
  },
  confirmNoticeText: {
    color: colors.warn,
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16
  },
  backAction: {
    marginTop: 16
  },
  successPanel: {
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
    lineHeight: 19,
    marginTop: 7,
    textAlign: "center"
  }
});
