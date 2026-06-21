import { useState } from "react";
import {
  CheckCircle2,
  MapPin,
  Navigation,
  PackageCheck,
  ScanLine,
  Truck
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../src/api";
import {
  Banner,
  Field,
  PrimaryButton,
  Screen
} from "../src/screen-ui";
import { colors } from "../src/theme";

export default function DeliverScreen() {
  const [serialNumber, setSerialNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setResult(null);
    if (!serialNumber.trim()) {
      setError("Scan or enter a battery serial number.");
      return;
    }
    setBusy(true);
    try {
      const serial = serialNumber.trim().toUpperCase();
      await api.deliver(serial);
      setResult(`Delivery confirmed for ${serial}.`);
      setSerialNumber("");
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={
        <PrimaryButton
          busy={busy}
          icon={<CheckCircle2 color="#FFFFFF" size={21} strokeWidth={2} />}
          label="Confirm delivery"
          onPress={submit}
        />
      }
      subtitle="Verify each battery at the delivery stop before completing the handover."
      title="Confirm delivery"
    >
      <View style={styles.runSummary}>
        <View>
          <Text style={styles.runLabel}>Current run</Text>
          <Text style={styles.runValue}>DR-2048</Text>
        </View>
        <View style={styles.runMetric}>
          <Truck color={colors.brand} size={21} strokeWidth={1.9} />
          <Text style={styles.runMetricValue}>2 of 6 stops</Text>
        </View>
      </View>

      <View style={styles.stopPanel}>
        <View style={styles.stopHeader}>
          <View style={styles.stopIcon}>
            <MapPin color={colors.brand} size={23} strokeWidth={2} />
          </View>
          <View style={styles.stopCopy}>
            <Text style={styles.stopName}>Reddy Batteries</Text>
            <Text style={styles.stopAddress}>Market Yard, Pune</Text>
          </View>
          <Text style={styles.stopDistance}>1.8 km</Text>
        </View>
        <View style={styles.stopDivider} />
        <View style={styles.stopFooter}>
          <PackageCheck color={colors.inkSoft} size={19} strokeWidth={1.9} />
          <Text style={styles.stopFooterText}>8 batteries expected</Text>
          <Pressable style={styles.navigationAction}>
            <Navigation color={colors.brand} size={17} strokeWidth={2} />
            <Text style={styles.navigationText}>Navigate</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.scanPrompt}>
        <ScanLine color={colors.brand} size={34} strokeWidth={1.8} />
        <Text style={styles.scanTitle}>Scan delivery battery</Text>
        <Text style={styles.scanText}>
          Use the scanner or enter the serial manually below.
        </Text>
      </View>

      <Field
        autoCapitalize="characters"
        label="Battery serial number"
        onChangeText={setSerialNumber}
        placeholder="Example: AB24-007710"
        value={serialNumber}
      />

      {error ? <Banner kind="bad">{error}</Banner> : null}
      {result ? <Banner kind="ok">{result}</Banner> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  runSummary: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14
  },
  runLabel: {
    color: colors.inkFaint,
    fontSize: 10.5
  },
  runValue: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 3
  },
  runMetric: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7
  },
  runMetricValue: {
    color: colors.ink,
    fontSize: 12.5,
    fontWeight: "700"
  },
  stopPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.brand,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 14
  },
  stopHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  stopIcon: {
    alignItems: "center",
    backgroundColor: colors.badBg,
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  stopCopy: {
    flex: 1
  },
  stopName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  stopAddress: {
    color: colors.inkSoft,
    fontSize: 11.5,
    marginTop: 3
  },
  stopDistance: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "800"
  },
  stopDivider: {
    backgroundColor: colors.line,
    height: 1,
    marginVertical: 12
  },
  stopFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  stopFooterText: {
    color: colors.inkSoft,
    flex: 1,
    fontSize: 11.5
  },
  navigationAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5
  },
  navigationText: {
    color: colors.brand,
    fontSize: 11.5,
    fontWeight: "800"
  },
  scanPrompt: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    marginTop: 14,
    padding: 22
  },
  scanTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10
  },
  scanText: {
    color: colors.inkSoft,
    fontSize: 11.5,
    marginTop: 4,
    textAlign: "center"
  }
});
