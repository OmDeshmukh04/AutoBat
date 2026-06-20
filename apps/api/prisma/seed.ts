import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(days: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

async function main() {
  // Idempotent: clear in dependency order so re-seeding is safe.
  await prisma.otpChallenge.deleteMany();
  await prisma.user.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.warranty.deleteMany();
  await prisma.battery.deleteMany();
  await prisma.warrantyPolicy.deleteMany();
  await prisma.product.deleteMany();
  await prisma.organization.deleteMany();

  // --- Organizations ---
  const autobat = await prisma.organization.create({
    data: { name: "AutoBat HQ", type: "AUTOBAT", code: "AB-HQ", region: "HQ", stock: 0 }
  });
  const westHub = await prisma.organization.create({
    data: {
      name: "West Hub Distributor",
      type: "DISTRIBUTOR",
      code: "DST-0007",
      region: "West",
      stock: 6120
    }
  });
  const sharda = await prisma.organization.create({
    data: { name: "Sharda Auto", type: "DEALER", code: "DLR-0421", region: "Pune", stock: 312 }
  });
  const verma = await prisma.organization.create({
    data: { name: "Verma Batteries", type: "DEALER", code: "DLR-0188", region: "Nagpur", stock: 44 }
  });
  const citywide = await prisma.organization.create({
    data: {
      name: "Citywide Service Point",
      type: "SERVICE_POINT",
      code: "SVC-0033",
      region: "Mumbai",
      stock: 18
    }
  });
  const newStar = await prisma.organization.create({
    data: { name: "New Star Motors", type: "DEALER", code: "DLR-0533", region: "Nashik", stock: 90 }
  });
  await prisma.organization.create({
    data: {
      name: "GreenCell Recycler",
      type: "RECYCLER",
      code: "RCY-0002",
      region: "West",
      stock: 0,
      active: false
    }
  });

  // --- Products ---
  const invaSol = await prisma.product.create({
    data: {
      sku: "INV-SOL-150",
      name: "Inva-Sol 150Ah",
      family: "Inva-Sol",
      voltage: "12V",
      capacity: "150Ah"
    }
  });
  const automotive = await prisma.product.create({
    data: {
      sku: "AUTO-DIN-65",
      name: "Automotive DIN65",
      family: "Automotive",
      voltage: "12V",
      capacity: "65Ah"
    }
  });
  const ev = await prisma.product.create({
    data: { sku: "EV-2W-30", name: "EV 2W 30Ah", family: "Electric 2/3 Wheeler", voltage: "48V", capacity: "30Ah" }
  });

  // --- Warranty policies ---
  const invaPolicy = await prisma.warrantyPolicy.create({
    data: {
      productId: invaSol.id,
      name: "Draft 60-month policy",
      version: 1,
      effectiveFrom: daysAgo(365),
      freeReplacementMonths: 36,
      totalWarrantyMonths: 60,
      registrationWindowDays: 7,
      isDraft: true,
      rules: { proRata: true }
    }
  });
  const autoPolicy = await prisma.warrantyPolicy.create({
    data: {
      productId: automotive.id,
      name: "Draft 36-month policy",
      version: 1,
      effectiveFrom: daysAgo(365),
      freeReplacementMonths: 18,
      totalWarrantyMonths: 36,
      registrationWindowDays: 7,
      isDraft: true,
      rules: { proRata: true }
    }
  });
  await prisma.warrantyPolicy.create({
    data: {
      productId: ev.id,
      name: "Draft 36-month policy",
      version: 1,
      effectiveFrom: daysAgo(365),
      freeReplacementMonths: 18,
      totalWarrantyMonths: 36,
      registrationWindowDays: 7,
      isDraft: true,
      rules: { proRata: true }
    }
  });

  // --- Batteries (serialized inventory) ---
  const batteries = [
    { serialNumber: "AB24-009183", productId: invaSol.id, holderId: sharda.id, status: "SOLD", updatedAt: daysAgo(0) },
    { serialNumber: "AB24-009184", productId: invaSol.id, holderId: sharda.id, status: "IN_STOCK", updatedAt: daysAgo(1) },
    { serialNumber: "AB24-007710", productId: automotive.id, holderId: westHub.id, status: "IN_TRANSIT", updatedAt: daysAgo(1) },
    { serialNumber: "AB24-004410", productId: ev.id, holderId: citywide.id, status: "UNDER_CLAIM", updatedAt: daysAgo(2) },
    { serialNumber: "AB24-001002", productId: automotive.id, holderId: verma.id, status: "REPLACED", updatedAt: daysAgo(4) },
    { serialNumber: "AB24-003991", productId: invaSol.id, holderId: sharda.id, status: "UNDER_CLAIM", updatedAt: daysAgo(6) },
    { serialNumber: "AB24-002250", productId: invaSol.id, holderId: citywide.id, status: "UNDER_CLAIM", updatedAt: daysAgo(1) },
    { serialNumber: "AB24-008120", productId: invaSol.id, holderId: sharda.id, status: "SOLD", updatedAt: daysAgo(13) }
  ];
  const batteryByserial: Record<string, string> = {};
  for (const b of batteries) {
    const created = await prisma.battery.create({
      data: {
        serialNumber: b.serialNumber,
        qrValue: `QR-${b.serialNumber}`,
        productId: b.productId,
        holderId: b.holderId,
        status: b.status,
        manufactureDate: daysAgo(120),
        updatedAt: b.updatedAt
      }
    });
    batteryByserial[b.serialNumber] = created.id;
  }

  // --- Warranties ---
  const purchase = daysAgo(20);
  await prisma.warranty.create({
    data: {
      batteryId: batteryByserial["AB24-009183"]!,
      policyId: invaPolicy.id,
      customerMobile: "9800000021",
      purchaseDate: purchase,
      activationDate: daysAgo(20),
      freeReplacementEndDate: addMonths(purchase, 36),
      expiryDate: addMonths(purchase, 60),
      status: "ACTIVE",
      registrationDelayDays: 0,
      policySnapshot: { freeReplacementMonths: 36, totalWarrantyMonths: 60 }
    }
  });

  // A backdated registration awaiting approval.
  const backdatedPurchase = daysAgo(13);
  await prisma.warranty.create({
    data: {
      batteryId: batteryByserial["AB24-008120"]!,
      policyId: invaPolicy.id,
      customerMobile: "9700000004",
      purchaseDate: backdatedPurchase,
      activationDate: daysAgo(0),
      freeReplacementEndDate: addMonths(backdatedPurchase, 36),
      expiryDate: addMonths(backdatedPurchase, 60),
      status: "PENDING",
      backdated: true,
      registrationDelayDays: 13,
      policySnapshot: { freeReplacementMonths: 36, totalWarrantyMonths: 60 }
    }
  });

  // --- Stock movements ---
  await prisma.stockMovement.createMany({
    data: [
      { type: "DISPATCH", fromOrgId: autobat.id, toOrgId: westHub.id, quantity: 2000, reference: "DSP-1001" },
      { type: "TRANSFER", fromOrgId: westHub.id, toOrgId: sharda.id, quantity: 240, reference: "TRF-2087" },
      { type: "SALE", fromOrgId: sharda.id, toOrgId: null, quantity: 1, reference: "AB24-009183" },
      { type: "RETURN", fromOrgId: verma.id, toOrgId: westHub.id, quantity: 1, reference: "RET-0042" }
    ]
  });

  // --- Claims ---
  await prisma.claim.createMany({
    data: [
      {
        reference: "CLM-20614",
        batteryId: batteryByserial["AB24-004410"]!,
        partnerId: verma.id,
        customerMobile: "9800000021",
        reason: "Not holding charge",
        stage: "UNDER_REVIEW",
        overSla: false
      },
      {
        reference: "CLM-20598",
        batteryId: batteryByserial["AB24-003991"]!,
        partnerId: sharda.id,
        customerMobile: "9700000004",
        reason: "Bulging case",
        stage: "FIELD_TEST",
        overSla: true,
        inspectionScheduledAt: daysAgo(-2),
        diagnostics: {
          ocv: "12.48 V",
          soc: "78%",
          cca: "612 A",
          soh: "82%",
          internalResistance: "5.12 mOhm",
          temperature: "31 C"
        },
        remarks: "Customer reported slow cranking and dim lights.",
        evidence: ["battery-label.jpg", "test-setup.jpg"]
      },
      {
        reference: "CLM-20571",
        batteryId: batteryByserial["AB24-002250"]!,
        partnerId: citywide.id,
        customerMobile: "9600000088",
        reason: "Dead cell",
        stage: "SUBMITTED",
        overSla: false
      },
      {
        reference: "CLM-20540",
        batteryId: batteryByserial["AB24-001002"]!,
        partnerId: verma.id,
        customerMobile: "9900000013",
        reason: "Low backup",
        stage: "APPROVED",
        overSla: true
      }
    ]
  });

  // --- Audit log ---
  await prisma.auditLog.createMany({
    data: [
      { actorLabel: "Sharda Auto (DLR-0421)", action: "registered warranty for", entityType: "Battery", entityId: "AB24-009183", metadata: {} },
      { actorLabel: "Verma Batteries (DLR-0188)", action: "submitted claim", entityType: "Claim", entityId: "CLM-20614", metadata: {} },
      { actorLabel: "West Hub Distributor", action: "transferred 240 units to DLR-0421", entityType: "StockMovement", entityId: "TRF-2087", metadata: {} },
      { actorLabel: "admin@autobat", action: "published policy", entityType: "WarrantyPolicy", entityId: "Inva-Sol v1", metadata: {} }
    ]
  });

  // --- Users (one per role for RBAC testing). Mock OTP is always 123456. ---
  await prisma.user.createMany({
    data: [
      { name: "Ops Admin", mobile: "9000000001", email: "admin@autobat.in", role: "ADMIN", orgId: autobat.id },
      { name: "West Hub Manager", mobile: "9000000002", role: "DISTRIBUTOR", orgId: westHub.id },
      { name: "Sharda Dealer", mobile: "9000000003", role: "DEALER", orgId: sharda.id },
      { name: "Delivery Rider", mobile: "9000000004", role: "DELIVERY", orgId: westHub.id },
      { name: "Citywide Technician", mobile: "9000000005", role: "SERVICE", orgId: citywide.id }
    ]
  });

  console.log("Seed complete.");
  console.log("Login mobiles (OTP is always 123456):");
  console.log("  ADMIN        9000000001");
  console.log("  DISTRIBUTOR  9000000002");
  console.log("  DEALER       9000000003");
  console.log("  DELIVERY     9000000004");
  console.log("  SERVICE      9000000005");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
