import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRightLeft,
  ClipboardCheck,
  PackageCheck
} from "lucide-react-native";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { api, type ActivityRow } from "../src/api";
import { Banner, EmptyState, Screen } from "../src/screen-ui";
import { colors } from "../src/theme";

function iconFor(type: string) {
  if (type === "Claim") return ClipboardCheck;
  if (type === "StockMovement") return ArrowRightLeft;
  return PackageCheck;
}

export default function ActivityScreen() {
  const [rows, setRows] = useState<ActivityRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api
      .activity()
      .then(setRows)
      .catch((loadError) => setError((loadError as Error).message));
  }, []);

  return (
    <Screen
      subtitle="A clear audit trail of recent sales, transfers, claims, and approvals."
      title="Activity"
    >
      {error ? <Banner kind="bad">{error}</Banner> : null}
      {rows === null && !error ? (
        <ActivityIndicator color={colors.brand} style={styles.loader} />
      ) : null}
      {rows !== null && rows.length === 0 ? (
        <EmptyState
          description="New operational events will appear here."
          icon={<Activity color={colors.brand} size={34} strokeWidth={1.8} />}
          title="No activity yet"
        />
      ) : null}

      <View style={styles.timeline}>
        {(rows ?? []).map((row, index) => {
          const Icon = iconFor(row.entityType);
          return (
            <View key={row.id} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={styles.iconCircle}>
                  <Icon color={colors.brand} size={19} strokeWidth={1.9} />
                </View>
                {index < (rows?.length ?? 0) - 1 ? (
                  <View style={styles.line} />
                ) : null}
              </View>
              <View style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.actor}>{row.actor}</Text>
                  <Text style={styles.date}>{row.at.slice(0, 10)}</Text>
                </View>
                <Text style={styles.action}>{row.action}</Text>
                <Text style={styles.entity}>
                  {row.entityType} | {row.entity}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginVertical: 28
  },
  timeline: {
    marginTop: 4
  },
  timelineRow: {
    flexDirection: "row",
    gap: 10,
    minHeight: 100
  },
  timelineRail: {
    alignItems: "center",
    width: 38
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: colors.badBg,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  line: {
    backgroundColor: colors.lineStrong,
    flex: 1,
    width: 1
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginBottom: 10,
    padding: 13
  },
  activityHeader: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  actor: {
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: "800"
  },
  date: {
    color: colors.inkFaint,
    fontSize: 10.5
  },
  action: {
    color: colors.inkSoft,
    fontSize: 12,
    marginTop: 6
  },
  entity: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 7
  }
});
