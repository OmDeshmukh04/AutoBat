import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  Box,
  Camera,
  ChevronRight,
  CircleAlert,
  FilePlus2,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Truck
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
import { api, type PartnerSummary } from "../src/api";
import { useAuthStore } from "../src/auth-store";
import {
  BottomNav,
  DashboardHeader,
  QuickAction,
  SectionTitle,
  StatTile
} from "../src/mobile-ui";
import { colors } from "../src/theme";

const EMPTY_SUMMARY: PartnerSummary = {
  stock: 0,
  pendingWarranty: 0,
  openClaims: 0,
  expiringSoon: 0,
  notifications: 0
};

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [summary, setSummary] = useState<PartnerSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setSummary(null);
    // Refresh profile and partner summary independently so one failing does not
    // hide the other, and surface a real message instead of silently zeroing out.
    void api
      .me()
      .then((profile) => void setUser(profile))
      .catch(() => {
        /* profile refresh is best-effort; persisted user still drives the UI */
      });
    void api
      .partnerSummary()
      .then(setSummary)
      .catch((e) => setError((e as Error).message));
  }, [setUser]);

  useEffect(() => {
    load();
  }, [load]);

  const values = summary ?? EMPTY_SUMMARY;
  const organization = user?.orgName ?? "AutoBat Partner";
  const isLoading = summary === null && error === null;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <DashboardHeader notificationCount={values.notifications} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.locationRow}>
          <MapPin color={colors.ink} size={18} strokeWidth={2} />
          <Text style={styles.locationText}>Pune Central</Text>
          <ChevronRight
            color={colors.inkFaint}
            size={16}
            strokeWidth={2}
            style={styles.locationChevron}
          />
        </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingSmall}>Good morning,</Text>
          <Text numberOfLines={1} style={styles.greetingName}>
            {organization}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.brand} />
            <Text style={styles.loadingText}>Updating operations...</Text>
          </View>
        ) : null}

        {error ? (
          <Pressable onPress={load} style={styles.errorBanner}>
            <Text style={styles.errorText}>
              Couldn&apos;t load your data: {error}
            </Text>
            <Text style={styles.errorRetry}>Tap to retry</Text>
          </Pressable>
        ) : null}

        <View style={styles.statRow}>
          <StatTile icon={Box} label="Stock" value={values.stock} />
          <StatTile
            accent={colors.warn}
            icon={ShieldCheck}
            label="Pending warranty"
            value={values.pendingWarranty}
          />
          <StatTile
            icon={FilePlus2}
            label="Claims"
            value={values.openClaims}
          />
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/warranty",
              params: { serial: "AB24-009183" }
            } as never)
          }
          style={({ pressed }) => [
            styles.scanButton,
            pressed && styles.buttonPressed
          ]}
        >
          <Camera color="#FFFFFF" size={27} strokeWidth={2.2} />
          <Text style={styles.scanButtonText}>Scan battery</Text>
        </Pressable>

        <SectionTitle>Quick actions</SectionTitle>
        <View style={styles.quickRow}>
          <QuickAction
            accent={colors.brand}
            icon={ShoppingCart}
            label="Register sale"
            onPress={() => router.push("/sale" as never)}
          />
          <QuickAction
            icon={ShieldCheck}
            label="Check warranty"
            onPress={() => router.push("/warranty" as never)}
          />
          <QuickAction
            icon={PackageCheck}
            label="Receive stock"
            onPress={() => router.push("/inventory" as never)}
          />
          <QuickAction
            icon={Truck}
            label="File a claim"
            onPress={() => router.push("/file-claim" as never)}
          />
        </View>

        <SectionTitle>Needs attention</SectionTitle>
        <View style={styles.attentionList}>
          <AttentionRow
            accent={colors.warn}
            description="Take action to avoid claim rejections"
            icon={AlertTriangle}
            title={`${values.expiringSoon} warranties expiring in 30 days`}
          />
          <AttentionRow
            accent={colors.brand}
            description="Follow up to avoid delays"
            icon={CircleAlert}
            title={`${values.openClaims} claims pending inspection`}
          />
        </View>
      </ScrollView>

      <BottomNav active="home" />
    </SafeAreaView>
  );
}

function AttentionRow({
  icon: Icon,
  title,
  description,
  accent
}: {
  icon: typeof AlertTriangle;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <Pressable style={styles.attentionRow}>
      <Icon color={accent} size={24} strokeWidth={2} />
      <View style={styles.attentionCopy}>
        <Text style={styles.attentionTitle}>{title}</Text>
        <Text style={styles.attentionDescription}>{description}</Text>
      </View>
      <ChevronRight color={colors.inkSoft} size={20} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1
  },
  content: {
    backgroundColor: colors.surface,
    gap: 18,
    paddingBottom: 28
  },
  locationRow: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: 20
  },
  locationText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8
  },
  locationChevron: {
    marginLeft: 3,
    transform: [{ rotate: "90deg" }]
  },
  greeting: {
    paddingHorizontal: 20
  },
  greetingSmall: {
    color: colors.ink,
    fontSize: 16
  },
  greetingName: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "800",
    marginTop: 3
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20
  },
  loadingText: {
    color: colors.inkSoft,
    fontSize: 12
  },
  errorBanner: {
    backgroundColor: colors.badBg,
    borderColor: "#fecaca",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 20,
    padding: 12
  },
  errorText: {
    color: colors.bad,
    fontSize: 13,
    fontWeight: "600"
  },
  errorRetry: {
    color: colors.bad,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20
  },
  scanButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 8,
    flexDirection: "row",
    gap: 11,
    justifyContent: "center",
    marginHorizontal: 20,
    minHeight: 58
  },
  buttonPressed: {
    opacity: 0.86
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800"
  },
  quickRow: {
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 20
  },
  attentionList: {
    gap: 9,
    paddingHorizontal: 20
  },
  attentionRow: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 70,
    padding: 14
  },
  attentionCopy: {
    flex: 1
  },
  attentionTitle: {
    color: colors.ink,
    fontSize: 13.5,
    fontWeight: "700"
  },
  attentionDescription: {
    color: colors.inkSoft,
    fontSize: 11.5,
    marginTop: 3
  }
});
