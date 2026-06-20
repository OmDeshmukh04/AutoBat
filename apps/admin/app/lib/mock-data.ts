// Mock operational data for the admin portal.
// Mirrors the Prisma domain model (apps/api/prisma/schema.prisma) so the UI is
// already shaped for the real API. Replace with live data fetching once the
// backend endpoints land.

import type { BatteryStatus } from "@autobat/contracts";

export type Trend = "up" | "down" | "flat";

export type Metric = {
  label: string;
  value: string;
  delta: string;
  trend: Trend;
  hint: string;
};

export const WARRANTY_METRICS: Metric[] = [
  {
    label: "Active warranties",
    value: "18,420",
    delta: "+4.2%",
    trend: "up",
    hint: "vs. last 30 days"
  },
  {
    label: "Registrations today",
    value: "264",
    delta: "+12.0%",
    trend: "up",
    hint: "318 yesterday"
  },
  {
    label: "Expiring in 30 days",
    value: "1,032",
    delta: "-1.8%",
    trend: "down",
    hint: "renewal outreach due"
  },
  {
    label: "Backdated pending",
    value: "37",
    delta: "+9",
    trend: "up",
    hint: "awaiting approval"
  }
];

export const SALES_METRICS: Metric[] = [
  {
    label: "Units sold (MTD)",
    value: "9,711",
    delta: "+6.5%",
    trend: "up",
    hint: "vs. last month"
  },
  {
    label: "Sell-through rate",
    value: "82%",
    delta: "+3 pts",
    trend: "up",
    hint: "dispatched vs. sold"
  }
];

export const STOCK_METRICS: Metric[] = [
  {
    label: "Batteries in stock",
    value: "24,108",
    delta: "-2.1%",
    trend: "down",
    hint: "across 142 partners"
  },
  {
    label: "In transit",
    value: "3,540",
    delta: "+540",
    trend: "up",
    hint: "21 open shipments"
  }
];

export const CLAIM_METRICS: Metric[] = [
  {
    label: "Open claims",
    value: "412",
    delta: "+18",
    trend: "up",
    hint: "112 over SLA"
  },
  {
    label: "Approval rate",
    value: "76%",
    delta: "+2 pts",
    trend: "up",
    hint: "last 30 days"
  },
  {
    label: "Avg. resolution",
    value: "4.1 days",
    delta: "-0.6 d",
    trend: "down",
    hint: "down from 4.7"
  }
];

export type SalesPoint = { month: string; sold: number; registered: number };

export const SALES_TREND: SalesPoint[] = [
  { month: "Jan", sold: 7100, registered: 5900 },
  { month: "Feb", sold: 7650, registered: 6400 },
  { month: "Mar", sold: 8200, registered: 7000 },
  { month: "Apr", sold: 8050, registered: 6850 },
  { month: "May", sold: 9100, registered: 7900 },
  { month: "Jun", sold: 9711, registered: 8420 }
];

export type ClaimStageCount = { stage: string; count: number };

export const CLAIM_FUNNEL: ClaimStageCount[] = [
  { stage: "Submitted", count: 412 },
  { stage: "Under review", count: 246 },
  { stage: "Field test", count: 138 },
  { stage: "Approved", count: 312 },
  { stage: "Replaced", count: 287 }
];

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  at: string;
  kind: "warranty" | "claim" | "stock" | "partner" | "policy";
};

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    actor: "Sharda Auto (DLR-0421)",
    action: "registered warranty for",
    entity: "SN AB24-009183",
    at: "3 min ago",
    kind: "warranty"
  },
  {
    id: "a2",
    actor: "Verma Batteries (DLR-0188)",
    action: "submitted claim",
    entity: "CLM-20614",
    at: "11 min ago",
    kind: "claim"
  },
  {
    id: "a3",
    actor: "West Hub Distributor",
    action: "transferred 240 units to",
    entity: "DLR-0421",
    at: "38 min ago",
    kind: "stock"
  },
  {
    id: "a4",
    actor: "admin@autobat",
    action: "approved backdated registration",
    entity: "REG-7782",
    at: "1 hr ago",
    kind: "warranty"
  },
  {
    id: "a5",
    actor: "admin@autobat",
    action: "published policy",
    entity: "Inva-Sol v2",
    at: "2 hr ago",
    kind: "policy"
  },
  {
    id: "a6",
    actor: "New Star Motors",
    action: "onboarded as",
    entity: "Dealer (DLR-0533)",
    at: "4 hr ago",
    kind: "partner"
  }
];

export type AlertItem = {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
};

export const ATTENTION_ITEMS: AlertItem[] = [
  {
    id: "al1",
    severity: "high",
    title: "112 claims over SLA",
    detail: "Resolution past 5 working days. Review the claims workbench.",
  },
  {
    id: "al2",
    severity: "high",
    title: "37 backdated registrations waiting",
    detail: "Oldest request is 6 days old.",
  },
  {
    id: "al3",
    severity: "medium",
    title: "3 partners low on stock",
    detail: "Below reorder threshold of 50 units.",
  },
  {
    id: "al4",
    severity: "low",
    title: "Inva-Sol policy still draft",
    detail: "Free-replacement split needs sign-off before go-live.",
  }
];

export type Partner = {
  id: string;
  code: string;
  name: string;
  type: "DISTRIBUTOR" | "DEALER" | "SERVICE_POINT" | "RECYCLER";
  region: string;
  stock: number;
  active: boolean;
};

