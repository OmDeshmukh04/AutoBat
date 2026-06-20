// Mobile API client. Talks to the AutoBat NestJS API and attaches the JWT from
// the auth store. Base URL is overridable for device/emulator networking.

import { useAuthStore } from "./auth-store";

// On Android emulator use 10.0.2.2 to reach the host; on web/iOS use localhost.
// Override with EXPO_PUBLIC_API_BASE when testing on a physical device.
declare const process: { env: Record<string, string | undefined> };

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = useAuthStore.getState().token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, init);

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  requestOtp: (mobile: string) =>
    request<{ sent: boolean; devCode?: string }>("/auth/request-otp", {
      method: "POST",
      body: { mobile },
      auth: false
    }),
  verifyOtp: (mobile: string, code: string) =>
    request<{ token: string; user: AuthUser }>("/auth/verify-otp", {
      method: "POST",
      body: { mobile, code },
      auth: false
    }),
  me: () => request<AuthUser>("/auth/me"),

  // Reads
  inventory: () => request<InventoryUnit[]>("/inventory/units"),
  policies: () => request<PolicyRow[]>("/catalog/policies"),
  partners: () => request<PartnerRow[]>("/catalog/partners"),
  claims: () => request<ClaimRow[]>("/claims"),
  partnerSummary: () => request<PartnerSummary>("/dashboard/partner"),
  warrantyBySerial: (serialNumber: string) =>
    request<WarrantyDetail>(`/warranties/serial/${encodeURIComponent(serialNumber)}`),

  // Writes (RBAC-enforced server-side)
  registerSale: (body: {
    serialNumber: string;
    customerMobile: string;
    policyId: string;
    purchaseDate?: string;
  }) => request("/ops/sales", { method: "POST", body }),
  transfer: (body: { toOrgId: string; quantity: number }) =>
    request("/ops/transfers", { method: "POST", body }),
  deliver: (serialNumber: string) =>
    request(`/ops/deliveries/${serialNumber}/deliver`, { method: "POST", body: {} }),
  decideClaim: (reference: string, stage: string) =>
    request(`/ops/claims/${reference}`, { method: "PATCH", body: { stage } })
};

export type AuthUser = {
  id: string;
  name: string;
  mobile: string;
  role: string;
  orgId: string | null;
  orgName: string | null;
};

export type InventoryUnit = {
  serialNumber: string;
  product: string;
  status: string;
  holder: string;
  updatedAt: string;
};

export type PolicyRow = {
  id: string;
  productName: string;
  policyName: string;
  freeReplacementMonths: number;
  totalWarrantyMonths: number;
};

export type PartnerRow = {
  id: string;
  code: string;
  name: string;
  type: string;
};

export type ClaimRow = {
  id: string;
  serialNumber: string;
  product: string;
  customer: string;
  partner: string;
  reason: string;
  stage: string;
  age: string;
  overSla: boolean;
  createdAt: string;
  inspectionScheduledAt: string | null;
  diagnostics: {
    ocv: string;
    soc: string;
    cca: string;
    soh: string;
    internalResistance: string;
    temperature: string;
  } | null;
  remarks: string | null;
};

export type PartnerSummary = {
  stock: number;
  pendingWarranty: number;
  openClaims: number;
  expiringSoon: number;
  notifications: number;
};

export type WarrantyDetail = {
  warrantyId: string;
  serialNumber: string;
  productName: string;
  status: string;
  phase: string;
  daysRemaining: number;
  customerMobile: string;
  purchaseDate: string;
  activationDate: string;
  freeReplacementEndDate: string;
  expiryDate: string;
  dealerName: string;
  dealerCode: string;
};
