import { describe, expect, it } from "vitest";
import { calculateWarranty, type WarrantyPolicy } from "./warranty";

const policy: WarrantyPolicy = {
  id: "test-60",
  productName: "Test Battery",
  policyName: "Test policy",
  version: 1,
  freeReplacementMonths: 36,
  totalWarrantyMonths: 60,
  registrationWindowDays: 7,
  isDraft: false
};

describe("calculateWarranty", () => {
  it("calculates free-replacement and total expiry dates", () => {
    const result = calculateWarranty({
      policy,
      purchaseDate: "2026-06-18",
      activationDate: "2026-06-20",
      asOfDate: "2026-06-20"
    });

    expect(result.freeReplacementEndDate).toBe("2029-06-17");
    expect(result.proRataStartDate).toBe("2029-06-18");
    expect(result.expiryDate).toBe("2031-06-17");
    expect(result.phase).toBe("FREE_REPLACEMENT");
    expect(result.registrationWithinWindow).toBe(true);
  });

  it("uses the pro-rata phase after free replacement ends", () => {
    const result = calculateWarranty({
      policy,
      purchaseDate: "2026-06-18",
      activationDate: "2026-06-18",
      asOfDate: "2029-06-18"
    });

    expect(result.phase).toBe("PRO_RATA");
  });

  it("clamps month-end dates safely across February", () => {
    const result = calculateWarranty({
      policy: {
        ...policy,
        freeReplacementMonths: 1,
        totalWarrantyMonths: 1
      },
      purchaseDate: "2028-01-31",
      activationDate: "2028-01-31",
      asOfDate: "2028-02-28"
    });

    expect(result.freeReplacementEndDate).toBe("2028-02-28");
    expect(result.expiryDate).toBe("2028-02-28");
    expect(result.phase).toBe("FREE_REPLACEMENT");
  });

  it("marks registration outside the configured window", () => {
    const result = calculateWarranty({
      policy,
      purchaseDate: "2026-06-01",
      activationDate: "2026-06-10",
      asOfDate: "2026-06-10"
    });

    expect(result.registrationDelayDays).toBe(9);
    expect(result.registrationWithinWindow).toBe(false);
  });

  it("rejects activation before purchase", () => {
    expect(() =>
      calculateWarranty({
        policy,
        purchaseDate: "2026-06-18",
        activationDate: "2026-06-17",
        asOfDate: "2026-06-18"
      })
    ).toThrow("Activation date cannot precede purchase date");
  });
});

