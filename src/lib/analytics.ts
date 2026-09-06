import type { BookingRecord } from "@/lib/booking-store";
import { isoDate } from "@/lib/utils";

/**
 * Business roll-ups for the admin screens. Pure functions over the booking list.
 *
 * Two rules run through all of it:
 *  - Cancelled trips are still counted as bookings but contribute no money.
 *  - A quoted fare is a MINIMUM, not revenue. Until a trip is closed out with
 *    its actual kilometres, its fare and margin are unknown, so revenue,
 *    driver cost and profit only count closed trips. Open trips are reported
 *    separately as pipeline, valued at their minimum.
 */

export interface Totals {
  trips: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;

  /** Trips closed out with actual kilometres — the ones the money is real for. */
  closedTrips: number;
  /** Final fare owed across closed trips: minimum plus extra kilometres. */
  grossFare: number;
  driverPayout: number;
  profit: number;
  margin: number;
  avgFare: number;
  avgProfit: number;

  /** Open trips, valued at their quoted minimum — a floor, not revenue. */
  openTrips: number;
  openMinimum: number;

  /** Money actually taken from customers, open trips included. */
  collected: number;
  /** Owed by customers on closed trips. */
  balanceDue: number;

  /** Closed, driver not fully paid yet. */
  unsettledCount: number;
  /** Still to hand over on those trips, after any advance. */
  unsettledAmount: number;
  /** Ran but never closed out — blocks settlement. */
  awaitingCloseout: number;
  /** Closed but nobody recorded who drove it — blocks paying anyone. */
  unassigned: number;
}

const live = (b: BookingRecord) => b.status !== "CANCELLED";
const sumBy = <T>(rows: T[], pick: (r: T) => number) => rows.reduce((s, r) => s + pick(r), 0);

export function summarise(bookings: BookingRecord[]): Totals {
  const active = bookings.filter(live);
  const closed = active.filter((b) => b.finance.closed);
  const open = active.filter((b) => !b.finance.closed);

  const grossFare = sumBy(closed, (b) => b.finance.customerTotal);
  const driverPayout = sumBy(closed, (b) => b.finance.driverTotal);
  const profit = grossFare - driverPayout;
  const unsettled = closed.filter((b) => !b.driverSettled);

  const count = (s: BookingRecord["status"]) => bookings.filter((b) => b.status === s).length;

  return {
    trips: bookings.length,
    pending: count("PENDING"),
    confirmed: count("CONFIRMED"),
    completed: count("COMPLETED"),
    cancelled: count("CANCELLED"),

    closedTrips: closed.length,
    grossFare,
    driverPayout,
    profit,
    margin: grossFare ? Math.round((profit / grossFare) * 100) : 0,
    avgFare: closed.length ? Math.round(grossFare / closed.length) : 0,
    avgProfit: closed.length ? Math.round(profit / closed.length) : 0,

    openTrips: open.length,
    openMinimum: sumBy(open, (b) => b.finance.minimumFare),

    collected: sumBy(active, (b) => b.finance.collected),
    balanceDue: sumBy(closed, (b) => b.finance.balanceDue),

    unsettledCount: unsettled.length,
    /* What is still to hand over — an advance is already out the door. */
    unsettledAmount: sumBy(unsettled, (b) => b.finance.driverDue),
    awaitingCloseout: open.filter((b) => b.status === "COMPLETED").length,
    unassigned: closed.filter((b) => !b.driverName).length,
  };
}

/** Inclusive trip-date filter. Empty bounds mean "unbounded on that side". */
export function inRange(b: BookingRecord, from: string, to: string): boolean {
  const day = isoDate(b.pickupDate);
  return (!from || day >= from) && (!to || day <= to);
}

/** Free-text match across everything an admin might type into a search box. */
export function matches(b: BookingRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    b.bookingCode,
    b.name,
    b.phone,
    b.pickup,
    b.destination,
    b.vehicleName,
    b.driverName ?? "",
    b.driverVehicleNo ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export interface Slice {
  key: string;
  trips: number;
  /** Closed-trip fare, plus the minimum for trips still open. */
  fare: number;
  /** Closed trips only — an open trip has no known margin. */
  profit: number;
}

function group(bookings: BookingRecord[], keyOf: (b: BookingRecord) => string): Slice[] {
  const map = new Map<string, Slice>();
  for (const b of bookings.filter(live)) {
    const key = keyOf(b);
    const s = map.get(key) ?? { key, trips: 0, fare: 0, profit: 0 };
    s.trips += 1;
    s.fare += b.finance.customerTotal;
    if (b.finance.closed) s.profit += b.finance.profit;
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

export interface DriverTotals {
  name: string;
  vehicleNo: string;
  trips: number;
  /** Closed trips only — you can only pay someone for a trip that's costed. */
  earned: number;
  paid: number;
  due: number;
  awaitingCloseout: number;
}

/** Per-driver settlement position. Cancelled trips are ignored throughout. */
export function byDriver(bookings: BookingRecord[]): DriverTotals[] {
  const map = new Map<string, DriverTotals>();
  for (const b of bookings.filter(live)) {
    const name = b.driverName?.trim();
    if (!name) continue;
    const d =
      map.get(name) ??
      { name, vehicleNo: "", trips: 0, earned: 0, paid: 0, due: 0, awaitingCloseout: 0 };
    d.trips += 1;
    if (b.driverVehicleNo) d.vehicleNo = b.driverVehicleNo;
    if (b.finance.closed) {
      d.earned += b.finance.driverTotal;
      /* An advance is money already paid, whether or not the trip is settled. */
      d.paid += b.finance.driverAdvance;
      if (b.driverSettled) d.paid += b.finance.driverDue;
      else d.due += b.finance.driverDue;
    } else {
      d.awaitingCloseout += 1;
    }
    map.set(name, d);
  }
  return [...map.values()].sort((a, z) => z.due - a.due || z.earned - a.earned);
}

/** Distinct drivers seen so far, for autocomplete when assigning a trip. */
export function knownDrivers(bookings: BookingRecord[]): { name: string; vehicleNo: string }[] {
  const map = new Map<string, string>();
  for (const b of bookings) {
    const name = b.driverName?.trim();
    if (name) map.set(name, b.driverVehicleNo?.trim() ?? "");
  }
  return [...map.entries()]
    .map(([name, vehicleNo]) => ({ name, vehicleNo }))
    .sort((a, z) => a.name.localeCompare(z.name));
}
