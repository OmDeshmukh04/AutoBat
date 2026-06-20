import { warrantyPreviewInputSchema } from "@autobat/contracts";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WarrantyService } from "./warranty.service";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

@Controller("warranties")
export class WarrantyController {
  constructor(
    private readonly warrantyService: WarrantyService,
    private readonly prisma: PrismaService
  ) {}

  @Get("draft-policies")
  listDraftPolicies() {
    return this.warrantyService.listDraftPolicies();
  }

  @Get("serial/:serialNumber")
  async bySerial(@Param("serialNumber") serialNumber: string) {
    const battery = await this.prisma.battery.findUnique({
      where: { serialNumber },
      include: {
        product: true,
        holder: true,
        warranties: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    const warranty = battery?.warranties[0];
    if (!battery || !warranty) {
      throw new NotFoundException("No registered warranty found for this serial");
    }

    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((warranty.expiryDate.getTime() - now.getTime()) / 86400000)
    );
    const phase =
      now > warranty.expiryDate
        ? "EXPIRED"
        : now <= warranty.freeReplacementEndDate
          ? "FREE_REPLACEMENT"
          : "PRO_RATA";

    return {
      warrantyId: warranty.id,
      serialNumber: battery.serialNumber,
      productName: battery.product.name,
      status: warranty.status,
      phase,
      daysRemaining,
      customerMobile: warranty.customerMobile,
      purchaseDate: warranty.purchaseDate.toISOString().slice(0, 10),
      activationDate: warranty.activationDate.toISOString().slice(0, 10),
      freeReplacementEndDate: warranty.freeReplacementEndDate
        .toISOString()
        .slice(0, 10),
      expiryDate: warranty.expiryDate.toISOString().slice(0, 10),
      dealerName: battery.holder?.name ?? "Unknown dealer",
      dealerCode: battery.holder?.code ?? "-"
    };
  }

  @Get("backdated")
  async backdated() {
    const requests = await this.prisma.warranty.findMany({
      where: { backdated: true, status: "PENDING" },
      orderBy: { registrationDelayDays: "desc" },
      include: { battery: { include: { holder: true } } }
    });

    return requests.map((w) => ({
      id: w.id,
      serialNumber: w.battery.serialNumber,
      partner: w.battery.holder?.name ?? "Unknown",
      purchaseDate: w.purchaseDate.toISOString().slice(0, 10),
      delayDays: w.registrationDelayDays,
      reason: "Submitted outside registration window"
    }));
  }

  @Post("preview")
  preview(@Body() body: unknown) {
    const parsed = warrantyPreviewInputSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException({
        message: "Invalid warranty preview request",
        issues: parsed.error.flatten()
      });
    }

    try {
      return this.warrantyService.preview(parsed.data, todayUtc());
    } catch (error) {
      if (error instanceof Error && error.message.includes("date")) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
