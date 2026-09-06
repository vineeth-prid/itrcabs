import { ONE_DAY_INCLUDED_KM, MULTI_DAY_INCLUDED_KM, type VehicleSpec } from "@/config/fleet";

export interface PricingBreakdown {
  tripType: "ONE_DAY" | "MULTI_DAY";
  days: number;
  baseFare: number;
  driverBata: number;
  includedKm: number;
  extraKmRate: number;
  estimateTotal: number;
  bookingAmount: number;
  notes: string[];
}

/**
 * Nothing is collected on the website — a booking is an enquiry, and the team
 * takes payment on their own terms. This stays as the starting "collected"
 * figure on a new booking, which an admin edits at close-out.
 */
export const BOOKING_AMOUNT = 0;

/**
 * Pricing engine — mirrors the admin-configurable PricingConfig defaults.
 * One day: base fare with 80 km included.
 * Multi-day: per-day fare with 100 km/day included + driver bata per day.
 */
export function computePricing(
  vehicle: Pick<VehicleSpec, "basePrice" | "perDayPrice" | "extraKmRate" | "driverBata">,
  tripType: "ONE_DAY" | "MULTI_DAY",
  days = 1
): PricingBreakdown {
  const d = tripType === "ONE_DAY" ? 1 : Math.max(2, days);
  const baseFare = tripType === "ONE_DAY" ? vehicle.basePrice : vehicle.perDayPrice * d;
  const driverBata = tripType === "ONE_DAY" ? 0 : vehicle.driverBata * d;
  const includedKm = tripType === "ONE_DAY" ? ONE_DAY_INCLUDED_KM : MULTI_DAY_INCLUDED_KM * d;

  return {
    tripType,
    days: d,
    baseFare,
    driverBata,
    includedKm,
    extraKmRate: vehicle.extraKmRate,
    estimateTotal: baseFare + driverBata,
    bookingAmount: BOOKING_AMOUNT,
    notes: [
      `${includedKm} km included${tripType === "MULTI_DAY" ? ` (${MULTI_DAY_INCLUDED_KM} km/day)` : ""}`,
      `Additional km at ₹${vehicle.extraKmRate}/km`,
      "Parking & toll extra at actuals",
      "Night charges if applicable",
      "No payment online — we confirm and collect directly",
    ],
  };
}


/* ── Per-ride economics ──────────────────────────────────────────────
   The quoted fare is a MINIMUM, not the price. It buys a fixed kilometre
   allowance; what the trip actually costs is only known when it ends and the
   odometer reading goes in. So every trip has two states:

     open    — only the minimum is known. Figures are provisional.
     closed  — actual kilometres recorded. Fare, driver payout and margin
               are final, and the trip can be settled with the driver.

   The customer pays our rate card, the driver is paid a lower one, and both
   run off the same actual kilometres — so the margin follows the trip. */

/**
 * A cost incurred on the trip that is not part of the rate card — a toll, a
 * parking fee, an interstate permit, a night halt.
 *
 * `billing` says who it lands on:
 *   both     — the customer is charged and the driver is reimbursed. The
 *              default, and right for a toll the driver paid out of pocket:
 *              it passes through and leaves the margin untouched.
 *   customer — charged to the customer only, so it is ours to keep.
 *   driver   — reimbursed to the driver only, so we absorb it.
 */
export interface RideExtra {
  label: string;
  amount: number;
  billing: "both" | "customer" | "driver";
}

export const EXTRA_BILLING: { value: RideExtra["billing"]; label: string }[] = [
  { value: "both", label: "Bill customer & pay driver" },
  { value: "customer", label: "Bill customer only" },
  { value: "driver", label: "Pay driver only" },
];

/** Splits a list of extras into what the customer owes and what the driver is owed. */
export function splitExtras(extras: RideExtra[] = []) {
  let customer = 0;
  let driver = 0;
  for (const e of extras) {
    const amount = Number(e?.amount) || 0;
    if (e?.billing !== "driver") customer += amount;
    if (e?.billing !== "customer") driver += amount;
  }
  return { customer, driver };
}


