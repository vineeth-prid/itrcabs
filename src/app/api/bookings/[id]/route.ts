import { NextResponse } from "next/server";
import { getBooking } from "@/lib/booking-store";
import { maskPhone } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  // Public confirmation view — mask the phone number
  return NextResponse.json({ booking: { ...booking, phone: maskPhone(booking.phone) } });
}
