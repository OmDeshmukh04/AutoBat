import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Boxes,
  ShieldCheck,
  ScrollText,
  PackageSearch,
  ArrowLeftRight,
  ClipboardList,
  CalendarClock,
  Wrench,
  Truck,
  BarChart3,
  Bell,
  UserCog,
  History
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  heading: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }]
  },
  {
    heading: "Channel",
    items: [
      { label: "Dealers & Distributors", href: "/partners", icon: Users },
      { label: "Product Catalogue", href: "/products", icon: Boxes },
      {
        label: "Warranty Policies",
        href: "/policies",
        icon: ShieldCheck
      }
    ]
  },
  {
    heading: "Inventory",
    items: [
      { label: "Serialized Inventory", href: "/inventory", icon: PackageSearch },
      {
        label: "Stock Movements",
        href: "/movements",
        icon: ArrowLeftRight
      }
    ]
  },
  {
    heading: "Warranty",
    items: [
      {
        label: "Registrations",
        href: "/registrations",
        icon: ScrollText
      },
      {
        label: "Backdated Approvals",
        href: "/backdated",
        icon: CalendarClock
      }
    ]
  },
  {
    heading: "Claims & Service",
    items: [
      { label: "Claims Workbench", href: "/claims", icon: ClipboardList },
      { label: "Delivery & Returns", href: "/deliveries", icon: Truck },
      { label: "Service Points", href: "/service", icon: Wrench }
    ]
  },
  {
    heading: "Administration",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Users & Roles", href: "/users", icon: UserCog },
      { label: "Audit Logs", href: "/audit", icon: History }
    ]
  }
];

export const NAV_LOOKUP: Record<string, NavItem> = Object.fromEntries(
  NAV_SECTIONS.flatMap((section) => section.items).map((item) => [
    item.href,
    item
  ])
);
