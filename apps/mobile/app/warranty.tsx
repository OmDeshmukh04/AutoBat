import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  BatteryCharging,
  Download,
  Search,
  ShieldCheck
} from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, type WarrantyDetail } from "../src/api";
import { DetailHeader, WarrantyIcon } from "../src/mobile-ui";
import { colors } from "../src/theme";

function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(year!, month! - 1, day));
}

function maskMobile(value: string): string {
  return value.length === 10
    ? `${value.slice(0, 2)}xxxxxx${value.slice(-2)}`
    : value;
}

export default function WarrantyScreen() {
  const params = useLocalSearchParams<{ serial?: string }>();
  const [serial, setSerial] = useState(params.serial ?? "");
  const [detail, setDetail] = useState<WarrantyDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (value = serial) => {
    if (!value.trim()) {
      setError("Enter or scan a battery serial number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setDetail(await api.warrantyBySerial(value.trim().toUpperCase()));
    } catch (lookupError) {
      setDetail(null);
      setError((lookupError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (params.serial) {
      void lookup(params.serial);
    }
  }, [params.serial]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <DetailHeader title="Warranty status" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchRow}>
          <TextInput
            autoCapitalize="characters"
            onChangeText={setSerial}
            onSubmitEditing={() => void lookup()}
            placeholder="Battery serial number"
            placeholderTextColor={colors.inkFaint}
            style={styles.searchInput}
            value={serial}
          />
          <Pressable
            accessibilityLabel="Search warranty"
            onPress={() => void lookup()}
            style={styles.searchButton}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Search color="#FFFFFF" size={22} strokeWidth={2.3} />
            )}
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {detail ? (
          <>
            <View style={styles.productPanel}>
              <View style={styles.productRow}>
                <View style={styles.batteryVisual}>
                  <BatteryCharging
                    color={colors.brand}
                    size={44}
                    strokeWidth={1.7}
                  />
                </View>
                <View style={styles.productCopy}>
                  <Text style={styles.serial}>{detail.serialNumber}</Text>
                  <Text style={styles.productName}>{detail.productName}</Text>
                </View>
              </View>

              <View style={styles.panelDivider} />

              <View style={styles.statusRow}>
                <WarrantyIcon />
                <View>
                  <Text style={styles.activeStatus}>{detail.status}</Text>
                  <Text style={styles.daysLeft}>
                    {detail.daysRemaining.toLocaleString("en-IN")} days left
                  </Text>
                </View>
              </View>

              <WarrantyTimeline detail={detail} />
            </View>

            <View style={styles.infoPanel}>
              <Text style={styles.panelTitle}>Customer details</Text>
              <InfoRow label="Phone" value={maskMobile(detail.customerMobile)} />
              <InfoRow
                label="Warranty phase"
                value={detail.phase.replaceAll("_", " ")}
              />

              <View style={styles.panelDivider} />

              <Text style={styles.panelTitle}>Dealer details</Text>
              <InfoRow label="Dealer" value={detail.dealerName} />
              <InfoRow label="Dealer code" value={detail.dealerCode} />
              <InfoRow
                label="Purchase date"
                value={formatDate(detail.purchaseDate)}
              />
              <InfoRow
                label="Activation date"
                value={formatDate(detail.activationDate)}
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <ShieldCheck color={colors.brand} size={38} strokeWidth={1.8} />
            <Text style={styles.emptyTitle}>Find a digital warranty</Text>
            <Text style={styles.emptyText}>
              Scan the battery label or enter its serial number above.
            </Text>
          </View>
        )}
      </ScrollView>

      {detail ? (
        <View style={styles.bottomAction}>
          <Pressable
            onPress={() =>
              Alert.alert(
                "Certificate ready",
                `Warranty certificate ${detail.warrantyId} is ready for download.`
              )
            }
            style={styles.primaryButton}
          >
            <Download color="#FFFFFF" size={23} strokeWidth={2.2} />
            <Text style={styles.primaryButtonText}>Download certificate</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function WarrantyTimeline({ detail }: { detail: WarrantyDetail }) {
  const steps = [
    { label: "Purchased", date: detail.purchaseDate, complete: true },
    {
      label: "Free replacement ends",
      date: detail.freeReplacementEndDate,
      complete: detail.phase !== "FREE_REPLACEMENT"
    },
    {
      label: "Warranty expires",
      date: detail.expiryDate,
      complete: detail.phase === "EXPIRED"
    }
  ];

  return (
    <View style={styles.timeline}>
      <View style={styles.timelineTrack} />
      {steps.map((step, index) => (
        <View key={step.label} style={styles.timelineStep}>
          <View
            style={[
              styles.timelineDot,
              (step.complete || index === 0) && styles.timelineDotComplete
            ]}
          />
          <Text style={styles.timelineLabel}>{step.label}</Text>
          <Text style={styles.timelineDate}>{formatDate(step.date)}</Text>
        </View>
      ))}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1
  },
  content: {
    backgroundColor: colors.bg,
    gap: 14,
    padding: 14,
    paddingBottom: 28
  },
  searchRow: {
    flexDirection: "row",
    gap: 8
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderColor: colors.lineStrong,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 14
  },
  searchButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 8,
    justifyContent: "center",
    width: 52
  },
  errorBanner: {
    backgroundColor: colors.badBg,
    borderColor: "#F2B8BC",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  errorText: {
    color: colors.bad,
    fontSize: 13,
    fontWeight: "600"
  },
  productPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16
  },
  productRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 15
  },
  batteryVisual: {
    alignItems: "center",
    backgroundColor: "#F1F1EE",
    borderRadius: 8,
    height: 76,
    justifyContent: "center",
    width: 96
  },
  productCopy: {
    flex: 1
  },
  serial: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800"
  },
  productName: {
    color: colors.ink,
    fontSize: 15,
    marginTop: 7
  },
  panelDivider: {
    backgroundColor: colors.line,
    height: 1,
    marginVertical: 16
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 18
  },
  activeStatus: {
    color: colors.ok,
    fontSize: 26,
    fontWeight: "900"
  },
  daysLeft: {
    color: colors.ink,
    fontSize: 18,
    marginTop: 2
  },
  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    position: "relative"
  },
  timelineTrack: {
    backgroundColor: colors.lineStrong,
    height: 2,
    left: "15%",
    position: "absolute",
    right: "15%",
    top: 8
  },
  timelineStep: {
    alignItems: "center",
    flex: 1,
    minHeight: 80
  },
  timelineDot: {
    backgroundColor: colors.surface,
    borderColor: colors.inkFaint,
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    width: 18
  },
  timelineDotComplete: {
    backgroundColor: colors.surface,
    borderColor: colors.ok,
    borderWidth: 5
  },
  timelineLabel: {
    color: colors.ink,
    fontSize: 11.5,
    fontWeight: "700",
    lineHeight: 15,
    marginTop: 11,
    minHeight: 30,
    paddingHorizontal: 2,
    textAlign: "center"
  },
  timelineDate: {
    color: colors.inkSoft,
    fontSize: 10.5,
    marginTop: 3,
    textAlign: "center"
  },
  infoPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 5
  },
  infoLabel: {
    color: colors.inkSoft,
    flex: 1,
    fontSize: 13
  },
  infoValue: {
    color: colors.ink,
    flex: 1.4,
    fontSize: 13,
    fontWeight: "600"
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 48
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 14
  },
  emptyText: {
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: "center"
  },
  bottomAction: {
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    padding: 12
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 54
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800"
  }
});
