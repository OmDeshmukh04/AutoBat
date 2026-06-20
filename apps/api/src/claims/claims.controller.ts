import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard, type AuthedRequest } from "../auth/auth.guard";
import { PrismaService } from "../prisma/prisma.service";

const STAGE_LABEL: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  FIELD_TEST: "Field test",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REPLACED: "Replaced"
};

function ageLabel(from: Date): string {
  const days = Math.max(
    0,
    Math.floor((Date.now() - from.getTime()) / (24 * 60 * 60 * 1000))
  );
  return `${days} d`;
}

function maskMobile(mobile: string): string {
  return mobile.length >= 4 ? `${mobile.slice(0, 2)}xxxxxx${mobile.slice(-2)}` : mobile;
}

@Controller("claims")
@UseGuards(AuthGuard)
export class ClaimsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Req() req: AuthedRequest) {
    const scopedToPartner =
      req.user.role !== "ADMIN" && req.user.role !== "SERVICE";

    const claims = await this.prisma.claim.findMany({
      ...(scopedToPartner
        ? { where: { partnerId: req.user.orgId ?? "__none__" } }
        : {}),
      orderBy: { createdAt: "desc" },
      include: { battery: { include: { product: true } }, partner: true }
    });

    return claims.map((c) => ({
      id: c.reference,
      serialNumber: c.battery.serialNumber,
      product: c.battery.product.name,
      customer: maskMobile(c.customerMobile),
      partner: c.partner.name,
      reason: c.reason,
      stage: STAGE_LABEL[c.stage] ?? c.stage,
      age: ageLabel(c.createdAt),
      overSla: c.overSla,
      createdAt: c.createdAt.toISOString().slice(0, 10),
      inspectionScheduledAt: c.inspectionScheduledAt?.toISOString().slice(0, 10) ?? null,
      diagnostics: c.diagnostics,
      remarks: c.remarks
    }));
  }
}
