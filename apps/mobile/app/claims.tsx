import { useEffect, useState } from "react";
import {
  BatteryCharging,
  CalendarDays,
  Camera,
  ChevronRight,
  CircleCheck,
  CircleDot,
  ClipboardPlus,
  Clock3
} from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, type ClaimRow } from "../src/api";
import { useAuthStore } from "../src/auth-store";
import {
  BottomNav,
  DetailHeader,
  SectionTitle,
  StatusBadge
} from "../src/mobile-ui";
import { colors } from "../src/theme";

const NEXT_STAGE: Record<string, { label: string; value: string }> = {
  Submitted: { label: "Start review", value: "UNDER_REVIEW" },
  "Under review": { label: "Send to field test", value: "FIELD_TEST" },
  "Field test": { label: "Approve replacement", value: "APPROVED" }
};

function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(year!, month! - 1, day));
}

export default function ClaimsScreen() {
  const user = useAuthStore((state) => state.user);
  const [claims, setClaims] = useState<ClaimRow[] | null>(null);
  const [selected, setSelected] = useState<ClaimRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const rows = await api.claims();
      setClaims(rows);
      if (selected) {
        setSelected(rows.find((row) => row.id === selected.id) ?? null);
      }
    } catch (loadError) {
      setError((loadError as Error).message);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (selected) {
    const decide = async (stage: string) => {
      setBusy(true);
      try {
        await api.decideClaim(selected.id, stage);
        await load();
      } catch (decideError) {
        setError((decideError as Error).message);
      } finally {
        setBusy(false);
      }
    };
    const isFinal =
      selected.stage === "Approved" ||
      selected.stage === "Rejected" ||
      selected.stage === "Replaced";
    return (
      <ClaimDetail
        busy={busy}
        canAdvance={user?.role === "SERVICE" || user?.role === "ADMIN"}
        canReject={
          (user?.role === "SERVICE" || user?.role === "ADMIN") && !isFinal
        }
        claim={selected}
        onBack={() => setSelected(null)}
        onAdvance={() => {
          const next = NEXT_STAGE[selected.stage];
          if (next) void decide(next.value);
        }}
        onReject={() => void decide("REJECTED")}
      />
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <DetailHeader title="Claims" />
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.listHeading}>
          <View>
            <Text style={styles.listTitle}>Warranty claims</Text>
            <Text style={styles.listSubtitle}>
              Track inspections, decisions, and replacements.
            </Text>
          </View>
          <ClipboardPlus color={colors.brand} size={28} strokeWidth={1.9} />
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {claims === null ? (
          <ActivityIndicator color={colors.brand} style={styles.loader} />
        ) : null}

        <SectionTitle>Open claims</SectionTitle>
        {(claims ?? []).map((claim) => (
          <Pressable
            key={claim.id}
            onPress={() => setSelected(claim)}
            style={styles.claimRow}
          >
            <View style={styles.claimIcon}>
              <BatteryCharging
                color={colors.brand}
                size={25}
                strokeWidth={1.8}
              />
            </View>
            <View style={styles.claimCopy}>
              <View style={styles.claimTitleRow}>
                <Text style={styles.claimReference}>{claim.id}</Text>
                <StatusBadge
                  label={claim.stage}
                  tone={
                    claim.stage === "Approved"
                      ? "ok"
                      : claim.overSla
                        ? "bad"
                        : "warn"
                  }
                />
              </View>
              <Text style={styles.claimProduct}>{claim.product}</Text>
              <Text style={styles.claimMeta}>
                {claim.serialNumber} | {claim.reason}
              </Text>
            </View>
            <ChevronRight color={colors.inkFaint} size={20} strokeWidth={2} />
          </Pressable>
        ))}
      </ScrollView>
      <BottomNav active="claims" />
    </SafeAreaView>
  );
}

