import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { api, type ProductRow } from "../src/api";
import { Banner, Screen, screenStyles } from "../src/screen-ui";
import { colors } from "../src/theme";

export default function ProductsScreen() {
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .products()
      .then(setRows)
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <Screen title="Product catalog" subtitle="Battery models and their warranty policies.">
      {error ? <Banner kind="bad">{error}</Banner> : null}

      {rows === null && !error ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 24 }} />
      ) : null}

      {(rows ?? []).map((p) => (
        <View key={p.id} style={screenStyles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[screenStyles.rowTitle, { flex: 1 }]}>{p.name}</Text>
            {!p.active ? (
              <View style={[screenStyles.pill, { backgroundColor: "#eef0f3", marginTop: 0 }]}>
                <Text style={[screenStyles.pillText, { color: colors.inkSoft }]}>Inactive</Text>
              </View>
            ) : null}
          </View>
          <Text style={screenStyles.rowMeta}>
            {p.sku} · {p.family}
            {p.voltage ? ` · ${p.voltage}` : ""}
            {p.capacity ? ` · ${p.capacity}` : ""}
          </Text>
          <Text style={[screenStyles.rowMeta, { color: colors.brand, fontWeight: "700" }]}>
            Policy: {p.policy}
          </Text>
        </View>
      ))}
    </Screen>
  );
}
