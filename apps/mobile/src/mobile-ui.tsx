import { useRouter } from "expo-router";
import {
  Bell,
  Boxes,
  ChevronLeft,
  Ellipsis,
  FileText,
  Home,
  Menu,
  ShieldCheck,
  type LucideIcon
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "./theme";

export function BrandWordmark() {
  return (
    <View style={styles.brand}>
      <Text style={styles.brandName}>AUTOBAT</Text>
      <Text style={styles.brandSub}>PARTNER</Text>
    </View>
  );
}

export function DashboardHeader({
  notificationCount = 0
}: {
  notificationCount?: number;
}) {
  return (
    <View style={styles.dashboardHeader}>
      <Pressable accessibilityLabel="Open menu" style={styles.iconButton}>
        <Menu color={colors.ink} size={24} strokeWidth={2} />
      </Pressable>
      <BrandWordmark />
      <Pressable accessibilityLabel="Notifications" style={styles.iconButton}>
        <Bell color={colors.ink} size={22} strokeWidth={2} />
        {notificationCount > 0 ? (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {notificationCount > 9 ? "9+" : notificationCount}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

export function DetailHeader({
  title,
  onBack
}: {
  title: string;
  onBack?: () => void;
}) {
  const router = useRouter();

  return (
    <View style={styles.detailHeader}>
      <Pressable
        accessibilityLabel="Go back"
        onPress={onBack ?? (() => router.back())}
        style={styles.iconButton}
      >
        <ChevronLeft color={colors.ink} size={28} strokeWidth={2} />
      </Pressable>
      <Text numberOfLines={1} style={styles.detailTitle}>
        {title}
      </Text>
      <Pressable accessibilityLabel="More options" style={styles.iconButton}>
        <Ellipsis color={colors.ink} size={24} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

type NavKey = "home" | "inventory" | "claims" | "more";

const NAV_ITEMS: Array<{
  key: NavKey;
  label: string;
  href: string;
  icon: LucideIcon;
}> = [
  { key: "home", label: "Home", href: "/", icon: Home },
  { key: "inventory", label: "Inventory", href: "/inventory", icon: Boxes },
  { key: "claims", label: "Claims", href: "/claims", icon: FileText },
  { key: "more", label: "More", href: "/transfer", icon: Ellipsis }
];

export function BottomNav({ active }: { active: NavKey }) {
  const router = useRouter();

  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const selected = item.key === active;
        const Icon = item.icon;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={item.key}
            onPress={() => router.push(item.href as never)}
            style={styles.navItem}
          >
            <Icon
              color={selected ? colors.brand : colors.inkSoft}
              fill={selected && item.key === "home" ? colors.brand : "none"}
              size={22}
              strokeWidth={selected ? 2.4 : 1.8}
            />
            <Text style={[styles.navLabel, selected && styles.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function StatTile({
  icon: Icon,
  label,
  value,
  accent = colors.brand
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <View style={styles.statTile}>
      <Icon color={accent} size={22} strokeWidth={2} />
      <Text numberOfLines={2} style={styles.statLabel}>
        {label}
      </Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function QuickAction({
  icon: Icon,
  label,
  onPress,
  accent = colors.ink
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  accent?: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      <Icon color={accent} size={26} strokeWidth={1.9} />
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

export function StatusBadge({
  label,
  tone = "neutral"
}: {
  label: string;
  tone?: "ok" | "warn" | "bad" | "neutral";
}) {
  const toneStyle = {
    ok: { bg: colors.okBg, fg: colors.ok },
    warn: { bg: colors.warnBg, fg: colors.warn },
    bad: { bg: colors.badBg, fg: colors.bad },
    neutral: { bg: "#EFEFEC", fg: colors.inkSoft }
  }[tone];

  return (
    <View style={[styles.statusBadge, { backgroundColor: toneStyle.bg }]}>
      <Text style={[styles.statusBadgeText, { color: toneStyle.fg }]}>
        {label}
      </Text>
    </View>
  );
}

export function WarrantyIcon() {
  return (
    <View style={styles.warrantyIcon}>
      <ShieldCheck color="#FFFFFF" size={25} strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: "center"
  },
  brandName: {
    color: colors.brand,
    fontSize: 22,
    fontStyle: "italic",
    fontWeight: "900"
  },
  brandSub: {
    color: colors.ink,
    fontSize: 9,
    fontWeight: "800",
    marginTop: -2
  },
  dashboardHeader: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 66,
    justifyContent: "space-between",
    paddingHorizontal: 14
  },
  detailHeader: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 62,
    justifyContent: "space-between",
    paddingHorizontal: 10
  },
  detailTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center"
  },
  iconButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    position: "relative",
    width: 42
  },
  notificationBadge: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderColor: colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    height: 17,
    justifyContent: "center",
    position: "absolute",
    right: 1,
    top: 1,
    minWidth: 17
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800"
  },
  bottomNav: {
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 68,
    paddingBottom: 4
  },
  navItem: {
    alignItems: "center",
    flex: 1,
    gap: 3,
    justifyContent: "center"
  },
  navLabel: {
    color: colors.inkSoft,
    fontSize: 11,
    fontWeight: "600"
  },
  navLabelActive: {
    color: colors.brand,
    fontWeight: "800"
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  statTile: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 118,
    padding: 13
  },
  statLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    marginTop: 12,
    minHeight: 32
  },
  statValue: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "800",
    marginTop: 3
  },
  quickAction: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    justifyContent: "center",
    minHeight: 102,
    paddingHorizontal: 5,
    paddingVertical: 12
  },
  quickActionLabel: {
    color: colors.ink,
    fontSize: 11.5,
    fontWeight: "700",
    lineHeight: 15,
    textAlign: "center"
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800"
  },
  warrantyIcon: {
    alignItems: "center",
    backgroundColor: colors.ok,
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    width: 48
  }
});
