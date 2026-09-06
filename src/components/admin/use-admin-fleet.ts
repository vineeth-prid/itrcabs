"use client";

import { useQuery } from "@tanstack/react-query";
import type { VehicleSpec } from "@/config/fleet";

export interface AdminVehicle extends VehicleSpec {
  available: boolean;
}

export interface AdminFleet {
  vehicles: AdminVehicle[];
  /** "database" when DATABASE_URL is set, "demo" otherwise. */
  source: string;
}

/**
 * The one place the admin fleet is fetched.
 *
 * Three screens used to declare their own query under the same
 * `["admin-fleet"]` key but return different shapes — an array here, a
 * `{ vehicles, source }` object there. React Query caches by key, so whichever
 * screen loaded first decided the shape and the others crashed on
 * `vehicles.find is not a function` or `cannot read 'map' of undefined`. One
 * hook, one shape; the fallbacks below mean even a malformed response renders
 * an empty fleet rather than throwing.
 */
export function useAdminFleet() {
  return useQuery<AdminFleet>({
    queryKey: ["admin-fleet"],
    queryFn: async () => {
      const res = await fetch("/api/admin/fleet");
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Failed to load fleet (${res.status})`);
      }
      const json = await res.json();
      return {
        vehicles: Array.isArray(json?.vehicles) ? json.vehicles : [],
        source: json?.source ?? "demo",
      };
    },
    staleTime: 30_000,
  });
}
