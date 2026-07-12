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

export async function updateBookingStatus(
  id: string,
  status: BookingRecord["status"]
): Promise<void> {
  if (hasDatabase) {
    await prisma.booking.update({ where: { id }, data: { status } });
    return;
  }
  const b = memory.get(id);
  if (b) b.status = status;
}
