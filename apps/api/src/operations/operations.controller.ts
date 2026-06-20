import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthGuard, Roles, type AuthedRequest } from "../auth/auth.guard";

@Controller("ops")
@UseGuards(AuthGuard)
export class OperationsController {
  constructor(private readonly prisma: PrismaService) {}

  private async audit(
    req: AuthedRequest,
    action: string,
    entityType: string,
    entityId: string
  ) {
    const actor = await this.prisma.user.findUnique({
      where: { id: req.user.sub }
    });
    await this.prisma.auditLog.create({
      data: {
        actorId: req.user.sub,
        actorLabel: actor?.name ?? req.user.role,
        action,
        entityType,
        entityId
      }
    });
  }

  // --- ADMIN: approve or reject a backdated warranty registration ---
  @Patch("backdated/:id")
  @Roles("ADMIN")
  async decideBackdated(
    @Param("id") id: string,
    @Body() body: { decision?: string },
    @Req() req: AuthedRequest
  ) {
    if (body.decision !== "APPROVE" && body.decision !== "REJECT") {
      throw new BadRequestException("decision must be APPROVE or REJECT");
    }
    const status = body.decision === "APPROVE" ? "ACTIVE" : "VOID";
    const warranty = await this.prisma.warranty.update({
      where: { id },
      data: { status, backdated: false }
    });
    await this.audit(req, `${body.decision.toLowerCase()}d backdated registration`, "Warranty", id);
    return { id: warranty.id, status: warranty.status };
  }

  // --- ADMIN / SERVICE: advance a claim through its stages ---
  @Patch("claims/:reference")
  @Roles("ADMIN", "SERVICE")
  async decideClaim(
    @Param("reference") reference: string,
    @Body() body: { stage?: string },
    @Req() req: AuthedRequest
  ) {
    const allowed = ["UNDER_REVIEW", "FIELD_TEST", "APPROVED", "REJECTED", "REPLACED"];
    if (!body.stage || !allowed.includes(body.stage)) {
      throw new BadRequestException(`stage must be one of ${allowed.join(", ")}`);
    }
    const claim = await this.prisma.claim.update({
      where: { reference },
      data: { stage: body.stage }
    });
    await this.audit(req, `moved claim to ${body.stage.toLowerCase()}`, "Claim", reference);
    return { reference: claim.reference, stage: claim.stage };
  }

  // --- DEALER: register a customer sale for a battery in hand ---
  @Post("sales")
  @Roles("DEALER")
  async registerSale(
    @Body() body: { serialNumber?: string; customerMobile?: string; policyId?: string; purchaseDate?: string },
    @Req() req: AuthedRequest
  ) {
    if (!body.serialNumber || !body.customerMobile || !body.policyId) {
      throw new BadRequestException("serialNumber, customerMobile, policyId required");
    }
    if (!/^[6-9]\d{9}$/.test(body.customerMobile)) {
      throw new BadRequestException("Invalid customer mobile");
    }

    const battery = await this.prisma.battery.findUnique({
      where: { serialNumber: body.serialNumber }
    });
    if (!battery) throw new BadRequestException("Unknown serial number");
    if (battery.holderId !== req.user.orgId) {
      throw new BadRequestException("Battery is not in your inventory");
    }
    if (battery.status === "SOLD") {
      throw new BadRequestException("Battery already sold");
    }

    const policy = await this.prisma.warrantyPolicy.findUnique({
      where: { id: body.policyId }
    });
    if (!policy) throw new BadRequestException("Unknown policy");

    const purchase = body.purchaseDate ? new Date(body.purchaseDate) : new Date();
    const free = new Date(purchase);
    free.setMonth(free.getMonth() + policy.freeReplacementMonths);
    const expiry = new Date(purchase);
    expiry.setMonth(expiry.getMonth() + policy.totalWarrantyMonths);
    const delayDays = Math.max(
      0,
      Math.floor((Date.now() - purchase.getTime()) / 86400000)
    );
    const backdated = delayDays > policy.registrationWindowDays;

    const warranty = await this.prisma.warranty.create({
      data: {
        batteryId: battery.id,
        policyId: policy.id,
        customerMobile: body.customerMobile,
        purchaseDate: purchase,
        activationDate: new Date(),
        freeReplacementEndDate: free,
        expiryDate: expiry,
        status: backdated ? "PENDING" : "ACTIVE",
        backdated,
        registrationDelayDays: delayDays,
        policySnapshot: {
          freeReplacementMonths: policy.freeReplacementMonths,
          totalWarrantyMonths: policy.totalWarrantyMonths
        }
      }
    });

    await this.prisma.battery.update({
      where: { id: battery.id },
      data: { status: "SOLD" }
    });
    await this.audit(req, "registered warranty for", "Battery", battery.serialNumber);

    return {
      warrantyId: warranty.id,
      status: warranty.status,
      backdated,
      expiryDate: expiry.toISOString().slice(0, 10)
    };
  }

  // --- DISTRIBUTOR / DEALER: transfer stock to another org ---
  @Post("transfers")
  @Roles("DISTRIBUTOR", "DEALER")
  async transfer(
    @Body() body: { toOrgId?: string; quantity?: number },
    @Req() req: AuthedRequest
  ) {
    if (!body.toOrgId || !body.quantity || body.quantity <= 0) {
      throw new BadRequestException("toOrgId and positive quantity required");
    }
    if (!req.user.orgId) throw new BadRequestException("User has no organization");

    const movement = await this.prisma.stockMovement.create({
      data: {
        type: "TRANSFER",
        fromOrgId: req.user.orgId,
        toOrgId: body.toOrgId,
        quantity: body.quantity,
        reference: `TRF-${Date.now().toString().slice(-6)}`
      }
    });
    await this.prisma.organization.update({
      where: { id: req.user.orgId },
      data: { stock: { decrement: body.quantity } }
    });
    await this.prisma.organization.update({
      where: { id: body.toOrgId },
      data: { stock: { increment: body.quantity } }
    });
    await this.audit(req, `transferred ${body.quantity} units`, "StockMovement", movement.reference ?? movement.id);

    return { id: movement.id, reference: movement.reference };
  }

  // --- DELIVERY: confirm a delivery (proof of delivery, simplified) ---
  @Post("deliveries/:serialNumber/deliver")
  @Roles("DELIVERY")
  async deliver(
    @Param("serialNumber") serialNumber: string,
    @Req() req: AuthedRequest
  ) {
    const battery = await this.prisma.battery.findUnique({
      where: { serialNumber }
    });
    if (!battery) throw new BadRequestException("Unknown serial number");

    await this.prisma.battery.update({
      where: { id: battery.id },
      data: { status: "IN_STOCK" }
    });
    await this.audit(req, "delivered battery", "Battery", serialNumber);
    return { serialNumber, status: "IN_STOCK" };
  }
}
