import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard, type AuthedRequest } from "../auth/auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("metrics")
  async metrics() {
    const [
      activeWarranties,
      pendingBackdated,
      inStock,
      inTransit,
      openClaims,
      overSlaClaims,
      soldUnits,
      partnerCount
    ] = await Promise.all([
      this.prisma.warranty.count({ where: { status: "ACTIVE" } }),
      this.prisma.warranty.count({ where: { backdated: true, status: "PENDING" } }),
      this.prisma.battery.count({ where: { status: "IN_STOCK" } }),
      this.prisma.battery.count({ where: { status: "IN_TRANSIT" } }),
      this.prisma.claim.count({ where: { stage: { notIn: ["APPROVED", "REJECTED", "REPLACED"] } } }),
      this.prisma.claim.count({ where: { overSla: true } }),
      this.prisma.battery.count({ where: { status: "SOLD" } }),
      this.prisma.organization.count({ where: { type: { not: "AUTOBAT" }, active: true } })
    ]);

    const totalClaims = await this.prisma.claim.count();
    const approvedClaims = await this.prisma.claim.count({
      where: { stage: { in: ["APPROVED", "REPLACED"] } }
    });
    const approvalRate =
      totalClaims === 0 ? 0 : Math.round((approvedClaims / totalClaims) * 100);

    return {
      warranty: {
        active: activeWarranties,
        pendingBackdated
      },
      sales: {
        soldUnits,
        partnerCount
      },
      stock: {
        inStock,
        inTransit
      },
      claims: {
        open: openClaims,
        overSla: overSlaClaims,
        approvalRate
      }
    };
  }

  @Get("activity")
  async activity() {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12
    });

    return logs.map((log) => ({
      id: log.id,
      actor: log.actorLabel ?? "system",
      action: log.action,
      entity: log.entityId,
      entityType: log.entityType,
      at: log.createdAt.toISOString()
    }));
  }

  @Get("partner")
  @UseGuards(AuthGuard)
  async partner(@Req() req: AuthedRequest) {
    const orgId = req.user.orgId;
    if (!orgId) {
      return {
        stock: 0,
        pendingWarranty: 0,
        openClaims: 0,
        expiringSoon: 0,
        notifications: 0
      };
    }

    const now = new Date();
    const inThirtyDays = new Date(now);
    inThirtyDays.setUTCDate(inThirtyDays.getUTCDate() + 30);

    const [stock, pendingWarranty, openClaims, expiringSoon] =
      await Promise.all([
        this.prisma.battery.count({
          where: { holderId: orgId, status: "IN_STOCK" }
        }),
        this.prisma.warranty.count({
          where: {
            battery: { holderId: orgId },
            status: "PENDING"
          }
        }),
        this.prisma.claim.count({
          where: {
            partnerId: orgId,
            stage: { notIn: ["APPROVED", "REJECTED", "REPLACED"] }
          }
        }),
        this.prisma.warranty.count({
          where: {
            battery: { holderId: orgId },
            status: "ACTIVE",
            expiryDate: { gte: now, lte: inThirtyDays }
          }
        })
      ]);

    return {
      stock,
      pendingWarranty,
      openClaims,
      expiringSoon,
      notifications: pendingWarranty + openClaims
    };
  }
}