export const PARTNERS: Partner[] = [
  {
    id: "p1",
    code: "DST-0007",
    name: "West Hub Distributor",
    type: "DISTRIBUTOR",
    region: "West",
    stock: 6120,
    active: true
  },
  {
    id: "p2",
    code: "DLR-0421",
    name: "Sharda Auto",
    type: "DEALER",
    region: "Pune",
    stock: 312,
    active: true
  },
  {
    id: "p3",
    code: "DLR-0188",
    name: "Verma Batteries",
    type: "DEALER",
    region: "Nagpur",
    stock: 44,
    active: true
  },
  {
    id: "p4",
    code: "SVC-0033",
    name: "Citywide Service Point",
    type: "SERVICE_POINT",
    region: "Mumbai",
    stock: 18,
    active: true
  },
  {
    id: "p5",
    code: "DLR-0533",
    name: "New Star Motors",
    type: "DEALER",
    region: "Nashik",
    stock: 90,
    active: true
  },
  {
    id: "p6",
    code: "RCY-0002",
    name: "GreenCell Recycler",
    type: "RECYCLER",
    region: "West",
    stock: 0,
    active: false
  }
];

export type CatalogueProduct = {
  id: string;
  sku: string;
  name: string;
  family: string;
  voltage: string;
  capacity: string;
  policy: string;
  active: boolean;
};

export const PRODUCTS: CatalogueProduct[] = [
  {
    id: "pr1",
    sku: "INV-SOL-150",
    name: "Inva-Sol 150Ah",
    family: "Inva-Sol",
    voltage: "12V",
    capacity: "150Ah",
    policy: "Draft 60-month",
    active: true
  },
  {
    id: "pr2",
    sku: "AUTO-DIN-65",
    name: "Automotive DIN65",
    family: "Automotive",
    voltage: "12V",
    capacity: "65Ah",
    policy: "Draft 36-month",
    active: true
  },
  {
    id: "pr3",
    sku: "EV-2W-30",
    name: "EV 2W 30Ah",
    family: "Electric 2/3 Wheeler",
    voltage: "48V",
    capacity: "30Ah",
    policy: "Draft 36-month",
    active: true
  }
];

export type InventoryUnit = {
  serialNumber: string;
  product: string;
  status: BatteryStatus;
  holder: string;
  updatedAt: string;
};

export const INVENTORY: InventoryUnit[] = [
  {
    serialNumber: "AB24-009183",
    product: "Inva-Sol 150Ah",
    status: "SOLD",
    holder: "Sharda Auto",
    updatedAt: "2026-06-19"
  },
  {
    serialNumber: "AB24-009184",
    product: "Inva-Sol 150Ah",
    status: "IN_STOCK",
    holder: "Sharda Auto",
    updatedAt: "2026-06-18"
  },
  {
    serialNumber: "AB24-007710",
    product: "Automotive DIN65",
    status: "IN_TRANSIT",
    holder: "West Hub Distributor",
    updatedAt: "2026-06-18"
  },
  {
    serialNumber: "AB24-004410",
    product: "EV 2W 30Ah",
    status: "UNDER_CLAIM",
    holder: "Citywide Service Point",
    updatedAt: "2026-06-17"
  },
  {
    serialNumber: "AB24-001002",
    product: "Automotive DIN65",
    status: "REPLACED",
    holder: "Verma Batteries",
    updatedAt: "2026-06-15"
  }
];

export const STATUS_TONE: Record<BatteryStatus, "ok" | "warn" | "bad" | "muted"> =
  {
    MANUFACTURED: "muted",
    IN_STOCK: "ok",
    IN_TRANSIT: "warn",
    SOLD: "ok",
    UNDER_CLAIM: "warn",
    REPLACED: "bad",
    RETURNED: "muted",
    RECYCLED: "muted"
  };

export type ClaimRow = {
  id: string;
  serialNumber: string;
  customer: string;
  partner: string;
  reason: string;
  stage: "Submitted" | "Under review" | "Field test" | "Approved" | "Rejected";
  age: string;
  overSla: boolean;
};

export const CLAIMS: ClaimRow[] = [
  {
    id: "CLM-20614",
    serialNumber: "AB24-004410",
    customer: "98xxxxxx21",
    partner: "Verma Batteries",
    reason: "Not holding charge",
    stage: "Under review",
    age: "2 d",
    overSla: false
  },
  {
    id: "CLM-20598",
    serialNumber: "AB24-003991",
    customer: "97xxxxxx04",
    partner: "Sharda Auto",
    reason: "Bulging case",
    stage: "Field test",
    age: "6 d",
    overSla: true
  },
  {
    id: "CLM-20571",
    serialNumber: "AB24-002250",
    customer: "96xxxxxx88",
    partner: "Citywide Service Point",
    reason: "Dead cell",
    stage: "Submitted",
    age: "1 d",
    overSla: false
  },
  {
    id: "CLM-20540",
    serialNumber: "AB24-001870",
    customer: "99xxxxxx13",
    partner: "Verma Batteries",
    reason: "Low backup",
    stage: "Approved",
    age: "8 d",
    overSla: true
  }
];

export type BackdatedRequest = {
  id: string;
  serialNumber: string;
  partner: string;
  purchaseDate: string;
  delayDays: number;
  reason: string;
};

export const BACKDATED_REQUESTS: BackdatedRequest[] = [
  {
    id: "REG-7782",
    serialNumber: "AB24-008120",
    partner: "Sharda Auto",
    purchaseDate: "2026-05-30",
    delayDays: 13,
    reason: "Customer registered late after losing invoice"
  },
  {
    id: "REG-7791",
    serialNumber: "AB24-008455",
    partner: "New Star Motors",
    purchaseDate: "2026-06-01",
    delayDays: 11,
    reason: "Connectivity outage at point of sale"
  },
  {
    id: "REG-7803",
    serialNumber: "AB24-008990",
    partner: "Verma Batteries",
    purchaseDate: "2026-06-05",
    delayDays: 9,
    reason: "Bulk fleet sale registered after delivery"
  }
];
