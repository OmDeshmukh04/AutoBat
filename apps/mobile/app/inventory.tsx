import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { api, type InventoryUnit, type StockMovementRow } from "../src/api";
import { useAuthStore } from "../src/auth-store";
import { Banner, Screen, screenStyles } from "../src/screen-ui";
import { colors } from "../src/theme";

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  IN_STOCK: { bg: colors.okBg, fg: colors.ok },
  IN_TRANSIT: { bg: colors.warnBg, fg: colors.warn },
  SOLD: { bg: colors.okBg, fg: colors.ok },
  UNDER_CLAIM: { bg: colors.warnBg, fg: colors.warn },
  REPLACED: { bg: colors.badBg, fg: colors.bad }
};

export default function InventoryScreen() {
  const user = useAuthStore((s) => s.user);
  const [units, setUnits] = useState<InventoryUnit[] | null>(null);
  const [movements, setMovements] = useState<StockMovementRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .inventory()
      .then(setUnits)
      .catch((e) => setError((e as Error).message));
    // Movement history is best-effort; don't block the units list on it.
    api
      .movements()
      .then(setMovements)
      .catch(() => setMovements([]));
  }, []);

  // Show only stock held by this user's organization.
  const mine = (units ?? []).filter((u) => u.holder === user?.orgName);
  // Movements involving this org (incoming or outgoing).
  const myMovements = movements
    .filter((m) => m.from === user?.orgName || m.to === user?.orgName)
    .slice(0, 8);

  return (
    <Screen
      title="Inventory"
      subtitle={`Serialized batteries held by ${user?.orgName ?? "your organization"}.`}
    >
      {error ? <Banner kind="bad">{error}</Banner> : null}
      {units === null && !error ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 24 }} />
      ) : null}
      {units !== null && mine.length === 0 ? (
        <Banner kind="ok">No units currently in your inventory.</Banner>
      ) : null}
      {mine.map((unit) => {
        const tone = STATUS_STYLE[unit.status] ?? { bg: "#eef0f3", fg: colors.inkSoft };
        return (
          <View key={unit.serialNumber} style={screenStyles.card}>
            <Text style={screenStyles.rowTitle}>{unit.serialNumber}</Text>
            <Text style={screenStyles.rowMeta}>{unit.product}</Text>
            <View style={[screenStyles.pill, { backgroundColor: tone.bg }]}>
              <Text style={[screenStyles.pillText, { color: tone.fg }]}>
                {unit.status.replace(/_/g, " ")}
              </Text>
            </View>
          </View>
        );
      })}

      {myMovements.length > 0 ? (
        <>
          <Text
            style={{
              color: colors.ink,
              fontSize: 16,
              fontWeight: "800",
              marginTop: 22,
              marginBottom: 10
            }}
          >
            Recent movements
          </Text>
          {myMovements.map((m) => {
            const incoming = m.to === user?.orgName;
            return (
              <View key={m.id} style={screenStyles.card}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={screenStyles.rowTitle}>
                    {incoming ? "Received" : "Sent"} {m.quantity} units
                  </Text>
                  <Text style={{ color: colors.inkFaint, fontSize: 12 }}>{m.at}</Text>
                </View>
                <Text style={screenStyles.rowMeta}>
                  {m.type} · {incoming ? `from ${m.from}` : `to ${m.to}`} · {m.reference}
                </Text>
              </View>
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}
