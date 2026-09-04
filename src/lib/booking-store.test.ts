/**
 * Self-check for the admin booking/customer edit paths (demo mode).
 * Run: npx tsx src/lib/booking-store.test.ts
 */
import assert from "node:assert/strict";
import { hasDatabase } from "@/lib/prisma";
import { createBooking, updateBooking, updateCustomer, getBooking } from "@/lib/booking-store";

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
  const a = await createBooking(base);
  const b = await createBooking({ ...base, destination: "Alleppey", estimateTotal: 2400 });

  // Admin overrides the fare and the deposit.
  await updateBooking(a.id, { estimateTotal: 3500, bookingAmount: 500, status: "CONFIRMED" });
  const edited = await getBooking(a.id);
  assert.equal(edited?.estimateTotal, 3500);
  assert.equal(edited?.bookingAmount, 500);
  assert.equal(edited?.status, "CONFIRMED");

  // An undefined field in the patch must not wipe the stored value.
  await updateBooking(a.id, { status: "COMPLETED", bookingAmount: undefined });
  assert.equal((await getBooking(a.id))?.bookingAmount, 500, "undefined patch fields must be ignored");

  // Switching the vehicle updates the denormalised name.
  await updateBooking(a.id, { vehicleSlug: "compact-suv" });
  assert.equal((await getBooking(a.id))?.vehicleName, "Compact SUV");

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
