import {
  fleet as baseFleet,
  categories,
  fitsPassengers,
  type Illustration,
  type VehicleCategory,
  type VehicleSpec,
} from "@/config/fleet";
import { prisma, hasDatabase } from "@/lib/prisma";

export { fitsPassengers };

/**
 * Single source of truth for fleet data everywhere on the site.
 *
 * The twelve shipped vehicles have their copy in version-controlled config;
 * everything an admin can change — prices, availability, photo, and any
 * vehicle they add themselves — lives in the database, or in an in-memory
 * store when running without one. Public pages, the booking engine and the
 * admin panel all read through here, so an edit is live everywhere at once.
 */

export interface EffectiveVehicle extends VehicleSpec {
  available: boolean;
  /** Admin-set photo. Falls back to the vector illustration when empty. */
  imageUrl?: string;
  /** False for the shipped twelve: their copy lives in config, not the DB. */
  custom: boolean;
}

/** The numbers and the photo — everything editable on an existing vehicle. */
export interface FleetOverride {
  name?: string;
  seats?: number;
  luggage?: number;
  examples?: string;
  imageUrl?: string | null;
  basePrice?: number;
  perDayPrice?: number;
  extraKmRate?: number;
  driverBata?: number;
  driverBasePrice?: number;
  driverPerDayPrice?: number;
  driverExtraKmRate?: number;
  available?: boolean;
}

/** Everything needed to stand up a vehicle that is not in the shipped config. */
export interface NewVehicle {
  name: string;
  category: VehicleCategory;
  seats: number;
  luggage: number;
  examples: string;
  illustration: Illustration;
  imageUrl?: string;
  basePrice: number;
  perDayPrice: number;
  extraKmRate: number;
  driverBata: number;
  driverBasePrice: number;
  driverPerDayPrice: number;
  driverExtraKmRate: number;
}

const g = globalThis as unknown as {
  __fleetOverrides?: Map<string, FleetOverride>;
  __customFleet?: Map<string, EffectiveVehicle>;
};
export const fleetOverrides: Map<string, FleetOverride> =
  g.__fleetOverrides ?? (g.__fleetOverrides = new Map());
/** Admin-added vehicles when there is no database. */
const customFleet: Map<string, EffectiveVehicle> =
  g.__customFleet ?? (g.__customFleet = new Map());

const labelFor = (c: string) =>
  categories.find((x) => x.value === c)?.label ?? c.charAt(0) + c.slice(1).toLowerCase();

/** Turns a name into a URL-safe slug, kept unique against what already exists. */
export function slugify(name: string, taken: Set<string>): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "vehicle";
  let slug = base;
  for (let n = 2; taken.has(slug); n += 1) slug = `${base}-${n}`;
  return slug;
}

type VehicleRow = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  seats: number;
  luggage: number;
  ac: boolean;
  fuel: string;
  basePrice: number;
  perDayPrice: number;
  extraKmRate: number;
  driverBata: number;
  driverBasePrice: number;
  driverPerDayPrice: number;
  driverExtraKmRate: number;
  illustration: string;
  features: string[];
  examples: string;
  imageUrl: string | null;
  popular: boolean;
  available: boolean;
  sortOrder: number;
};

