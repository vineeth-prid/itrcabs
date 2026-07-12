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

export const BOOKING_AMOUNT = 199;

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
    ],
  };
}
