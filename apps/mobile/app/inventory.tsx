import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Battery,
  Search,
  ScanLine
} from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  api,
  type InventoryUnit,
  type StockMovementRow
} from "../src/api";
import { useAuthStore } from "../src/auth-store";
import {
  BottomNav,
  DetailHeader,
  SectionTitle,
  StatusBadge
} from "../src/mobile-ui";
import { Banner, EmptyState } from "../src/screen-ui";
import { colors } from "../src/theme";

type FilterKey = "ALL" | "IN_STOCK" | "IN_TRANSIT" | "UNDER_CLAIM";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "IN_STOCK", label: "In stock" },
  { key: "IN_TRANSIT", label: "In transit" },
  { key: "UNDER_CLAIM", label: "Claim" }
];

export default function InventoryScreen() {
  const user = useAuthStore((state) => state.user);
  const [units, setUnits] = useState<InventoryUnit[] | null>(null);
  const [movements, setMovements] = useState<StockMovementRow[]>([]);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      api.inventory().then(setUnits),
      api.movements().then(setMovements)
    ]).catch((loadError) => setError((loadError as Error).message));
  }, []);

  const mine = useMemo(
    () => (units ?? []).filter((unit) => unit.holder === user?.orgName),
    [units, user?.orgName]
  );

  const counts = useMemo(
    () => ({
      ALL: mine.length,
      IN_STOCK: mine.filter((unit) => unit.status === "IN_STOCK").length,
      IN_TRANSIT: mine.filter((unit) => unit.status === "IN_TRANSIT").length,
      UNDER_CLAIM: mine.filter((unit) => unit.status === "UNDER_CLAIM").length
    }),
    [mine]
  );

  const visibleUnits = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return mine.filter((unit) => {
      const matchesFilter = filter === "ALL" || unit.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        unit.serialNumber.toLowerCase().includes(normalizedQuery) ||
        unit.product.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, mine, query]);

  const myMovements = movements
    .filter(
      (movement) =>
        movement.from === user?.orgName || movement.to === user?.orgName
    )
    .slice(0, 4);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <DetailHeader title="Inventory" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchField}>
          <Search color={colors.inkSoft} size={20} strokeWidth={1.9} />
          <TextInput
            onChangeText={setQuery}
            placeholder="Search serial or product"
            placeholderTextColor={colors.inkFaint}
            style={styles.searchInput}
            value={query}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.filters}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {FILTERS.map((item) => {
            const selected = item.key === filter;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[styles.filter, selected && styles.filterSelected]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextSelected
                  ]}
                >
                  {item.label} {counts[item.key]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {error ? <Banner kind="bad">{error}</Banner> : null}
        {units === null && !error ? (
          <ActivityIndicator color={colors.brand} style={styles.loader} />
        ) : null}

        {units !== null && visibleUnits.length === 0 ? (
          <EmptyState
            description="Try another filter or scan a battery label."
            icon={<Battery color={colors.brand} size={34} strokeWidth={1.8} />}
            title="No batteries found"
          />
        ) : null}

        <View style={styles.unitList}>
          {visibleUnits.map((unit) => (
            <View key={unit.serialNumber} style={styles.unitRow}>
              <View style={styles.batteryIcon}>
                <Battery color={colors.brand} size={25} strokeWidth={1.8} />
              </View>
              <View style={styles.unitCopy}>
                <Text style={styles.unitSerial}>{unit.serialNumber}</Text>
                <Text style={styles.unitProduct}>{unit.product}</Text>
                <Text style={styles.unitUpdated}>
                  Updated {unit.updatedAt}
                </Text>
              </View>
              <StatusBadge
                label={unit.status.replaceAll("_", " ")}
                tone={
                  unit.status === "IN_STOCK"
                    ? "ok"
                    : unit.status === "UNDER_CLAIM"
                      ? "bad"
                      : "warn"
                }
              />
            </View>
          ))}
        </View>

        {myMovements.length > 0 ? (
          <>
            <SectionTitle>Recent movements</SectionTitle>
            <View style={styles.movementList}>
              {myMovements.map((movement) => {
                const incoming = movement.to === user?.orgName;
                const Icon = incoming ? ArrowDownLeft : ArrowUpRight;
                return (
                  <View key={movement.id} style={styles.movementRow}>
                    <View
                      style={[
                        styles.movementIcon,
                        incoming
                          ? styles.movementIconIncoming
                          : styles.movementIconOutgoing
                      ]}
                    >
                      <Icon
                        color={incoming ? colors.ok : colors.warn}
                        size={20}
                        strokeWidth={2}
                      />
                    </View>
                    <View style={styles.movementCopy}>
                      <Text style={styles.movementTitle}>
                        {incoming ? "Received" : "Sent"} {movement.quantity} units
                      </Text>
                      <Text style={styles.movementMeta}>
                        {incoming
                          ? `From ${movement.from}`
                          : `To ${movement.to}`}{" "}
                        | {movement.reference}
                      </Text>
                    </View>
                    <Text style={styles.movementDate}>{movement.at}</Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>

      <Pressable accessibilityLabel="Scan battery" style={styles.scanFab}>
        <ScanLine color="#FFFFFF" size={26} strokeWidth={2.2} />
      </Pressable>
      <BottomNav active="inventory" />
    </SafeAreaView>
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
    paddingBottom: 84
  },
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
  filters: {
    gap: 8
  },
  filter: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 13
  },
  filterSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand
  },
  filterText: {
    color: colors.inkSoft,
    fontSize: 12,
    fontWeight: "700"
  },
  filterTextSelected: {
    color: "#FFFFFF"
  },
  loader: {
    marginVertical: 30
  },
  unitList: {
    gap: 9
  },
  unitRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 92,
    padding: 12
  },
  batteryIcon: {
    alignItems: "center",
    backgroundColor: colors.badBg,
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  unitCopy: {
    flex: 1
  },
  unitSerial: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  unitProduct: {
    color: colors.inkSoft,
    fontSize: 12.5,
    marginTop: 4
  },
  unitUpdated: {
    color: colors.inkFaint,
    fontSize: 10.5,
    marginTop: 5
  },
  movementList: {
    gap: 8
  },
  movementRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 70,
    padding: 12
  },
  movementIcon: {
    alignItems: "center",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  movementIconIncoming: {
    backgroundColor: colors.okBg
  },
  movementIconOutgoing: {
    backgroundColor: colors.warnBg
  },
  movementCopy: {
    flex: 1
  },
  movementTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800"
  },
  movementMeta: {
    color: colors.inkSoft,
    fontSize: 10.5,
    marginTop: 4
  },
  movementDate: {
    color: colors.inkFaint,
    fontSize: 10
  },
  scanFab: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 25,
    bottom: 82,
    elevation: 4,
    height: 50,
    justifyContent: "center",
    position: "absolute",
    right: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    width: 50
  }
});
