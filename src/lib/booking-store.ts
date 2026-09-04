import { prisma, hasDatabase } from "@/lib/prisma";
import { getVehicle } from "@/config/fleet";
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

export interface BookingRecord extends BookingInput {
  id: string;
  bookingCode: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  bookingAmount: number;
  vehicleName: string;
  paymentId?: string;
  createdAt: string;
}

/** In-memory fallback so the full booking flow works without a database. */
const globalStore = globalThis as unknown as { __bookings?: Map<string, BookingRecord> };
const memory: Map<string, BookingRecord> =
  globalStore.__bookings ?? (globalStore.__bookings = new Map());

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
    return {
      ...input,
      id: b.id,
      bookingCode,
      status: "PENDING",
      bookingAmount: b.bookingAmount,
      vehicleName: vehicle.name,
      createdAt: b.createdAt.toISOString(),
    };
  }

  const record: BookingRecord = {
    ...input,
    id: crypto.randomUUID(),
    bookingCode,
    status: "PENDING",
    bookingAmount: 199,
    vehicleName: spec.name,
    createdAt: new Date().toISOString(),
  };
  memory.set(record.id, record);
  return record;
}

export async function getBooking(id: string): Promise<BookingRecord | null> {
  if (hasDatabase) {
    const b = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingCode: id }] },
      include: { vehicle: true },
    });
    if (!b) return null;
    return {
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
      createdAt: b.createdAt.toISOString(),
    };
  }
  for (const b of memory.values()) {
    if (b.id === id || b.bookingCode === id) return b;
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
  return b;
}

export async function listBookings(): Promise<BookingRecord[]> {
  if (hasDatabase) {
    const rows = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { vehicle: true },
      take: 200,
    });
    return rows.map((b) => ({
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
      createdAt: b.createdAt.toISOString(),
    }));
  }
  return [...memory.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
}

/** Admin edit — any subset of booking fields, including fare and contact details. */
export async function updateBooking(id: string, patch: BookingPatch): Promise<BookingRecord | null> {
  const { vehicleSlug, pickupDate, ...rest } = patch;

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
  for (const [k, v] of Object.entries(rest)) if (v !== undefined) (b as unknown as Record<string, unknown>)[k] = v;
  if (pickupDate) b.pickupDate = pickupDate;
  if (vehicleSlug) {
    const spec = getVehicle(vehicleSlug);
    if (!spec) throw new Error("Unknown vehicle");
    b.vehicleSlug = vehicleSlug;
    b.vehicleName = spec.name;
  }
  return b;
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