/** A database row on top of its config entry, where one exists. */
function merge(row: VehicleRow, base?: VehicleSpec): EffectiveVehicle {
  return {
    slug: row.slug,
    name: row.name || base?.name || row.slug,
    category: (row.category as VehicleCategory) ?? base?.category ?? "SEDAN",
    categoryLabel: labelFor(row.category ?? base?.category ?? "SEDAN"),
    tagline: row.tagline || base?.tagline || "",
    description: row.description || base?.description || "",
    seats: row.seats ?? base?.seats ?? 4,
    luggage: row.luggage ?? base?.luggage ?? 2,
    ac: row.ac ?? base?.ac ?? true,
    fuel: (row.fuel as VehicleSpec["fuel"]) ?? base?.fuel ?? "Diesel",
    /* A zero here means the column predates the driver rate card, so the
       config value is the better answer. */
    basePrice: row.basePrice || base?.basePrice || 0,
    perDayPrice: row.perDayPrice || base?.perDayPrice || 0,
    extraKmRate: row.extraKmRate || base?.extraKmRate || 0,
    driverBata: row.driverBata ?? base?.driverBata ?? 0,
    driverBasePrice: row.driverBasePrice || base?.driverBasePrice || 0,
    driverPerDayPrice: row.driverPerDayPrice || base?.driverPerDayPrice || 0,
    driverExtraKmRate: row.driverExtraKmRate || base?.driverExtraKmRate || 0,
    illustration: (row.illustration as Illustration) ?? base?.illustration ?? "sedan",
    features: row.features?.length ? row.features : (base?.features ?? []),
    examples: row.examples || base?.examples || "",
    popular: row.popular ?? base?.popular ?? false,
    imageUrl: row.imageUrl ?? undefined,
    available: row.available ?? true,
    custom: !base,
  };
}

export async function getEffectiveFleet(): Promise<EffectiveVehicle[]> {
  if (hasDatabase) {
    const rows = (await prisma.vehicle.findMany({
      orderBy: { sortOrder: "asc" },
    })) as unknown as VehicleRow[];
    const bySlug = new Map(rows.map((r) => [r.slug, r]));
    const configured = baseFleet.map((v) => {
      const row = bySlug.get(v.slug);
      return row ? merge(row, v) : { ...v, available: true, custom: false };
    });
    /* Anything in the database the config has never heard of was added here. */
    const added = rows
      .filter((r) => !baseFleet.some((v) => v.slug === r.slug))
      .map((r) => merge(r));
    return [...configured, ...added];
  }

  const configured = baseFleet.map((v) => {
    const o = fleetOverrides.get(v.slug) ?? {};
    return {
      ...v,
      ...o,
      imageUrl: o.imageUrl ?? undefined,
      available: o.available ?? true,
      custom: false,
    } as EffectiveVehicle;
  });
  const added = [...customFleet.values()].map((v) => ({
    ...v,
    ...(fleetOverrides.get(v.slug) ?? {}),
  })) as EffectiveVehicle[];
  return [...configured, ...added];
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

export async function createVehicle(input: NewVehicle): Promise<EffectiveVehicle> {
  const existing = await getEffectiveFleet();
  const slug = slugify(input.name, new Set(existing.map((v) => v.slug)));
  const shared = {
    slug,
    tagline: "",
    description: "",
    ac: true,
    fuel: "Diesel" as const,
    features: [] as string[],
    popular: false,
    available: true,
    sortOrder: existing.length,
    ...input,
  };

  if (hasDatabase) {
    const row = (await prisma.vehicle.create({ data: shared })) as unknown as VehicleRow;
    return merge(row);
  }
  const vehicle: EffectiveVehicle = {
    ...shared,
    categoryLabel: labelFor(input.category),
    custom: true,
  };
  customFleet.set(slug, vehicle);
  return vehicle;
}

/**
 * Removes a vehicle an admin added. The shipped twelve are not deletable —
 * their copy lives in config, so a delete would simply reappear on redeploy,
 * and bookings reference them. Mark those unavailable instead.
 */
export async function deleteVehicle(slug: string): Promise<void> {
  if (baseFleet.some((v) => v.slug === slug)) {
    throw new Error("Built-in vehicles can't be deleted — switch them off instead");
  }
  if (hasDatabase) {
    const bookings = await prisma.booking.count({ where: { vehicle: { slug } } });
    if (bookings > 0) {
      throw new Error(`${bookings} booking(s) use this vehicle — switch it off instead`);
    }
    await prisma.vehicle.delete({ where: { slug } });
    return;
  }
  customFleet.delete(slug);
  fleetOverrides.delete(slug);
}
