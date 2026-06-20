import { z } from "zod";

export * from "./warranty";

export const roleSchema = z.enum([
  "ADMIN",
  "DISTRIBUTOR",
  "DEALER",
  "DELIVERY",
  "SERVICE"
]);

export type Role = z.infer<typeof roleSchema>;

export const otpRequestSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/)
});

export const otpVerifySchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  code: z.string().regex(/^\d{6}$/)
});

export type AuthUser = {
  id: string;
  name: string;
  mobile: string;
  role: Role;
  orgId: string | null;
  orgName: string | null;
};

export const batteryStatusSchema = z.enum([
  "MANUFACTURED",
  "IN_STOCK",
  "IN_TRANSIT",
  "SOLD",
  "UNDER_CLAIM",
  "REPLACED",
  "RETURNED",
  "RECYCLED"
]);

export const warrantyPhaseSchema = z.enum([
  "PENDING",
  "FREE_REPLACEMENT",
  "PRO_RATA",
  "EXPIRED",
  "VOID"
]);

export const warrantyPreviewInputSchema = z.object({
  serialNumber: z.string().trim().min(1).max(100),
  policyId: z.string().trim().min(1).max(100),
  purchaseDate: z.string().date(),
  customerMobile: z.string().regex(/^[6-9]\d{9}$/),
  stateCode: z.string().trim().min(2).max(3).optional(),
  application: z.string().trim().min(1).max(100)
});

export const warrantySummarySchema = z.object({
  warrantyId: z.string(),
  serialNumber: z.string(),
  productName: z.string(),
  purchaseDate: z.string().date(),
  activationDate: z.string().datetime(),
  freeReplacementEndDate: z.string().date(),
  expiryDate: z.string().date(),
  phase: warrantyPhaseSchema,
  daysRemaining: z.number().int().nonnegative()
});

export type BatteryStatus = z.infer<typeof batteryStatusSchema>;
export type WarrantyPhase = z.infer<typeof warrantyPhaseSchema>;
export type WarrantyPreviewInput = z.infer<typeof warrantyPreviewInputSchema>;
export type WarrantySummary = z.infer<typeof warrantySummarySchema>;
