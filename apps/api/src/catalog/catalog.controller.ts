import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("catalog")
export class CatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("products")
  async products() {
    const products = await this.prisma.product.findMany({
      orderBy: { name: "asc" },
      include: {
        warrantyPolicies: { orderBy: { version: "desc" }, take: 1 }
      }
    });

    return products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      family: product.family,
      voltage: product.voltage ?? "",
      capacity: product.capacity ?? "",
      policy: product.warrantyPolicies[0]?.name ?? "—",
      active: product.active
    }));
  }

  @Get("partners")
  async partners() {
    const partners = await this.prisma.organization.findMany({
      where: { type: { not: "AUTOBAT" } },
      orderBy: { name: "asc" }
    });

    return partners.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      type: p.type,
      region: p.region ?? "—",
      stock: p.stock,
      active: p.active
    }));
  }

  @Get("policies")
  async policies() {
    const policies = await this.prisma.warrantyPolicy.findMany({
      orderBy: [{ name: "asc" }, { version: "desc" }],
      include: { product: true }
    });

    return policies.map((policy) => ({
      id: policy.id,
      productName: policy.product.name,
      policyName: policy.name,
      version: policy.version,
      freeReplacementMonths: policy.freeReplacementMonths,
      totalWarrantyMonths: policy.totalWarrantyMonths,
      registrationWindowDays: policy.registrationWindowDays,
      isDraft: policy.isDraft
    }));
  }
}
