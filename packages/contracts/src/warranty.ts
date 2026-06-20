export type WarrantyPolicy = {
  id: string;
  productName: string;
  policyName: string;
  version: number;
  freeReplacementMonths: number;
  totalWarrantyMonths: number;
  registrationWindowDays: number;
  isDraft: boolean;
};

export type WarrantyCalculationInput = {
  policy: WarrantyPolicy;
  purchaseDate: string;
  activationDate: string;
  asOfDate: string;
};

export type WarrantyCalculation = {
  warrantyStartDate: string;
  freeReplacementEndDate: string;
  proRataStartDate: string | null;
  expiryDate: string;
  phase:
    | "PENDING"
    | "FREE_REPLACEMENT"
    | "PRO_RATA"
    | "EXPIRED"
    | "VOID";
  daysRemaining: number;
  registrationDelayDays: number;
  registrationWithinWindow: boolean;
  explanation: string[];
};

// These values are placeholders derived only from public total-warranty claims.
// AutoBat must approve the free-replacement split and registration window.
export const DRAFT_WARRANTY_POLICIES: WarrantyPolicy[] = [
  {
    id: "draft-invasol-60",
    productName: "Inva-Sol",
    policyName: "Draft 60-month policy",
    version: 1,
    freeReplacementMonths: 36,
    totalWarrantyMonths: 60,
    registrationWindowDays: 7,
    isDraft: true
  },
  {
    id: "draft-automotive-36",
    productName: "Automotive",
    policyName: "Draft 36-month policy",
    version: 1,
    freeReplacementMonths: 18,
    totalWarrantyMonths: 36,
    registrationWindowDays: 7,
    isDraft: true
  },
  {
    id: "draft-ev-36",
    productName: "Electric 2/3 Wheeler",
    policyName: "Draft 36-month policy",
    version: 1,
    freeReplacementMonths: 18,
    totalWarrantyMonths: 36,
    registrationWindowDays: 7,
    isDraft: true
  }
];

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid date: ${value}`);
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month! - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date: ${value}`);
  }

  return date;
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function addMonthsClamped(date: Date, months: number): Date {
  const targetMonth = date.getUTCMonth() + months;
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(
    Date.UTC(targetYear, normalizedMonth + 1, 0)
  ).getUTCDate();

  return new Date(
    Date.UTC(targetYear, normalizedMonth, Math.min(date.getUTCDate(), lastDay))
  );
}

function differenceInDays(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / DAY_MS);
}

export function calculateWarranty(
  input: WarrantyCalculationInput
): WarrantyCalculation {
  const { policy } = input;

  if (policy.freeReplacementMonths < 0) {
    throw new Error("Free-replacement months cannot be negative");
  }

  if (policy.totalWarrantyMonths <= 0) {
    throw new Error("Total warranty months must be positive");
  }

  if (policy.freeReplacementMonths > policy.totalWarrantyMonths) {
    throw new Error("Free-replacement period cannot exceed total warranty");
  }

  const purchaseDate = parseDateOnly(input.purchaseDate);
  const activationDate = parseDateOnly(input.activationDate);
  const asOfDate = parseDateOnly(input.asOfDate);

  if (activationDate < purchaseDate) {
    throw new Error("Activation date cannot precede purchase date");
  }

  const freeReplacementEnd = addDays(
    addMonthsClamped(purchaseDate, policy.freeReplacementMonths),
    -1
  );
  const expiryDate = addDays(
    addMonthsClamped(purchaseDate, policy.totalWarrantyMonths),
    -1
  );
  const hasProRata =
    policy.freeReplacementMonths < policy.totalWarrantyMonths;
  const proRataStart = hasProRata ? addDays(freeReplacementEnd, 1) : null;
  const registrationDelayDays = differenceInDays(
    activationDate,
    purchaseDate
  );

  let phase: WarrantyCalculation["phase"];

  if (asOfDate < purchaseDate) {
    phase = "PENDING";
  } else if (asOfDate <= freeReplacementEnd) {
    phase = "FREE_REPLACEMENT";
  } else if (hasProRata && asOfDate <= expiryDate) {
    phase = "PRO_RATA";
  } else {
    phase = "EXPIRED";
  }

  return {
    warrantyStartDate: formatDateOnly(purchaseDate),
    freeReplacementEndDate: formatDateOnly(freeReplacementEnd),
    proRataStartDate: proRataStart ? formatDateOnly(proRataStart) : null,
    expiryDate: formatDateOnly(expiryDate),
    phase,
    daysRemaining:
      asOfDate <= expiryDate
        ? Math.max(0, differenceInDays(expiryDate, asOfDate))
        : 0,
    registrationDelayDays,
    registrationWithinWindow:
      registrationDelayDays <= policy.registrationWindowDays,
    explanation: [
      `Policy ${policy.policyName}, version ${policy.version}`,
      `Warranty starts on customer purchase date ${input.purchaseDate}`,
      `${policy.freeReplacementMonths} months free replacement`,
      `${policy.totalWarrantyMonths} months total warranty`,
      `Registered ${registrationDelayDays} day(s) after purchase`
    ]
  };
}

