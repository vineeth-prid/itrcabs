import { prisma, hasDatabase } from "@/lib/prisma";
import { getVehicle, type VehicleSpec } from "@/config/fleet";
import { fleetOverrides } from "@/lib/fleet-store";
import { computeRideFinance, type RideFinance } from "@/lib/pricing";
import { generateBookingCode } from "@/lib/utils";

export interface BookingInput {
  tripType: "ONE_DAY" | "MULTI_DAY";
  days: number;
  passengers: number;
  vehicleSlug: string;
  pickup: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  name: string;
  phone: string;
  email?: string;
  estimateTotal: number;
  includedKm: number;
  extraKmRate: number;
}

/** Trip close-out — filled in by an admin once the ride is done. */
export interface BookingSettlement {
  /** Kilometres actually run. Null until the trip closes. */
  actualKm?: number | null;
  /** Manual override of the driver payout; null falls back to the rate card. */
  driverAmount?: number | null;
  /** Total taken from the customer so far; null means only the deposit. */
  collectedAmount?: number | null;
  driverSettled: boolean;
  settledAt?: string | null;
}

export interface BookingRecord extends BookingInput, BookingSettlement {
  id: string;
  bookingCode: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  bookingAmount: number;
  vehicleName: string;
  paymentId?: string;
  createdAt: string;
  /** Derived on read from the live driver rates — never stored. */
  finance: RideFinance;
}

type DriverRates = Pick<
  VehicleSpec,
  "driverBasePrice" | "driverPerDayPrice" | "driverExtraKmRate" | "driverBata"
>;

/** Deposit taken online at reservation — mirrors pricing.BOOKING_AMOUNT. */
const BOOKING_DEPOSIT = 199;

/** In-memory fallback so the full booking flow works without a database. */
type StoredBooking = Omit<BookingRecord, "finance">;
const globalStore = globalThis as unknown as { __bookings?: Map<string, StoredBooking> };
const memory: Map<string, StoredBooking> =
  globalStore.__bookings ?? (globalStore.__bookings = new Map());

/** Demo-mode driver rates, with any admin fleet override applied. */
function demoRates(slug: string): DriverRates | undefined {
  const spec = getVehicle(slug);
  if (!spec) return undefined;
  return { ...spec, ...fleetOverrides.get(slug) };
}

function withFinance(b: StoredBooking, rates?: DriverRates): BookingRecord {
  return { ...b, finance: computeRideFinance(b, rates) };
}

export async function createBooking(input: BookingInput): Promise<BookingRecord> {
  const bookingCode = generateBookingCode();
  const spec = getVehicle(input.vehicleSlug);
  if (!spec) throw new Error("Unknown vehicle");

  if (hasDatabase) {
    const vehicle = await prisma.vehicle.findUnique({ where: { slug: input.vehicleSlug } });
    if (!vehicle) throw new Error("Vehicle not found");
    const customer = await prisma.customer.upsert({
      where: { phone: input.phone },
      update: { name: input.name, email: input.email },
      create: { phone: input.phone, name: input.name, email: input.email },
    });
    const b = await prisma.booking.create({
      data: {
        bookingCode,
        tripType: input.tripType,
        days: input.days,
        passengers: input.passengers,
        pickup: input.pickup,
        destination: input.destination,
        pickupDate: new Date(input.pickupDate),
        pickupTime: input.pickupTime,
        name: input.name,
        phone: input.phone,
        email: input.email,
        estimateTotal: input.estimateTotal,
        includedKm: input.includedKm,
        extraKmRate: input.extraKmRate,
        vehicleId: vehicle.id,
        customerId: customer.id,
        phoneVerified: true,
      },
    });
    return withFinance(
      {
        ...input,
        id: b.id,
        bookingCode,
        status: "PENDING",
        bookingAmount: b.bookingAmount,
        vehicleName: vehicle.name,
        driverSettled: false,
        createdAt: b.createdAt.toISOString(),
      },
      vehicle
    );
  }

  const record: StoredBooking = {
    ...input,
    id: crypto.randomUUID(),
    bookingCode,
    status: "PENDING",
    bookingAmount: BOOKING_DEPOSIT,
    vehicleName: spec.name,
    driverSettled: false,
    createdAt: new Date().toISOString(),
  };
  memory.set(record.id, record);
  return withFinance(record, demoRates(input.vehicleSlug));
}

type BookingRow = {
  id: string;
  bookingCode: string;
  tripType: string;
  days: number;
  passengers: number;
  pickup: string;
  destination: string;
  pickupDate: Date;
  pickupTime: string;
  name: string;
  phone: string;
  email: string | null;
  estimateTotal: number;
  includedKm: number;
  extraKmRate: number;
  status: string;
  bookingAmount: number;
  actualKm: number | null;
  driverAmount: number | null;
  collectedAmount: number | null;
  driverSettled: boolean;
  settledAt: Date | null;
  createdAt: Date;
  vehicle: { slug: string; name: string } & DriverRates;
};

function fromRow(b: BookingRow): BookingRecord {
  return withFinance(
    {
      id: b.id,
      bookingCode: b.bookingCode,
      tripType: b.tripType as BookingRecord["tripType"],
      days: b.days,
      passengers: b.passengers,
      vehicleSlug: b.vehicle.slug,
      vehicleName: b.vehicle.name,
      pickup: b.pickup,
      destination: b.destination,
      pickupDate: b.pickupDate.toISOString(),
      pickupTime: b.pickupTime,
      name: b.name,
      phone: b.phone,
      email: b.email ?? undefined,
      estimateTotal: b.estimateTotal,
      includedKm: b.includedKm,
      extraKmRate: b.extraKmRate,
      status: b.status as BookingRecord["status"],
      bookingAmount: b.bookingAmount,
      actualKm: b.actualKm,
      driverAmount: b.driverAmount,
      collectedAmount: b.collectedAmount,
      driverSettled: b.driverSettled,
      settledAt: b.settledAt?.toISOString() ?? null,
      createdAt: b.createdAt.toISOString(),
    },
    b.vehicle
  );
}

