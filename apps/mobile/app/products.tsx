import { useEffect, useState } from "react";
import { Battery, Search } from "lucide-react-native";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { api, type ProductRow } from "../src/api";
import { Banner, EmptyState, Screen } from "../src/screen-ui";
import { colors } from "../src/theme";

export default function ProductsScreen() {
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api
      .products()
      .then(setRows)
      .catch((loadError) => setError((loadError as Error).message));
  }, []);

  const normalized = query.trim().toLowerCase();
  const visible = (rows ?? []).filter(
    (product) =>
      !normalized ||
      product.name.toLowerCase().includes(normalized) ||
      product.sku.toLowerCase().includes(normalized) ||
      product.family.toLowerCase().includes(normalized)
  );

  return (
    <Screen
      subtitle="Battery models, specifications, and warranty policies."
      title="Product catalogue"
    >
      <View style={styles.searchField}>
        <Search color={colors.inkSoft} size={19} strokeWidth={1.9} />
        <TextInput
          onChangeText={setQuery}
          placeholder="Search product or SKU"
          placeholderTextColor={colors.inkFaint}
          style={styles.searchInput}
          value={query}
        />
      </View>

      {error ? <Banner kind="bad">{error}</Banner> : null}
      {rows === null && !error ? (
        <ActivityIndicator color={colors.brand} style={styles.loader} />
      ) : null}
      {rows !== null && visible.length === 0 ? (
        <EmptyState
          description="Try a different product name, family, or SKU."
          icon={<Battery color={colors.brand} size={34} strokeWidth={1.8} />}
          title="No products found"
        />
      ) : null}

      <View style={styles.productList}>
        {visible.map((product) => (
          <View key={product.id} style={styles.productRow}>
            <View style={styles.productIcon}>
              <Battery color={colors.brand} size={27} strokeWidth={1.8} />
            </View>
            <View style={styles.productCopy}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productMeta}>
                {product.sku} | {product.family}
              </Text>
              <Text style={styles.specs}>
                {[product.voltage, product.capacity]
                  .filter(Boolean)
                  .join(" | ")}
              </Text>
              <Text style={styles.policy}>{product.policy}</Text>
            </View>
            {!product.active ? (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>Inactive</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchField: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.lineStrong,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: 13
  },
  searchInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: 9
  },
  loader: {
    marginVertical: 28
  },
  productList: {
    gap: 9,
    marginTop: 14
  },
  productRow: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 13
  },
  productIcon: {
    alignItems: "center",
    backgroundColor: colors.badBg,
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  productCopy: {
    flex: 1
  },
  productName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  productMeta: {
    color: colors.inkSoft,
    fontSize: 11,
    marginTop: 4
  },
  specs: {
    color: colors.ink,
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 6
  },
  policy: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6
  },
  inactiveBadge: {
    backgroundColor: "#EFEFEC",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4
  },
  inactiveText: {
    color: colors.inkSoft,
    fontSize: 9.5,
    fontWeight: "800"
  }
});
