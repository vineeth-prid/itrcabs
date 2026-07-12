import type { Metadata } from "next";
import { getBooking } from "@/lib/booking-store";
import { getVehicle } from "@/config/fleet";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  robots: { index: false },
};

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) notFound();
  const vehicle = getVehicle(booking.vehicleSlug);

  return (
    <BookingConfirmation
      booking={{
        bookingCode: booking.bookingCode,
        status: booking.status,
        tripType: booking.tripType,
        days: booking.days,
        passengers: booking.passengers,
        vehicleName: booking.vehicleName,
        vehicleSlug: booking.vehicleSlug,
        illustration: vehicle?.illustration ?? "sedan",
        pickup: booking.pickup,
        destination: booking.destination,
        pickupDate: booking.pickupDate,
        pickupTime: booking.pickupTime,
        name: booking.name,
        estimateTotal: booking.estimateTotal,
        bookingAmount: booking.bookingAmount,
        includedKm: booking.includedKm,
        extraKmRate: booking.extraKmRate,
      }}
    />
  );
}
