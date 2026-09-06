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

export interface RideFinance {
  /** Kilometres covered by the minimum fare. */
  includedKm: number;
  /** Kilometres beyond the allowance — 0 while the trip is open. */
  extraKm: number;
  extraCharge: number;
  /** Tolls, parking and the like, as charged to the customer. */
  extrasCustomer: number;
  /** The same list, as reimbursed to the driver. */
  extrasDriver: number;
  /** The quoted floor: what the trip costs even if it never leaves the yard. */
  minimumFare: number;
  /** Minimum plus extra kilometres. Equals the minimum while open. */
  customerTotal: number;
  driverTotal: number;
  collected: number;
  /** Still to collect from the customer. Only meaningful once closed. */
  balanceDue: number;
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
  /** Manual override of the driver payout — wins over the rate card. */
  driverAmount?: number | null;
  /** Total taken from the customer so far; defaults to the deposit. */
  collectedAmount?: number | null;
  extras?: RideExtra[] | null;
};

type DriverRates = Pick<
  VehicleSpec,
  "driverBasePrice" | "driverPerDayPrice" | "driverExtraKmRate" | "driverBata"
>;

export function computeRideFinance(b: FinanceBooking, v?: DriverRates): RideFinance {
  const days = b.tripType === "ONE_DAY" ? 1 : Math.max(2, b.days);
  const closed = b.actualKm != null;
  const extraKm = closed ? Math.max(0, b.actualKm! - b.includedKm) : 0;
  const extraCharge = extraKm * b.extraKmRate;
  const extras = splitExtras(b.extras ?? []);
  const customerTotal = b.estimateTotal + extraCharge + extras.customer;

  /* Driver bata is the driver's allowance, so it passes straight through. */
  const driverBase = v
    ? b.tripType === "ONE_DAY"
      ? v.driverBasePrice
      : (v.driverPerDayPrice + v.driverBata) * days
    : 0;
  /* An override replaces the rate-card payout, but reimbursements are still
     owed on top — they are money the driver already spent. */
  const driverRate = b.driverAmount ?? driverBase + extraKm * (v?.driverExtraKmRate ?? 0);
  const driverTotal = driverRate + extras.driver;

  const collected = b.collectedAmount ?? b.bookingAmount;
  const profit = customerTotal - driverTotal;

  return {
    includedKm: b.includedKm,
    extraKm,
    extraCharge,
    extrasCustomer: extras.customer,
    extrasDriver: extras.driver,
    minimumFare: b.estimateTotal,
    customerTotal,
    driverTotal,
    collected,
    /* An open trip has no final bill, so nothing is "due" yet. */
    balanceDue: closed ? Math.max(0, customerTotal - collected) : 0,
    profit,
    margin: customerTotal ? Math.round((profit / customerTotal) * 100) : 0,
    closed,
  };
}
