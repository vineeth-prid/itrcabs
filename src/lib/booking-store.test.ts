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

  /* Costs on the trip. A toll billed to both sides passes through: the customer
     is charged and the driver reimbursed, so the margin is untouched. A
     customer-only line is ours to keep; a driver-only line we absorb. */
  const beforeExtras = closed.finance.profit;
  await updateBooking(a.id, {
    extras: [
      { label: "Toll", amount: 300, billing: "both" },
      { label: "Night charge", amount: 500, billing: "customer" },
      { label: "Parking we cover", amount: 100, billing: "driver" },
    ],
  });
  const withExtras = (await getBooking(a.id))!;
  assert.equal(withExtras.finance.extrasCustomer, 800, "toll + night charge reach the customer");
  assert.equal(withExtras.finance.extrasDriver, 400, "toll + parking reach the driver");
  assert.equal(withExtras.finance.customerTotal, closed.finance.customerTotal + 800);
  assert.equal(withExtras.finance.driverTotal, closed.finance.driverTotal + 400);
  assert.equal(
    withExtras.finance.profit,
    beforeExtras + 400,
    "a pass-through toll never moves the margin"
  );

  await updateBooking(a.id, { extras: [] });
  assert.equal(
    (await getBooking(a.id))?.finance.profit,
    beforeExtras,
    "clearing the costs restores the margin"
  );

  /* The worked example the business settles by:
       332 km run, 80 km covered by a ₹1,800 driver base, 252 km × ₹18 = ₹4,536,
       plus a ₹210 toll the driver paid = ₹6,546. Less a ₹1,000 advance already
       handed over leaves ₹5,546 to pay. */
  const worked = await createBooking({
    ...base,
    phone: "9700000042",
    estimateTotal: 2500,
    includedKm: 80,
    extraKmRate: 22,
  });
  await updateBooking(worked.id, {
    actualKm: 332,
    driverBaseFare: 1800,
    driverKmRate: 18,
    driverAdvance: 1000,
    collectedAmount: 2000,
    extras: [{ label: "Toll", amount: 210, billing: "both" }],
  });
  const w = (await getBooking(worked.id))!.finance;
  assert.equal(w.extraKm, 252, "332 km less the 80 km allowance");
  assert.equal(w.driverBase, 1800);
  assert.equal(w.driverExtra, 252 * 18);
  assert.equal(w.driverExtra, 4536);
  assert.equal(w.extrasDriver, 210, "the toll is reimbursed to the driver");
  assert.equal(w.driverTotal, 6546, "1800 + 4536 + 210");
  assert.equal(w.driverAdvance, 1000);
  assert.equal(w.driverDue, 5546, "6546 less the 1000 advance");
  /* The customer is billed the same shape on their own rates. */
  assert.equal(w.extraCharge, 252 * 22);
  assert.equal(w.extrasCustomer, 210);
  assert.equal(w.customerTotal, 2500 + 5544 + 210);
  assert.equal(w.balanceDue, w.customerTotal - 2000);
  assert.equal(w.profit, w.customerTotal - 6546);

  // An advance is a timing difference, so it never moves the margin.
  await updateBooking(worked.id, { driverAdvance: 0 });
  const noAdvance = (await getBooking(worked.id))!.finance;
  assert.equal(noAdvance.profit, w.profit);
  assert.equal(noAdvance.driverDue, 6546);

  // Clearing an override falls back to the vehicle's rate card.
  await updateBooking(worked.id, { driverBaseFare: null, driverKmRate: null });
  const carded = (await getBooking(worked.id))!.finance;
  assert.equal(carded.driverBase, sedan.driverBasePrice);
  assert.equal(carded.driverKmRate, sedan.driverExtraKmRate);

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
  assert.equal(totals.profit, closed.finance.profit, "cancelled trips contribute nothing");

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
  assert.equal(sunil.earned, closed.finance.driverTotal);
  assert.equal(sunil.due, closed.finance.driverTotal, "unsettled, so still owed");
  assert.equal(sunil.paid, 0);

  await updateBooking(a.id, { driverSettled: true });
  const afterPay = byDriver([(await getBooking(a.id))!])[0];
  assert.equal(afterPay.paid, closed.finance.driverTotal);
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
