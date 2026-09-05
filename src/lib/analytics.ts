import type { BookingRecord } from "@/lib/booking-store";
import { isoDate } from "@/lib/utils";

/**
 * Business roll-ups for the admin dashboard. Pure functions over the booking
 * list — cancelled trips are excluded from every money figure but still counted
 * as bookings, so the cancellation rate stays visible.
 */

export interface Totals {
  trips: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  /** Fare owed by customers — quote plus extra kilometres actually run. */
  grossFare: number;
  collected: number;
  balanceDue: number;
  driverPayout: number;
  profit: number;
  margin: number;
  avgFare: number;
  avgProfit: number;
  /** Ran, closed out, driver not paid yet. */
  unsettledCount: number;
  unsettledAmount: number;
  /** Marked completed but no actual kilometres entered — blocks settlement. */
  awaitingCloseout: number;
}

const live = (b: BookingRecord) => b.status !== "CANCELLED";

export function summarise(bookings: BookingRecord[]): Totals {
  const active = bookings.filter(live);
  const sum = (pick: (b: BookingRecord) => number) => active.reduce((s, b) => s + pick(b), 0);

  const grossFare = sum((b) => b.finance.customerTotal);
  const driverPayout = sum((b) => b.finance.driverTotal);
  const profit = grossFare - driverPayout;
  const unsettled = active.filter((b) => b.finance.closed && !b.driverSettled);

  const count = (s: BookingRecord["status"]) => bookings.filter((b) => b.status === s).length;

  return {
    trips: bookings.length,
    pending: count("PENDING"),
    confirmed: count("CONFIRMED"),
    completed: count("COMPLETED"),
    cancelled: count("CANCELLED"),
    grossFare,
    collected: sum((b) => b.finance.collected),
    balanceDue: sum((b) => b.finance.balanceDue),
    driverPayout,
    profit,
    margin: grossFare ? Math.round((profit / grossFare) * 100) : 0,
    avgFare: active.length ? Math.round(grossFare / active.length) : 0,
    avgProfit: active.length ? Math.round(profit / active.length) : 0,
    unsettledCount: unsettled.length,
    unsettledAmount: unsettled.reduce((s, b) => s + b.finance.driverTotal, 0),
    awaitingCloseout: active.filter((b) => b.status === "COMPLETED" && !b.finance.closed).length,
  };
}

/** Inclusive trip-date filter. Empty bounds mean "unbounded on that side". */
export function inRange(b: BookingRecord, from: string, to: string): boolean {
  const day = isoDate(b.pickupDate);
  return (!from || day >= from) && (!to || day <= to);
}

export interface Slice {
  key: string;
  trips: number;
  fare: number;
  profit: number;
}

function group(bookings: BookingRecord[], keyOf: (b: BookingRecord) => string): Slice[] {
  const map = new Map<string, Slice>();
  for (const b of bookings.filter(live)) {
    const key = keyOf(b);
    const s = map.get(key) ?? { key, trips: 0, fare: 0, profit: 0 };
    s.trips += 1;
    s.fare += b.finance.customerTotal;
    s.profit += b.finance.profit;
    map.set(key, s);
  }
  return [...map.values()];
}

export const byVehicle = (b: BookingRecord[]): Slice[] =>
  group(b, (x) => x.vehicleName).sort((a, z) => z.trips - a.trips);

export const byRoute = (b: BookingRecord[], limit = 6): Slice[] =>
  group(b, (x) => `${x.pickup} → ${x.destination}`)
    .sort((a, z) => z.trips - a.trips)
    .slice(0, limit);

/**
 * One entry per calendar day that has activity, oldest first. Sparse by design —
 * a year-long range shouldn't render 365 empty bars.
 */
export const byDay = (b: BookingRecord[]): Slice[] =>
  group(b, (x) => isoDate(x.pickupDate)).sort((a, z) => a.key.localeCompare(z.key));
