import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("inventory")
export class InventoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("units")
  async units() {
    const batteries = await this.prisma.battery.findMany({
      orderBy: { updatedAt: "desc" },
      include: { product: true, holder: true }
    });

    return batteries.map((b) => ({
      serialNumber: b.serialNumber,
      product: b.product.name,
      status: b.status,
      holder: b.holder?.name ?? "Unassigned",
      updatedAt: b.updatedAt.toISOString().slice(0, 10)
    }));
  }

  @Get("movements")
  async movements() {
    const movements = await this.prisma.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      include: { fromOrg: true, toOrg: true }
    });

    return movements.map((m) => ({
      id: m.id,
      type: m.type,
      from: m.fromOrg?.name ?? "AutoBat",
      to: m.toOrg?.name ?? "Customer",
      quantity: m.quantity,
      reference: m.reference ?? "—",
      at: m.createdAt.toISOString().slice(0, 10)
    }));
  }
}
