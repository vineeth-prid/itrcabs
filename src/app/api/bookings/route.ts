import { NextResponse } from "next/server";
import { z } from "zod";
import { getEffectiveVehicle, fitsPassengers } from "@/lib/fleet-store";
import { computePricing, BOOKING_AMOUNT } from "@/lib/pricing";
import { createBooking } from "@/lib/booking-store";
import { verifyPhoneToken } from "@/lib/otp-token";
import { getRazorpay, razorpayConfigured } from "@/lib/razorpay";

const schema = z.object({
  tripType: z.enum(["ONE_DAY", "MULTI_DAY"]),
  days: z.number().int().min(1).max(30).default(1),
  passengers: z.number().int().min(1).max(26),
  vehicleSlug: z.string().min(1),
  pickup: z.string().min(3).max(200),
  destination: z.string().min(3).max(200),
  pickupDate: z.string().refine((d) => !Number.isNaN(Date.parse(d)), "Invalid date"),
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal("")),
  otpToken: z.string().min(10),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const data = parsed.data;

  // Phone must be OTP-verified
  const phoneOk = await verifyPhoneToken(data.otpToken, data.phone);
  if (!phoneOk) {
    return NextResponse.json(
      { error: "Phone verification expired — please verify again" },
      { status: 401 }
    );
  }

  // Pickup date must be in the future
  if (new Date(data.pickupDate) < new Date(new Date().toDateString())) {
    return NextResponse.json({ error: "Pickup date cannot be in the past" }, { status: 400 });
  }

  const vehicle = await getEffectiveVehicle(data.vehicleSlug);
  if (!vehicle) {
    return NextResponse.json({ error: "Unknown vehicle" }, { status: 400 });
  }
  if (!vehicle.available) {
    return NextResponse.json(
      { error: `${vehicle.name} is currently unavailable — please pick another vehicle` },
      { status: 409 }
    );
  }
  if (!fitsPassengers(vehicle, data.passengers)) {
    return NextResponse.json(
      { error: `${vehicle.name} doesn't fit ${data.passengers} passengers — please pick a suitable vehicle` },
      { status: 400 }
    );
  }

  // Server-side pricing — never trust the client's numbers
  const pricing = computePricing(vehicle, data.tripType, data.days);

  const booking = await createBooking({
    tripType: data.tripType,
    days: pricing.days,
    passengers: data.passengers,
    vehicleSlug: data.vehicleSlug,
    pickup: data.pickup,
    destination: data.destination,
    pickupDate: data.pickupDate,
    pickupTime: data.pickupTime,
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    estimateTotal: pricing.estimateTotal,
    includedKm: pricing.includedKm,
    extraKmRate: pricing.extraKmRate,
  });

  // Create the ₹199 Razorpay order (or a demo order when keys are absent)
  if (razorpayConfigured) {
    const order = await getRazorpay().orders.create({
      amount: BOOKING_AMOUNT * 100,
      currency: "INR",
      receipt: booking.bookingCode,
      notes: { bookingId: booking.id, phone: data.phone },
    });
    return NextResponse.json({
      booking,
      payment: {
        mode: "razorpay",
        orderId: order.id,
        amount: BOOKING_AMOUNT * 100,
        currency: "INR",
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
      },
    });
  }

  return NextResponse.json({
    booking,
    payment: {
      mode: "demo",
      orderId: `demo_${booking.id}`,
      amount: BOOKING_AMOUNT * 100,
      currency: "INR",
    },
  });
}
