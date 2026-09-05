"use client";

import { useQuery } from "@tanstack/react-query";
import type { BookingRecord } from "@/lib/booking-store";

/**
 * One cache entry behind every admin screen. Moving between Dashboard,
 * Bookings, Customers and Settlements is then instant — the data is already
 * there and revalidates in the background instead of blocking the page.
 */
export function useAdminBookings() {
  return useQuery<BookingRecord[]>({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/bookings");
      if (!res.ok) throw new Error("Failed to load bookings");
      return (await res.json()).bookings;
    },
    staleTime: 30_000,
  });
}