export async function getBooking(id: string): Promise<BookingRecord | null> {
  if (hasDatabase) {
    const b = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingCode: id }] },
      include: { vehicle: true },
    });
    return b ? fromRow(b as unknown as BookingRow) : null;
  }
  for (const b of memory.values()) {
    if (b.id === id || b.bookingCode === id) return withFinance(b, demoRates(b.vehicleSlug));
  }
  return null;
}

export async function confirmBooking(id: string, paymentId: string): Promise<BookingRecord | null> {
  if (hasDatabase) {
    await prisma.booking.update({ where: { id }, data: { status: "CONFIRMED" } });
    return getBooking(id);
  }
  const b = memory.get(id);
  if (!b) return null;
  b.status = "CONFIRMED";
  b.paymentId = paymentId;
  return withFinance(b, demoRates(b.vehicleSlug));
}

export async function listBookings(): Promise<BookingRecord[]> {
  if (hasDatabase) {
    const rows = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { vehicle: true },
      take: 500,
    });
    return rows.map((b) => fromRow(b as unknown as BookingRow));
  }
  return [...memory.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((b) => withFinance(b, demoRates(b.vehicleSlug)));
}

export interface BookingPatch {
  status?: BookingRecord["status"];
  tripType?: BookingRecord["tripType"];
  days?: number;
  passengers?: number;
  vehicleSlug?: string;
  pickup?: string;
  destination?: string;
  pickupDate?: string;
  pickupTime?: string;
  name?: string;
  phone?: string;
  email?: string;
  estimateTotal?: number;
  bookingAmount?: number;
  includedKm?: number;
  extraKmRate?: number;
  actualKm?: number | null;
  driverAmount?: number | null;
  collectedAmount?: number | null;
  driverSettled?: boolean;
}

/** Admin edit — any subset of booking fields, including fare and contact details. */
export async function updateBooking(id: string, patch: BookingPatch): Promise<BookingRecord | null> {
  const { vehicleSlug, pickupDate, driverSettled, ...rest } = patch;

  if (hasDatabase) {
    const current = await prisma.booking.findUnique({ where: { id } });
    if (!current) return null;

    const data: Record<string, unknown> = { ...rest };
    if (pickupDate) data.pickupDate = new Date(pickupDate);
    if (vehicleSlug) {
      const vehicle = await prisma.vehicle.findUnique({ where: { slug: vehicleSlug } });
      if (!vehicle) throw new Error("Unknown vehicle");
      data.vehicleId = vehicle.id;
    }
    /* Settling stamps the date; un-settling clears it. */
    if (driverSettled !== undefined) {
      data.driverSettled = driverSettled;
      data.settledAt = driverSettled ? new Date() : null;
    }
    /* Contact edits follow through to the customer record so the customers view
       and any later booking on that phone stay consistent. Upserting by the new
       phone also avoids a unique-constraint clash when the phone changes. */
    if (patch.name !== undefined || patch.phone !== undefined || patch.email !== undefined) {
      const customer = await prisma.customer.upsert({
        where: { phone: patch.phone ?? current.phone },
        update: { name: patch.name ?? current.name, email: patch.email ?? current.email ?? undefined },
        create: {
          phone: patch.phone ?? current.phone,
          name: patch.name ?? current.name,
          email: patch.email ?? current.email ?? undefined,
        },
      });
      data.customerId = customer.id;
    }
    await prisma.booking.update({ where: { id }, data });
    return getBooking(id);
  }

  const b = memory.get(id);
  if (!b) return null;
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) (b as unknown as Record<string, unknown>)[k] = v;
  }
  if (pickupDate) b.pickupDate = pickupDate;
  if (driverSettled !== undefined) {
    b.driverSettled = driverSettled;
    b.settledAt = driverSettled ? new Date().toISOString() : null;
  }
  if (vehicleSlug) {
    const spec = getVehicle(vehicleSlug);
    if (!spec) throw new Error("Unknown vehicle");
    b.vehicleSlug = vehicleSlug;
    b.vehicleName = spec.name;
  }
  return withFinance(b, demoRates(b.vehicleSlug));
}

/**
 * Admin edit of a customer's details. Bookings carry a denormalised copy of the
 * contact, so every booking on that phone moves with the customer record.
 */
export async function updateCustomer(
  phone: string,
  patch: { name?: string; phone?: string; email?: string }
): Promise<number> {
  const changes = {
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.phone !== undefined && { phone: patch.phone }),
    ...(patch.email !== undefined && { email: patch.email || null }),
  };
  if (Object.keys(changes).length === 0) return 0;

  if (hasDatabase) {
    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing) await prisma.customer.update({ where: { phone }, data: changes });
    const { count } = await prisma.booking.updateMany({ where: { phone }, data: changes });
    return count;
  }

  let count = 0;
  for (const b of memory.values()) {
    if (b.phone !== phone) continue;
    if (patch.name !== undefined) b.name = patch.name;
    if (patch.email !== undefined) b.email = patch.email || undefined;
    if (patch.phone !== undefined) b.phone = patch.phone;
    count += 1;
  }
  return count;
}
