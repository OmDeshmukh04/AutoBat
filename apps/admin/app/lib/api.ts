// Server-side API client for the admin portal. Pages are React Server
// Components, so these run on the server and fetch directly from the NestJS API.
// Each call falls back to demo data if the API is unreachable, so the portal
// still renders during local development without the backend running.

import {
  BACKDATED_REQUESTS,
  CLAIMS,
  INVENTORY,
  PARTNERS,
  PRODUCTS,
  RECENT_ACTIVITY,
  type BackdatedRequest,
  type CatalogueProduct,
  type ClaimRow,
  type InventoryUnit,
  type Partner
} from "./mock-data";
import { DRAFT_WARRANTY_POLICIES, type BatteryStatus } from "@autobat/contracts";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

export type ApiResult<T> = { data: T; live: boolean };

async function getJson<T>(path: string, fallback: T): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      // Always fresh in the operations portal.
      cache: "no-store"
    });
    if (!res.ok) {
      return { data: fallback, live: false };
    }
    return { data: (await res.json()) as T, live: true };
  } catch {
    return { data: fallback, live: false };
  }
}

export type DashboardMetrics = {
  warranty: { active: number; pendingBackdated: number };
  sales: { soldUnits: number; partnerCount: number };
  stock: { inStock: number; inTransit: number };
  claims: { open: number; overSla: number; approvalRate: number };
};

const FALLBACK_METRICS: DashboardMetrics = {
  warranty: { active: 18420, pendingBackdated: 37 },
  sales: { soldUnits: 9711, partnerCount: 142 },
  stock: { inStock: 24108, inTransit: 3540 },
  claims: { open: 412, overSla: 112, approvalRate: 76 }
};

export type ActivityRow = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityType: string;
  at: string;
};

const FALLBACK_ACTIVITY: ActivityRow[] = RECENT_ACTIVITY.map((a) => ({
  id: a.id,
  actor: a.actor,
  action: a.action,
  entity: a.entity,
  entityType: a.kind,
  at: a.at
}));

export function getDashboardMetrics() {
  return getJson<DashboardMetrics>("/dashboard/metrics", FALLBACK_METRICS);
}

export function getActivity() {
  return getJson<ActivityRow[]>("/dashboard/activity", FALLBACK_ACTIVITY);
}

export function getPartners() {
  return getJson<Partner[]>("/catalog/partners", PARTNERS);
}

export function getProducts() {
  return getJson<CatalogueProduct[]>("/catalog/products", PRODUCTS);
}

export type PolicyRow = {
  id: string;
  productName: string;
  policyName: string;
  version: number;
  freeReplacementMonths: number;
  totalWarrantyMonths: number;
  registrationWindowDays: number;
  isDraft: boolean;
};

const FALLBACK_POLICIES: PolicyRow[] = DRAFT_WARRANTY_POLICIES.map((p) => ({
  id: p.id,
  productName: p.productName,
  policyName: p.policyName,
  version: p.version,
  freeReplacementMonths: p.freeReplacementMonths,
  totalWarrantyMonths: p.totalWarrantyMonths,
  registrationWindowDays: p.registrationWindowDays,
  isDraft: p.isDraft
}));

export function getPolicies() {
  return getJson<PolicyRow[]>("/catalog/policies", FALLBACK_POLICIES);
}

export type InventoryRow = Omit<InventoryUnit, "status"> & {
  status: BatteryStatus;
};

export function getInventory() {
  return getJson<InventoryRow[]>("/inventory/units", INVENTORY);
}

export function getClaims() {
  return getJson<ClaimRow[]>("/claims", CLAIMS);
}

export type MovementRow = {
  id: string;
  type: string;
  from: string;
  to: string;
  quantity: number;
  reference: string;
  at: string;
};

const FALLBACK_MOVEMENTS: MovementRow[] = [
  { id: "m1", type: "DISPATCH", from: "AutoBat", to: "West Hub Distributor", quantity: 2000, reference: "DSP-1001", at: "2026-06-15" },
  { id: "m2", type: "TRANSFER", from: "West Hub Distributor", to: "Sharda Auto", quantity: 240, reference: "TRF-2087", at: "2026-06-17" },
  { id: "m3", type: "SALE", from: "Sharda Auto", to: "Customer", quantity: 1, reference: "AB24-009183", at: "2026-06-19" },
  { id: "m4", type: "RETURN", from: "Verma Batteries", to: "West Hub Distributor", quantity: 1, reference: "RET-0042", at: "2026-06-14" }
];

export function getMovements() {
  return getJson<MovementRow[]>("/inventory/movements", FALLBACK_MOVEMENTS);
}

export function getBackdated() {
  return getJson<BackdatedRequest[]>("/warranties/backdated", BACKDATED_REQUESTS);
}
