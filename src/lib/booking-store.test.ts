/**
 * Self-check for the admin booking, customer and settlement paths (demo mode).
 * Run: npx tsx src/lib/booking-store.test.ts
 */
import assert from "node:assert/strict";
import { hasDatabase } from "@/lib/prisma";
import { createBooking, updateBooking, updateCustomer, getBooking } from "@/lib/booking-store";
import { getVehicle } from "@/config/fleet";
import { summarise } from "@/lib/analytics";

assert.equal(hasDatabase, false, "Run without DATABASE_URL — this checks the in-memory path");

const base = {
  tripType: "ONE_DAY" as const,
  days: 1,
  passengers: 4,
  vehicleSlug: "premium-sedan",
  pickup: "Kochi Airport",
  destination: "Munnar",
  pickupDate: "2026-10-01",
  pickupTime: "09:00",
  name: "Asha",
  phone: "9876543210",
  estimateTotal: 2200,
  includedKm: 80,
  extraKmRate: 13,
};

async function main() {
  const sedan = getVehicle("premium-sedan")!;
  const a = await createBooking(base);
  const b = await createBooking({ ...base, destination: "Alleppey", estimateTotal: 2400 });

  // Admin overrides the fare and the deposit.
  await updateBooking(a.id, { estimateTotal: 3500, bookingAmount: 500, status: "CONFIRMED" });
  const edited = await getBooking(a.id);
  assert.equal(edited?.estimateTotal, 3500);
  assert.equal(edited?.bookingAmount, 500);
  assert.equal(edited?.status, "CONFIRMED");
  // The deposit edit must flow into the collected figure the dashboard sums.
  assert.equal(edited?.finance.collected, 500, "collected follows the edited deposit");
  assert.equal(edited?.finance.balanceDue, 3000);

  // An undefined field in the patch must not wipe the stored value.
  await updateBooking(a.id, { status: "COMPLETED", bookingAmount: undefined });
  assert.equal((await getBooking(a.id))?.bookingAmount, 500, "undefined patch fields are ignored");

  // Before close-out the trip has no extra km and the payout is the rate card.
  const open = (await getBooking(a.id))!;
  assert.equal(open.finance.closed, false);
  assert.equal(open.finance.extraKm, 0);
  assert.equal(open.finance.driverTotal, sedan.driverBasePrice);

  /* Close-out: 130 km on an 80 km allowance bills the customer 50 × ₹13 and
     pays the driver 50 × their own rate — both sides move on the same km. */
  await updateBooking(a.id, { actualKm: 130, collectedAmount: 1000 });
  const closed = (await getBooking(a.id))!;
  assert.equal(closed.finance.closed, true);
  assert.equal(closed.finance.extraKm, 50);
  assert.equal(closed.finance.customerExtra, 50 * 13);
  assert.equal(closed.finance.customerTotal, 3500 + 650);
  assert.equal(closed.finance.driverTotal, sedan.driverBasePrice + 50 * sedan.driverExtraKmRate);
  assert.equal(closed.finance.balanceDue, 4150 - 1000);
  assert.equal(closed.finance.profit, closed.finance.customerTotal - closed.finance.driverTotal);
  assert.ok(closed.finance.profit > 0, "the rate card must leave a margin");

  // A manual payout wins over the rate card.
  await updateBooking(a.id, { driverAmount: 4000 });
  assert.equal((await getBooking(a.id))?.finance.driverTotal, 4000);
  assert.equal((await getBooking(a.id))?.finance.profit, 150);

  // Settling stamps a date; un-settling clears it.
  await updateBooking(a.id, { driverSettled: true });
  assert.ok((await getBooking(a.id))?.settledAt, "settling records when it happened");
  await updateBooking(a.id, { driverSettled: false });
  assert.equal((await getBooking(a.id))?.settledAt, null);

  // Multi-day pays the driver their per-day rate plus bata for every day.
  const trip = await createBooking({
    ...base,
    phone: "9812345678",
    tripType: "MULTI_DAY",
    days: 3,
    estimateTotal: (sedan.perDayPrice + sedan.driverBata) * 3,
    includedKm: 300,
  });
  assert.equal(trip.finance.driverTotal, (sedan.driverPerDayPrice + sedan.driverBata) * 3);

  // Cancelled trips are counted but contribute no money.
  const scratch = await createBooking({ ...base, phone: "9700000001" });
  await updateBooking(scratch.id, { status: "CANCELLED" });
  const totals = summarise([(await getBooking(a.id))!, (await getBooking(scratch.id))!]);
  assert.equal(totals.trips, 2);
  assert.equal(totals.cancelled, 1);
  assert.equal(totals.grossFare, closed.finance.customerTotal, "cancelled fare is excluded");
  assert.equal(totals.profit, 150);

  // Customer edits apply across every booking on that phone.
  const touched = await updateCustomer("9876543210", {
    name: "Asha Menon",
    phone: "9000000001",
    email: "asha@example.com",
  });
  assert.equal(touched, 2);
  for (const id of [a.id, b.id]) {
    const rec = await getBooking(id);
    assert.equal(rec?.name, "Asha Menon");
    assert.equal(rec?.phone, "9000000001");
    assert.equal(rec?.email, "asha@example.com");
  }

  console.log("booking-store checks passed");
}

main();
