import { useRouter } from "expo-router";
import {
  Bell,
  Boxes,
  ChevronLeft,
  ClipboardCheck,
  ClipboardPlus,
  Ellipsis,
  FileText,
  History,
  Home,
  LogOut,
  Menu,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Truck,
  X,
  type LucideIcon
} from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "./auth-store";
import { colors, ROLE_LABEL } from "./theme";

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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View style={styles.dashboardHeader}>
      <Pressable
        accessibilityLabel="Open menu"
        onPress={() => setDrawerOpen(true)}
        style={styles.iconButton}
      >
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
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      <Pressable
        accessibilityLabel="Open menu"
        onPress={() => setDrawerOpen(true)}
        style={styles.iconButton}
      >
        <Menu color={colors.ink} size={24} strokeWidth={2} />
      </Pressable>
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

// Screens reachable from the slide-out menu, with the roles allowed to use them.
// Mirrors the server-side @Roles guards so users only see what they can do.
type MenuEntry = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
};

const MENU_ENTRIES: MenuEntry[] = [
  { label: "Dashboard", href: "/", icon: Home, roles: ["ADMIN", "DISTRIBUTOR", "DEALER", "DELIVERY", "SERVICE"] },
  { label: "Register sale", href: "/sale", icon: ShoppingCart, roles: ["DEALER"] },
  { label: "Check warranty", href: "/warranty", icon: ShieldCheck, roles: ["ADMIN", "DISTRIBUTOR", "DEALER", "SERVICE"] },
  { label: "Inventory", href: "/inventory", icon: Boxes, roles: ["ADMIN", "DISTRIBUTOR", "DEALER", "DELIVERY"] },
  { label: "Transfer stock", href: "/transfer", icon: PackageCheck, roles: ["DISTRIBUTOR", "DEALER"] },
  { label: "Confirm delivery", href: "/deliver", icon: Truck, roles: ["DELIVERY"] },
  { label: "Claims", href: "/claims", icon: FileText, roles: ["ADMIN", "DISTRIBUTOR", "DEALER", "SERVICE"] },
  { label: "File a claim", href: "/file-claim", icon: ClipboardPlus, roles: ["DEALER", "DISTRIBUTOR"] },
  { label: "Backdated approvals", href: "/backdated", icon: ClipboardCheck, roles: ["ADMIN"] },
  { label: "Products", href: "/products", icon: Boxes, roles: ["ADMIN", "DISTRIBUTOR", "DEALER", "SERVICE"] },
  { label: "Activity", href: "/activity", icon: History, roles: ["ADMIN", "DISTRIBUTOR", "DEALER", "SERVICE"] }
];

export function AppDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const role = user?.role ?? "";
  // If role is unknown (not yet hydrated), show everything rather than an empty menu.
  const entries = role
    ? MENU_ENTRIES.filter((e) => e.roles.includes(role))
    : MENU_ENTRIES;

  const go = (href: string) => {
    onClose();
    router.push(href as never);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
    router.replace("/login" as never);
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.drawerBackdrop} onPress={onClose} />
      <View style={styles.drawerPanel}>
        <View style={styles.drawerHeader}>
          <View style={styles.drawerAvatar}>
            <Text style={styles.drawerAvatarText}>
              {(user?.name ?? "AB").slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.drawerIdentity}>
            <Text numberOfLines={1} style={styles.drawerName}>
              {user?.name ?? "AutoBat Partner"}
            </Text>
            <Text numberOfLines={1} style={styles.drawerRole}>
              {ROLE_LABEL[role] ?? role ?? "—"}
              {user?.orgName ? ` · ${user.orgName}` : ""}
            </Text>
          </View>
          <Pressable accessibilityLabel="Close menu" onPress={onClose} style={styles.iconButton}>
            <X color={colors.inkSoft} size={22} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.drawerList}>
          {entries.map((entry) => {
            const Icon = entry.icon;
            return (
              <Pressable
                key={entry.href}
                onPress={() => go(entry.href)}
                style={({ pressed }) => [
                  styles.drawerItem,
                  pressed && styles.drawerItemPressed
                ]}
              >
                <Icon color={colors.ink} size={21} strokeWidth={2} />
                <Text style={styles.drawerItemLabel}>{entry.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.drawerSignOut, pressed && styles.drawerItemPressed]}
        >
          <LogOut color={colors.brand} size={20} strokeWidth={2} />
          <Text style={styles.drawerSignOutLabel}>Sign out</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

type NavKey = "home" | "inventory" | "claims" | "more";

const NAV_ITEMS: Array<{
  key: NavKey;
  label: string;
  href?: string;
  icon: LucideIcon;
}> = [
  { key: "home", label: "Home", href: "/", icon: Home },
  { key: "inventory", label: "Inventory", href: "/inventory", icon: Boxes },
  { key: "claims", label: "Claims", href: "/claims", icon: FileText },
  // "More" opens the full role-aware drawer instead of a single hard-coded route.
  { key: "more", label: "More", icon: Ellipsis }
];

export function BottomNav({ active }: { active: NavKey }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const selected = item.key === active;
        const Icon = item.icon;
        const onPress =
          item.key === "more"
            ? () => setDrawerOpen(true)
            : () => router.push(item.href as never);
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={item.key}
            onPress={onPress}
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
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
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
  },
  drawerBackdrop: {
    backgroundColor: "rgba(0,0,0,0.4)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  drawerPanel: {
    backgroundColor: colors.surface,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: "80%",
    maxWidth: 320
  },
  drawerHeader: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 22
  },
  drawerAvatar: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  drawerAvatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  },
  drawerIdentity: {
    flex: 1
  },
  drawerName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  drawerRole: {
    color: colors.inkSoft,
    fontSize: 12.5,
    marginTop: 2
  },
  drawerList: {
    paddingTop: 8
  },
  drawerItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    minHeight: 52,
    paddingHorizontal: 20
  },
  drawerItemPressed: {
    backgroundColor: colors.surfaceSoft
  },
  drawerItemLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600"
  },
  drawerSignOut: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginTop: "auto",
    minHeight: 56,
    paddingHorizontal: 20
  },
  drawerSignOutLabel: {
    color: colors.brand,
    fontSize: 15,
    fontWeight: "800"
  }
});
