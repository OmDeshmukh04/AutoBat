-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "region" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "voltage" TEXT,
    "capacity" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WarrantyPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "effectiveFrom" DATETIME NOT NULL,
    "effectiveTo" DATETIME,
    "freeReplacementMonths" INTEGER NOT NULL,
    "totalWarrantyMonths" INTEGER NOT NULL,
    "registrationWindowDays" INTEGER NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "rules" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WarrantyPolicy_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Battery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serialNumber" TEXT NOT NULL,
    "qrValue" TEXT,
    "productId" TEXT NOT NULL,
    "holderId" TEXT,
    "manufactureDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'MANUFACTURED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Battery_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Battery_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Warranty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batteryId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "customerMobile" TEXT NOT NULL,
    "purchaseDate" DATETIME NOT NULL,
    "activationDate" DATETIME NOT NULL,
    "freeReplacementEndDate" DATETIME NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "policySnapshot" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "backdated" BOOLEAN NOT NULL DEFAULT false,
    "registrationDelayDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Warranty_batteryId_fkey" FOREIGN KEY ("batteryId") REFERENCES "Battery" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Warranty_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "WarrantyPolicy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "fromOrgId" TEXT,
    "toOrgId" TEXT,
    "quantity" INTEGER NOT NULL,
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_fromOrgId_fkey" FOREIGN KEY ("fromOrgId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_toOrgId_fkey" FOREIGN KEY ("toOrgId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "batteryId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "customerMobile" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "overSla" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Claim_batteryId_fkey" FOREIGN KEY ("batteryId") REFERENCES "Battery" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Claim_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "actorLabel" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "Organization"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "WarrantyPolicy_productId_effectiveFrom_idx" ON "WarrantyPolicy"("productId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "WarrantyPolicy_productId_version_key" ON "WarrantyPolicy"("productId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Battery_serialNumber_key" ON "Battery"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Battery_qrValue_key" ON "Battery"("qrValue");

-- CreateIndex
CREATE INDEX "Battery_status_idx" ON "Battery"("status");

-- CreateIndex
CREATE INDEX "Battery_holderId_idx" ON "Battery"("holderId");

-- CreateIndex
CREATE INDEX "Warranty_customerMobile_idx" ON "Warranty"("customerMobile");

-- CreateIndex
CREATE INDEX "Warranty_batteryId_status_idx" ON "Warranty"("batteryId", "status");

-- CreateIndex
CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_reference_key" ON "Claim"("reference");

-- CreateIndex
CREATE INDEX "Claim_stage_idx" ON "Claim"("stage");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
