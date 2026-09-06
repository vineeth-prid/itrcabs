import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getEffectiveVehicle } from "@/lib/fleet-store";
import { computePricing } from "@/lib/pricing";
import { createBooking, listBookings, updateBooking } from "@/lib/booking-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const bookings = await listBookings();
    return NextResponse.json({ bookings });
  } catch (e) {
    return failed(e);
  }
}

const status = z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]);
const money = z.number().int().min(0).max(10_000_000);

/** Shared field shapes — the create schema requires them, the patch schema makes them optional. */
const fields = {
  tripType: z.enum(["ONE_DAY", "MULTI_DAY"]),
  days: z.number().int().min(1).max(30),
  passengers: z.number().int().min(1).max(26),
  vehicleSlug: z.string().min(1),
  pickup: z.string().min(3).max(200),
  destination: z.string().min(3).max(200),
  pickupDate: z.string().refine((d) => !Number.isNaN(Date.parse(d)), "Invalid date"),
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM"),
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email().optional().or(z.literal("")),
  estimateTotal: money,
  bookingAmount: money,
  status,
};

const postSchema = z.object({
  ...fields,
  driverName: z.string().max(80).nullable().optional(),
  driverVehicleNo: z.string().max(20).nullable().optional(),
  days: fields.days.default(1),
  estimateTotal: money.optional(),
  bookingAmount: money.optional(),
  status: status.default("PENDING"),
});

/* Trip close-out fields — set after the ride, so they are patch-only.
   null clears a value back to "not recorded yet". */
const nullableMoney = money.nullable();
const patchSchema = z.object(fields).partial().extend({
  id: z.string().min(1),
  driverName: z.string().max(80).nullable().optional(),
  driverVehicleNo: z.string().max(20).nullable().optional(),
  extras: z
    .array(
      z.object({
        label: z.string().min(1).max(60),
        amount: money,
        billing: z.enum(["both", "customer", "driver"]),
      })
    )
    .max(20)
    .optional(),
  actualKm: z.number().int().min(0).max(20000).nullable().optional(),
  driverAmount: nullableMoney.optional(),
  collectedAmount: nullableMoney.optional(),
  driverSettled: z.boolean().optional(),
});

function bad(e: z.ZodError) {
  const issue = e.issues[0];
  return NextResponse.json({ error: `${issue.path.join(".")}: ${issue.message}` }, { status: 400 });
}

/**
 * Turns a failure into something an admin can act on. The common one right
 * after a deploy is a database that has not had `prisma db push` run against
 * it, where Prisma reports a missing column — meaningless in the UI.
 */
function failed(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  const stale = /column .* does not exist|Unknown argument|P2022/i.test(message);
  console.error("Admin bookings API error:", e);
  return NextResponse.json(
    {
      error: stale
        ? "The database is missing columns this version needs — run `npx prisma db push` against it, then reload."
        : message,
    },
    { status: stale ? 503 : 500 }
  );
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad(parsed.error);
  const {
    status: newStatus,
    estimateTotal,
    bookingAmount,
    email,
    driverName,
    driverVehicleNo,
    ...data
  } = parsed.data;

  try {
    const vehicle = await getEffectiveVehicle(data.vehicleSlug);
    if (!vehicle) return NextResponse.json({ error: "Unknown vehicle" }, { status: 400 });

    const pricing = computePricing(vehicle, data.tripType, data.days);
    const booking = await createBooking({
      ...data,
      email: email || undefined,
      estimateTotal: estimateTotal ?? pricing.estimateTotal,
      includedKm: pricing.includedKm,
      extraKmRate: vehicle.extraKmRate,
    });

    /* createBooking always starts PENDING, at the default deposit, with no
       driver — apply the admin's overrides straight after. */
    const overrides = {
      ...(newStatus !== "PENDING" && { status: newStatus }),
      ...(bookingAmount !== undefined && { bookingAmount }),
      ...(driverName !== undefined && { driverName }),
      ...(driverVehicleNo !== undefined && { driverVehicleNo }),
    };
    const final = Object.keys(overrides).length
      ? await updateBooking(booking.id, overrides)
      : booking;
    return NextResponse.json({ ok: true, booking: final ?? booking });
  } catch (e) {
    return failed(e);
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad(parsed.error);
  const { id, email, ...patch } = parsed.data;

  try {
    const booking = await updateBooking(id, {
      ...patch,
      ...(email !== undefined && { email: email || undefined }),
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    return NextResponse.json({ ok: true, booking });
  } catch (e) {
    return failed(e);
  }
}
