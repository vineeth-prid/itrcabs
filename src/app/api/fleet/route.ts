import { NextResponse } from "next/server";
import { getAvailableFleet, fitsPassengers } from "@/lib/fleet-store";

export const dynamic = "force-dynamic";

/** Public fleet feed — the booking wizard and any client UI read live data here. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const passengers = Number(url.searchParams.get("passengers")) || 0;

  let vehicles = await getAvailableFleet();
  if (passengers > 0) {
    vehicles = vehicles.filter((v) => fitsPassengers(v, passengers));
  }
  return NextResponse.json({ vehicles });
}
