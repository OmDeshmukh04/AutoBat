import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  X
} from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { api, type BackdatedRow } from "../src/api";
import { Banner, EmptyState, Screen } from "../src/screen-ui";
import { colors } from "../src/theme";

export default function BackdatedScreen() {
  const [rows, setRows] = useState<BackdatedRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void api
      .backdatedQueue()
      .then(setRows)
      .catch((loadError) => setError((loadError as Error).message));
  }, []);

  const decide = async (id: string, decision: "APPROVE" | "REJECT") => {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      await api.decideBackdated(id, decision);
      setRows((current) =>
        (current ?? []).filter((request) => request.id !== id)
      );
      setNotice(
        decision === "APPROVE"
          ? "Registration approved."
          : "Registration rejected."
      );
    } catch (decisionError) {
      setError((decisionError as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen
      subtitle="Review registrations submitted after the allowed warranty window."
      title="Backdated approvals"
    >
      <View style={styles.summary}>
        <CalendarClock color={colors.warn} size={27} strokeWidth={1.9} />
        <View>
          <Text style={styles.summaryValue}>{rows?.length ?? 0} pending</Text>
          <Text style={styles.summaryText}>Require maker-checker review</Text>
        </View>
      </View>

      {error ? <Banner kind="bad">{error}</Banner> : null}
      {notice ? <Banner kind="ok">{notice}</Banner> : null}
      {rows === null && !error ? (
        <ActivityIndicator color={colors.brand} style={styles.loader} />
      ) : null}
      {rows !== null && rows.length === 0 ? (
        <EmptyState
          description="All late registrations have been reviewed."
          icon={<Check color={colors.ok} size={34} strokeWidth={2} />}
          title="Queue is clear"
        />
      ) : null}

      <View style={styles.requestList}>
        {(rows ?? []).map((request) => {
          const busy = busyId === request.id;
          return (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.warningIcon}>
                  <AlertTriangle
                    color={colors.warn}
                    size={22}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.requestCopy}>
                  <Text style={styles.serial}>{request.serialNumber}</Text>
                  <Text style={styles.partner}>{request.partner}</Text>
                </View>
                <View style={styles.delayBadge}>
                  <Text style={styles.delayText}>
                    {request.delayDays} days late
                  </Text>
                </View>
              </View>
              <View style={styles.details}>
                <Text style={styles.detailText}>
                  Purchase date: {request.purchaseDate}
                </Text>
                <Text style={styles.detailText}>{request.reason}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  disabled={busy}
                  onPress={() => void decide(request.id, "APPROVE")}
                  style={styles.approveButton}
                >
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Check color="#FFFFFF" size={18} strokeWidth={2.5} />
                      <Text style={styles.approveText}>Approve</Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  disabled={busy}
                  onPress={() => void decide(request.id, "REJECT")}
                  style={styles.rejectButton}
                >
                  <X color={colors.bad} size={18} strokeWidth={2.4} />
                  <Text style={styles.rejectText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    alignItems: "center",
    backgroundColor: colors.warnBg,
    borderColor: "#F0D0B2",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14
  },
  summaryValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  summaryText: {
    color: colors.inkSoft,
    fontSize: 11.5,
    marginTop: 3
  },
  loader: {
    marginVertical: 28
  },
  requestList: {
    gap: 10,
    marginTop: 14
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 13
  },
  requestHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  warningIcon: {
    alignItems: "center",
    backgroundColor: colors.warnBg,
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  requestCopy: {
    flex: 1
  },
  serial: {
    color: colors.ink,
    fontSize: 13.5,
    fontWeight: "800"
  },
  partner: {
    color: colors.inkSoft,
    fontSize: 11.5,
    marginTop: 3
  },
  delayBadge: {
    backgroundColor: colors.warnBg,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4
  },
  delayText: {
    color: colors.warn,
    fontSize: 9.5,
    fontWeight: "800"
  },
  details: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10
  },
  detailText: {
    color: colors.inkSoft,
    fontSize: 11.5,
    lineHeight: 17
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  approveButton: {
    alignItems: "center",
    backgroundColor: colors.ok,
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 44
  },
  approveText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800"
  },
  rejectButton: {
    alignItems: "center",
    borderColor: colors.bad,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 44
  },
  rejectText: {
    color: colors.bad,
    fontSize: 12.5,
    fontWeight: "800"
  }
});
