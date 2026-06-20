import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { WarrantyController } from "./warranty/warranty.controller";
import { WarrantyService } from "./warranty/warranty.service";
import { CatalogController } from "./catalog/catalog.controller";
import { InventoryController } from "./inventory/inventory.controller";
import { ClaimsController } from "./claims/claims.controller";
import { DashboardController } from "./dashboard/dashboard.controller";
import { AuthController } from "./auth/auth.controller";
import { OperationsController } from "./operations/operations.controller";

@Module({
  imports: [PrismaModule],
  controllers: [
    HealthController,
    AuthController,
    WarrantyController,
    CatalogController,
    InventoryController,
    ClaimsController,
    DashboardController,
    OperationsController
  ],
  providers: [WarrantyService]
})
export class AppModule {}
