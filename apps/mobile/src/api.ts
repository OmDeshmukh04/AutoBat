// Mobile API client. Talks to the AutoBat NestJS API and attaches the JWT from
// the auth store. Base URL is overridable for device/emulator networking.

import { useAuthStore } from "./auth-store";

// On Android emulator use 10.0.2.2 to reach the host; on web/iOS use localhost.
// Override with EXPO_PUBLIC_API_BASE when testing on a physical device.
declare const process: { env: Record<string, string | undefined> };

export const API_BASE =
  (process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1").replace(
    /\/+$/,
    ""
  );

const REQUEST_TIMEOUT_MS = 45_000;

function connectionError(error: unknown): Error {
  if (error instanceof Error && error.name === "AbortError") {
    return new Error(
      "The AutoBat server is taking too long to respond. Please try again shortly."
    );
  }

  if (/^http:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(API_BASE)) {
    return new Error(
      "This app is connected to localhost, which a physical phone cannot reach. Install a build configured with the public API URL."
    );
  }

  return new Error(
    "Cannot reach the AutoBat server. Check your internet connection and try again."
  );
}

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const init: RequestInit = { method, headers, signal: controller.signal };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, init);

    if (!res.ok) {
      if ([502, 503, 504].includes(res.status)) {
        throw new Error(
          "The AutoBat server is temporarily unavailable. Please try again shortly."
        );
      }
      const detail = await res.json().catch(() => ({}));
      throw new Error(detail.message ?? `Request failed (${res.status})`);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    if (
      error instanceof Error &&
      error.name !== "AbortError" &&
      !(error instanceof TypeError)
    ) {
      throw error;
    }
    throw connectionError(error);
  } finally {
    clearTimeout(timeout);
  }
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
  movements: () => request<StockMovementRow[]>("/inventory/movements"),
  policies: () => request<PolicyRow[]>("/catalog/policies"),
  partners: () => request<PartnerRow[]>("/catalog/partners"),
  products: () => request<ProductRow[]>("/catalog/products"),
  claims: () => request<ClaimRow[]>("/claims"),
  partnerSummary: () => request<PartnerSummary>("/dashboard/partner"),
  activity: () => request<ActivityRow[]>("/dashboard/activity", { auth: false }),
  backdatedQueue: () => request<BackdatedRow[]>("/warranties/backdated", { auth: false }),
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
    request(`/ops/claims/${reference}`, { method: "PATCH", body: { stage } }),
  fileClaim: (body: {
    serialNumber: string;
    customerMobile: string;
    reason: string;
    remarks?: string;
  }) =>
    request<{ reference: string; stage: string; overSla: boolean }>("/claims", {
      method: "POST",
      body
    }),
  decideBackdated: (id: string, decision: "APPROVE" | "REJECT") =>
    request<{ id: string; status: string }>(`/ops/backdated/${id}`, {
      method: "PATCH",
      body: { decision }
    })
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

export type StockMovementRow = {
  id: string;
  type: string;
  from: string;
  to: string;
  quantity: number;
  reference: string;
  at: string;
};

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  family: string;
  voltage: string;
  capacity: string;
  policy: string;
  active: boolean;
};

export type ActivityRow = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityType: string;
  at: string;
};

export type BackdatedRow = {
  id: string;
  serialNumber: string;
  partner: string;
  purchaseDate: string;
  delayDays: number;
  reason: string;
};
