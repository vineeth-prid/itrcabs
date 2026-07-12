import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { prisma, hasDatabase } from "@/lib/prisma";

/**
 * Razorpay webhook — source of truth for payment state.
 * Configure in the Razorpay dashboard: payment.captured, payment.failed.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as {
    event: string;
    payload: { payment: { entity: { id: string; order_id: string; method?: string } } };
  };

  if (!hasDatabase) return NextResponse.json({ ok: true });

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id) return NextResponse.json({ ok: true });

  if (event.event === "payment.captured") {
    const record = await prisma.payment.findUnique({
      where: { razorpayOrderId: payment.order_id },
    });
    if (record) {
      await prisma.payment.update({
        where: { id: record.id },
        data: { status: "PAID", razorpayPayId: payment.id, method: payment.method },
      });
      await prisma.booking.update({
        where: { id: record.bookingId },
        data: { status: "CONFIRMED" },
      });
    }
  } else if (event.event === "payment.failed") {
    await prisma.payment.updateMany({
      where: { razorpayOrderId: payment.order_id },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ ok: true });
}
