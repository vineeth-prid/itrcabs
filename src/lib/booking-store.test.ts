/**
 * Self-check for the admin booking, customer and settlement paths (demo mode).
 * Run: npx tsx src/lib/booking-store.test.ts
 */
import assert from "node:assert/strict";
import { hasDatabase } from "@/lib/prisma";
import { createBooking, updateBooking, updateCustomer, getBooking } from "@/lib/booking-store";
import { getVehicle } from "@/config/fleet";
import { summarise, byDriver, knownDrivers, matches } from "@/lib/analytics";

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
  const edited = (await getBooking(a.id))!;
  assert.equal(edited.estimateTotal, 3500);
  assert.equal(edited.bookingAmount, 500);
  assert.equal(edited.status, "CONFIRMED");
  // The deposit edit must flow into the collected figure the dashboard sums.
  assert.equal(edited.finance.collected, 500, "collected follows the edited deposit");

  // An undefined field in the patch must not wipe the stored value.
  await updateBooking(a.id, { status: "COMPLETED", bookingAmount: undefined });
  assert.equal((await getBooking(a.id))?.bookingAmount, 500, "undefined patch fields are ignored");

  /* An open trip only has a minimum. Nothing is owed and no margin is known
     until the odometer reading goes in. */
  const open = (await getBooking(a.id))!;
  assert.equal(open.finance.closed, false);
  assert.equal(open.finance.extraKm, 0);
  assert.equal(open.finance.minimumFare, 3500);
  assert.equal(open.finance.customerTotal, 3500);
  assert.equal(open.finance.balanceDue, 0, "an open trip has no final bill to collect");
  const openTotals = summarise([open]);
  assert.equal(openTotals.grossFare, 0, "an open trip is not revenue");
  assert.equal(openTotals.profit, 0, "an open trip has no known margin");
  assert.equal(openTotals.openMinimum, 3500, "it counts as pipeline at its minimum");
  assert.equal(openTotals.awaitingCloseout, 1);

  // Assign the driver who ran it.
  await updateBooking(a.id, { driverName: "Sunil P", driverVehicleNo: "KL 07 AB 1234" });
  assert.equal((await getBooking(a.id))?.driverName, "Sunil P");

  /* Close-out: 130 km on an 80 km allowance bills the customer 50 × ₹13 and
     pays the driver 50 × their own rate — both sides move on the same km. */
  await updateBooking(a.id, { actualKm: 130, collectedAmount: 1000 });
  const closed = (await getBooking(a.id))!;
  assert.equal(closed.finance.closed, true);
  assert.equal(closed.finance.extraKm, 50);
  assert.equal(closed.finance.extraCharge, 50 * 13);
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
  assert.equal(totals.closedTrips, 1);
  assert.equal(totals.grossFare, closed.finance.customerTotal, "cancelled fare is excluded");
  assert.equal(totals.profit, 150);

  /* Per-driver settlement: only closed trips are payable, and an unsettled one
     shows as still owed. */
  await updateBooking(b.id, { driverName: "Sunil P", driverVehicleNo: "KL 07 AB 1234" });
  const roster = byDriver([
    (await getBooking(a.id))!,
    (await getBooking(b.id))!,
    (await getBooking(trip.id))!,
  ]);
  assert.equal(roster.length, 1, "only assigned trips produce a driver row");
  const sunil = roster[0];
  assert.equal(sunil.name, "Sunil P");
  assert.equal(sunil.vehicleNo, "KL 07 AB 1234");
  assert.equal(sunil.trips, 2);
  assert.equal(sunil.awaitingCloseout, 1, "the open trip is not payable yet");
  assert.equal(sunil.earned, 4000);
  assert.equal(sunil.due, 4000, "unsettled, so still owed");
  assert.equal(sunil.paid, 0);

  await updateBooking(a.id, { driverSettled: true });
  const afterPay = byDriver([(await getBooking(a.id))!])[0];
  assert.equal(afterPay.paid, 4000);
  assert.equal(afterPay.due, 0);

  assert.deepEqual(knownDrivers([(await getBooking(a.id))!]), [
    { name: "Sunil P", vehicleNo: "KL 07 AB 1234" },
  ]);
  // Search covers the driver and the car, not just the customer.
  assert.ok(matches((await getBooking(a.id))!, "sunil"));
  assert.ok(matches((await getBooking(a.id))!, "KL 07"));
  assert.ok(!matches((await getBooking(a.id))!, "zzz"));

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