/**
 * Both sides of a ride are built the same way, from rates that can be edited
 * per trip:
 *
 *   base fare (covers the included km) + extra km × per-km rate + costs
 *
 * The customer is billed on their rate card, the driver is paid on theirs, and
 * both run off the same odometer reading. What is left is the margin. Money
 * already moved — collected from the customer, advanced to the driver — is
 * subtracted at the end to give what is still outstanding on each side.
 */
export interface RideFinance {
  includedKm: number;
  /** Kilometres beyond the allowance — 0 while the trip is open. */
  extraKm: number;

  /* Customer side */
  minimumFare: number;
  extraCharge: number;
  extrasCustomer: number;
  customerTotal: number;
  collected: number;
  /** Still to collect. Only meaningful once closed. */
  balanceDue: number;

  /* Driver side */
  driverBase: number;
  driverKmRate: number;
  driverExtra: number;
  extrasDriver: number;
  driverTotal: number;
  driverAdvance: number;
  /** Still to hand over after the advance. */
  driverDue: number;

  profit: number;
  /** Profit as a percentage of the customer total. */
  margin: number;
  /** True once actual kilometres are in — until then every figure is a floor. */
  closed: boolean;
}

export type FinanceBooking = {
  tripType: "ONE_DAY" | "MULTI_DAY";
  days: number;
  /** The quoted minimum fare for the trip. */
  estimateTotal: number;
  includedKm: number;
  extraKmRate: number;
  bookingAmount: number;
  actualKm?: number | null;
  /** Total taken from the customer so far; defaults to the deposit. */
  collectedAmount?: number | null;
  extras?: RideExtra[] | null;
  /** Per-ride overrides of the vehicle's driver rate card. */
  driverBaseFare?: number | null;
  driverKmRate?: number | null;
  driverAdvance?: number | null;
};

type DriverRates = Pick<
  VehicleSpec,
  "driverBasePrice" | "driverPerDayPrice" | "driverExtraKmRate" | "driverBata"
>;

/** What the rate card says this driver earns before any per-ride override. */
export function driverRateCard(b: Pick<FinanceBooking, "tripType" | "days">, v?: DriverRates) {
  const days = b.tripType === "ONE_DAY" ? 1 : Math.max(2, b.days);
  /* Driver bata is the driver's allowance, so it passes straight through. */
  return {
    base: v ? (b.tripType === "ONE_DAY" ? v.driverBasePrice : (v.driverPerDayPrice + v.driverBata) * days) : 0,
    kmRate: v?.driverExtraKmRate ?? 0,
  };
}

export function computeRideFinance(b: FinanceBooking, v?: DriverRates): RideFinance {
  const closed = b.actualKm != null;
  const extraKm = closed ? Math.max(0, b.actualKm! - b.includedKm) : 0;
  const extras = splitExtras(b.extras ?? []);

  const extraCharge = extraKm * b.extraKmRate;
  const customerTotal = b.estimateTotal + extraCharge + extras.customer;
  const collected = b.collectedAmount ?? b.bookingAmount;

  const card = driverRateCard(b, v);
  const driverBase = b.driverBaseFare ?? card.base;
  const driverKmRate = b.driverKmRate ?? card.kmRate;
  const driverExtra = extraKm * driverKmRate;
  const driverTotal = driverBase + driverExtra + extras.driver;
  const driverAdvance = b.driverAdvance ?? 0;

  const profit = customerTotal - driverTotal;

  return {
    includedKm: b.includedKm,
    extraKm,

    minimumFare: b.estimateTotal,
    extraCharge,
    extrasCustomer: extras.customer,
    customerTotal,
    collected,
    /* An open trip has no final bill, so nothing is "due" yet. */
    balanceDue: closed ? Math.max(0, customerTotal - collected) : 0,

    driverBase,
    driverKmRate,
    driverExtra,
    extrasDriver: extras.driver,
    driverTotal,
    driverAdvance,
    driverDue: Math.max(0, driverTotal - driverAdvance),

    profit,
    margin: customerTotal ? Math.round((profit / customerTotal) * 100) : 0,
    closed,
  };
}
