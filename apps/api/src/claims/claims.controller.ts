import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";
import { AuthGuard, Roles, type AuthedRequest } from "../auth/auth.guard";
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

  // --- DEALER / DISTRIBUTOR: file a new warranty claim for a battery ---
  @Post()
  @Roles("DEALER", "DISTRIBUTOR")
  async create(
    @Body()
    body: { serialNumber?: string; customerMobile?: string; reason?: string; remarks?: string },
    @Req() req: AuthedRequest
  ) {
    if (!body.serialNumber || !body.customerMobile || !body.reason) {
      throw new BadRequestException(
        "serialNumber, customerMobile, and reason are required"
      );
    }
    if (!/^[6-9]\d{9}$/.test(body.customerMobile)) {
      throw new BadRequestException("Invalid customer mobile");
    }
    if (!req.user.orgId) {
      throw new BadRequestException("User has no organization");
    }

    const battery = await this.prisma.battery.findUnique({
      where: { serialNumber: body.serialNumber },
      include: { warranties: { orderBy: { createdAt: "desc" }, take: 1 } }
    });
    if (!battery) throw new BadRequestException("Unknown serial number");

    const warranty = battery.warranties[0];
    if (!warranty) {
      throw new BadRequestException(
        "No warranty registered for this battery; register the sale first"
      );
    }

    // Block duplicate open claims on the same battery.
    const existingOpen = await this.prisma.claim.findFirst({
      where: {
        batteryId: battery.id,
        stage: { notIn: ["APPROVED", "REJECTED", "REPLACED"] }
      }
    });
    if (existingOpen) {
      throw new BadRequestException(
        `An open claim (${existingOpen.reference}) already exists for this battery`
      );
    }

    // SLA breached if the warranty is already past expiry at filing time.
    const overSla = new Date() > warranty.expiryDate;
    const reference = `CLM-${Date.now().toString().slice(-7)}`;

    const claim = await this.prisma.claim.create({
      data: {
        reference,
        batteryId: battery.id,
        partnerId: req.user.orgId,
        customerMobile: body.customerMobile,
        reason: body.reason,
        remarks: body.remarks ?? null,
        stage: "SUBMITTED",
        overSla
      }
    });

    await this.prisma.battery.update({
      where: { id: battery.id },
      data: { status: "UNDER_CLAIM" }
    });

    const actor = await this.prisma.user.findUnique({
      where: { id: req.user.sub }
    });
    await this.prisma.auditLog.create({
      data: {
        actorId: req.user.sub,
        actorLabel: actor?.name ?? req.user.role,
        action: "filed a warranty claim",
        entityType: "Claim",
        entityId: reference
      }
    });

    return { reference: claim.reference, stage: claim.stage, overSla };
  }
}