function ClaimDetail({
  claim,
  busy,
  canAdvance,
  canReject,
  onBack,
  onAdvance,
  onReject
}: {
  claim: ClaimRow;
  busy: boolean;
  canAdvance: boolean;
  canReject: boolean;
  onBack: () => void;
  onAdvance: () => void;
  onReject: () => void;
}) {
  const steps = ["Submitted", "Inspection", "Decision", "Replacement"];
  const currentIndex =
    claim.stage === "Submitted"
      ? 0
      : claim.stage === "Under review" || claim.stage === "Field test"
        ? 1
        : claim.stage === "Approved"
          ? 2
          : claim.stage === "Replaced"
            ? 3
            : 1;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <DetailHeader onBack={onBack} title={`Claim ${claim.id}`} />
      <ScrollView contentContainerStyle={styles.detailContent}>
        <View style={styles.stagePanel}>
          <View style={styles.stageTrack} />
          {steps.map((step, index) => (
            <View key={step} style={styles.stageStep}>
              {index < currentIndex ? (
                <CircleCheck
                  color={colors.brand}
                  fill={colors.brand}
                  size={27}
                  strokeWidth={2}
                />
              ) : (
                <CircleDot
                  color={index === currentIndex ? colors.brand : colors.inkFaint}
                  size={27}
                  strokeWidth={2}
                />
              )}
              <Text
                style={[
                  styles.stageLabel,
                  index === currentIndex && styles.stageLabelActive
                ]}
              >
                {step}
              </Text>
              <Text style={styles.stageDate}>
                {index === 0
                  ? formatDate(claim.createdAt)
                  : index === 1 && claim.inspectionScheduledAt
                    ? formatDate(claim.inspectionScheduledAt)
                    : "-"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.schedulePanel}>
          <CalendarDays color={colors.warn} size={30} strokeWidth={2} />
          <View>
            <Text style={styles.scheduleTitle}>Inspection scheduled</Text>
            <Text style={styles.scheduleText}>
              {claim.inspectionScheduledAt
                ? `Technician visit on ${formatDate(claim.inspectionScheduledAt)}`
                : "Service team will confirm the visit date"}
            </Text>
          </View>
        </View>

        <View style={styles.dataPanel}>
          <Text style={styles.panelTitle}>Battery test readings</Text>
          <View style={styles.readingGrid}>
            <Reading label="OCV" value={claim.diagnostics?.ocv ?? "-"} />
            <Reading label="SOC" value={claim.diagnostics?.soc ?? "-"} />
            <Reading label="CCA" value={claim.diagnostics?.cca ?? "-"} />
            <Reading label="SOH" value={claim.diagnostics?.soh ?? "-"} />
            <Reading
              label="Internal resistance"
              value={claim.diagnostics?.internalResistance ?? "-"}
            />
            <Reading
              label="Temperature"
              value={claim.diagnostics?.temperature ?? "-"}
            />
          </View>
        </View>

        <View style={styles.dataPanel}>
          <Text style={styles.panelTitle}>Photos</Text>
          <View style={styles.photoRow}>
            <PhotoPlaceholder label="Battery label" />
            <PhotoPlaceholder label="Test setup" />
          </View>
          <View style={styles.remarks}>
            <Text style={styles.remarksLabel}>Remarks</Text>
            <Text style={styles.remarksText}>
              {claim.remarks ?? claim.reason}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomAction}>
        <View style={styles.actionRow}>
          <Pressable
            disabled={busy || !canAdvance || !NEXT_STAGE[claim.stage]}
            onPress={onAdvance}
            style={[
              styles.primaryButton,
              styles.actionFlex,
              (!canAdvance || !NEXT_STAGE[claim.stage]) &&
                styles.primaryButtonDisabled
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                {canAdvance ? (
                  <ClipboardPlus color="#FFFFFF" size={22} strokeWidth={2} />
                ) : (
                  <Clock3 color="#FFFFFF" size={22} strokeWidth={2} />
                )}
                <Text style={styles.primaryButtonText}>
                  {canAdvance
                    ? NEXT_STAGE[claim.stage]?.label ?? "Claim completed"
                    : "Inspection report pending"}
                </Text>
              </>
            )}
          </Pressable>
          {canReject ? (
            <Pressable
              disabled={busy}
              onPress={onReject}
              style={styles.rejectButton}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function Reading({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reading}>
      <Text style={styles.readingLabel}>{label}</Text>
      <Text style={styles.readingValue}>{value}</Text>
    </View>
  );
}

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <View style={styles.photoPlaceholder}>
      <Camera color={colors.inkSoft} size={28} strokeWidth={1.7} />
      <Text style={styles.photoLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1
  },
  listContent: {
    backgroundColor: colors.bg,
    gap: 14,
    padding: 16,
    paddingBottom: 30
  },
  listHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  listTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800"
  },
  listSubtitle: {
    color: colors.inkSoft,
    fontSize: 13,
    marginTop: 4
  },
  errorBanner: {
    backgroundColor: colors.badBg,
    borderRadius: 8,
    padding: 12
  },
  errorText: {
    color: colors.bad,
    fontSize: 13,
    fontWeight: "600"
  },
  loader: {
    marginVertical: 26
  },
  claimRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 104,
    padding: 13
  },
  claimIcon: {
    alignItems: "center",
    backgroundColor: colors.badBg,
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  claimCopy: {
    flex: 1
  },
  claimTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between"
  },
  claimReference: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  claimProduct: {
    color: colors.ink,
    fontSize: 13.5,
    fontWeight: "600",
    marginTop: 7
  },
  claimMeta: {
    color: colors.inkSoft,
    fontSize: 11.5,
    marginTop: 4
  },
  detailContent: {
    backgroundColor: colors.bg,
    gap: 13,
    padding: 14,
    paddingBottom: 28
  },
  stagePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 16,
    position: "relative"
  },
  stageTrack: {
    backgroundColor: colors.lineStrong,
    height: 2,
    left: "13%",
    position: "absolute",
    right: "13%",
    top: 29
  },
  stageStep: {
    alignItems: "center",
    flex: 1
  },
  stageLabel: {
    color: colors.inkSoft,
    fontSize: 10.5,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center"
  },
  stageLabelActive: {
    color: colors.ink,
    fontWeight: "800"
  },
  stageDate: {
    color: colors.inkFaint,
    fontSize: 9,
    marginTop: 5,
    textAlign: "center"
  },
  schedulePanel: {
    alignItems: "center",
    backgroundColor: colors.warnBg,
    borderColor: "#F4D5B7",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16
  },
  scheduleTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  scheduleText: {
    color: colors.inkSoft,
    fontSize: 12.5,
    marginTop: 4
  },
  dataPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  readingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10
  },
  reading: {
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingVertical: 15,
    width: "50%"
  },
  readingLabel: {
    color: colors.inkSoft,
    flex: 1,
    fontSize: 11
  },
  readingValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
    paddingRight: 8
  },
  photoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  photoPlaceholder: {
    alignItems: "center",
    backgroundColor: "#F0F0ED",
    borderRadius: 8,
    flex: 1,
    height: 112,
    justifyContent: "center"
  },
  photoLabel: {
    color: colors.inkSoft,
    fontSize: 11,
    marginTop: 8
  },
  remarks: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 13
  },
  remarksLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800"
  },
  remarksText: {
    color: colors.inkSoft,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 6
  },
  bottomAction: {
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    padding: 12
  },
  actionRow: {
    flexDirection: "row",
    gap: 10
  },
  actionFlex: {
    flex: 1
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
  primaryButtonDisabled: {
    backgroundColor: "#9B9B97"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800"
  },
  rejectButton: {
    alignItems: "center",
    borderColor: colors.bad,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 20
  },
  rejectButtonText: {
    color: colors.bad,
    fontSize: 15.5,
    fontWeight: "800"
  }
});
