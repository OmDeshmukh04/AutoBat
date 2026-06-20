import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { api, type ActivityRow } from "../src/api";
import { Banner, Screen, screenStyles } from "../src/screen-ui";
import { colors } from "../src/theme";

export default function ActivityScreen() {
  const [rows, setRows] = useState<ActivityRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .activity()
      .then(setRows)
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <Screen
      title="Activity"
      subtitle="Recent operations across sales, transfers, deliveries, and claims."
    >
      {error ? <Banner kind="bad">{error}</Banner> : null}

      {rows === null && !error ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 24 }} />
      ) : null}

      {rows !== null && rows.length === 0 ? (
        <Banner kind="ok">No activity recorded yet.</Banner>
      ) : null}

      {(rows ?? []).map((r) => (
        <View key={r.id} style={screenStyles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[screenStyles.rowTitle, { flex: 1 }]}>
              {r.actor} {r.action}
            </Text>
            <Text style={{ color: colors.inkFaint, fontSize: 12 }}>{r.at.slice(0, 10)}</Text>
          </View>
          <Text style={screenStyles.rowMeta}>
            {r.entityType} · {r.entity}
          </Text>
        </View>
      ))}
    </Screen>
  );
}
