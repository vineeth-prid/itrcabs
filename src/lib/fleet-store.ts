import { fleet as baseFleet, fitsPassengers, type VehicleSpec } from "@/config/fleet";
import { prisma, hasDatabase } from "@/lib/prisma";

export { fitsPassengers };

/**
 * Single source of truth for fleet data everywhere on the site.
 * Base specs (copy, seats, illustrations) live in version-controlled config;
 * admin-editable numbers (prices, availability) live in the database — or an
 * in-memory override map in demo mode. Public pages, the booking engine and
 * the admin panel all read through here, so an admin edit is live instantly.
 */

export interface EffectiveVehicle extends VehicleSpec {
  available: boolean;
}

export interface FleetOverride {
  basePrice?: number;
  perDayPrice?: number;
  extraKmRate?: number;
  driverBata?: number;
  available?: boolean;
}

const g = globalThis as unknown as { __fleetOverrides?: Map<string, FleetOverride> };
export const fleetOverrides: Map<string, FleetOverride> =
  g.__fleetOverrides ?? (g.__fleetOverrides = new Map());

export async function getEffectiveFleet(): Promise<EffectiveVehicle[]> {
  if (hasDatabase) {
    const rows = await prisma.vehicle.findMany();
    const bySlug = new Map(rows.map((r) => [r.slug, r]));
    return baseFleet.map((v) => {
      const r = bySlug.get(v.slug);
      return {
        ...v,
        basePrice: r?.basePrice ?? v.basePrice,
        perDayPrice: r?.perDayPrice ?? v.perDayPrice,
        extraKmRate: r?.extraKmRate ?? v.extraKmRate,
        driverBata: r?.driverBata ?? v.driverBata,
        available: r?.available ?? true,
      };
    });
  }
  return baseFleet.map((v) => {
    const o = fleetOverrides.get(v.slug);
    return {
      ...v,
      basePrice: o?.basePrice ?? v.basePrice,
      perDayPrice: o?.perDayPrice ?? v.perDayPrice,
      extraKmRate: o?.extraKmRate ?? v.extraKmRate,
      driverBata: o?.driverBata ?? v.driverBata,
      available: o?.available ?? true,
    };
  });
}

/** Only vehicles customers may book. */
export async function getAvailableFleet(): Promise<EffectiveVehicle[]> {
  return (await getEffectiveFleet()).filter((v) => v.available);
}

export async function getEffectiveVehicle(slug: string): Promise<EffectiveVehicle | undefined> {
  return (await getEffectiveFleet()).find((v) => v.slug === slug);
}

export async function setFleetOverride(slug: string, changes: FleetOverride): Promise<void> {
  if (hasDatabase) {
    await prisma.vehicle.update({ where: { slug }, data: changes });
    return;
  }
  fleetOverrides.set(slug, { ...fleetOverrides.get(slug), ...changes });
}

