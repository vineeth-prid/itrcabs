import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaymentSignature, razorpayConfigured } from "@/lib/razorpay";
import { confirmBooking, getBooking } from "@/lib/booking-store";
import { prisma, hasDatabase } from "@/lib/prisma";

const schema = z.object({
  bookingId: z.string().min(1),
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
  }
  const { bookingId, orderId, paymentId, signature } = parsed.data;

  const booking = await getBooking(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (razorpayConfigured) {
    const valid = verifyPaymentSignature({ orderId, paymentId, signature });
    if (!valid) {
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
    }
    if (hasDatabase) {
      await prisma.payment.upsert({
        where: { razorpayOrderId: orderId },
        update: { razorpayPayId: paymentId, status: "PAID" },
        create: {
          bookingId: booking.id,
          razorpayOrderId: orderId,
          razorpayPayId: paymentId,
          amount: booking.bookingAmount,
          status: "PAID",
        },
      });
    }
  } else {
    // Demo mode — accept only the demo order issued for this booking
    if (orderId !== `demo_${booking.id}`) {
      return NextResponse.json({ error: "Invalid demo order" }, { status: 400 });
    }
  }

  const confirmed = await confirmBooking(booking.id, paymentId);
  return NextResponse.json({ ok: true, booking: confirmed });
}
