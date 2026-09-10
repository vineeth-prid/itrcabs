import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { hasDatabase } from "@/lib/prisma";
import {
  getEffectiveFleet,
  setFleetOverride,
  createVehicle,
  deleteVehicle,
} from "@/lib/fleet-store";

export const dynamic = "force-dynamic";

function failed(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  const stale = /column .* does not exist|Unknown argument|P2022/i.test(message);
  console.error("Admin fleet API error:", e);
  return NextResponse.json(
    {
      error: stale
        ? "The database is missing columns this version needs — run `npx prisma db push` against it, then reload."
        : message,
    },
    { status: stale ? 503 : 500 }
  );
}

function bad(e: z.ZodError) {
  const issue = e.issues[0];
  return NextResponse.json({ error: `${issue.path.join(".")}: ${issue.message}` }, { status: 400 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const vehicles = await getEffectiveFleet();
    return NextResponse.json({ vehicles, source: hasDatabase ? "database" : "demo" });
  } catch (e) {
    return failed(e);
  }
}

const money = z.number().int().min(0).max(100000);
/* A photo lives wherever the business already hosts it — we store the address,
   not the bytes, so no upload pipeline is needed to change a picture. */
const imageUrl = z
  .string()
  .trim()
  .url("Enter a full image URL, starting https://")
  .max(500)
  .or(z.literal(""));

const patchSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(2).max(60).optional(),
  seats: z.number().int().min(1).max(60).optional(),
  luggage: z.number().int().min(0).max(60).optional(),
  examples: z.string().max(120).optional(),
  imageUrl: imageUrl.optional(),
  basePrice: money.optional(),
  perDayPrice: money.optional(),
  extraKmRate: z.number().int().min(0).max(500).optional(),
  driverBata: z.number().int().min(0).max(5000).optional(),
  driverBasePrice: money.optional(),
  driverPerDayPrice: money.optional(),
  driverExtraKmRate: z.number().int().min(0).max(500).optional(),
  available: z.boolean().optional(),
});

const postSchema = z.object({
  name: z.string().min(2).max(60),
  category: z.enum(["SEDAN", "SUV", "MPV", "TEMPO_TRAVELLER", "URBANIA"]),
  seats: z.number().int().min(1).max(60),
  luggage: z.number().int().min(0).max(60).default(2),
  examples: z.string().max(120).default(""),
  illustration: z.enum(["sedan", "suv", "suv-luxury", "mpv", "tempo", "urbania"]),
  imageUrl: imageUrl.optional(),
  basePrice: money,
  perDayPrice: money,
  extraKmRate: z.number().int().min(0).max(500),
  driverBata: z.number().int().min(0).max(5000).default(400),
  driverBasePrice: money,
  driverPerDayPrice: money,
  driverExtraKmRate: z.number().int().min(0).max(500),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad(parsed.error);
  try {
    const { imageUrl: url, ...rest } = parsed.data;
    const vehicle = await createVehicle({ ...rest, imageUrl: url || undefined });
    return NextResponse.json({ ok: true, vehicle });
  } catch (e) {
    return failed(e);
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad(parsed.error);
  try {
    const { slug, imageUrl: url, ...changes } = parsed.data;
    /* An emptied field clears the photo rather than storing a blank string. */
    await setFleetOverride(slug, { ...changes, ...(url !== undefined && { imageUrl: url || null }) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return failed(e);
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = z
    .object({ slug: z.string().min(1) })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad(parsed.error);
  try {
    await deleteVehicle(parsed.data.slug);
    return NextResponse.json({ ok: true });
  } catch (e) {
    /* "Built-in vehicles can't be deleted" is the caller's mistake, not a fault. */
    const message = e instanceof Error ? e.message : "Delete failed";
    if (/can't be deleted|switch it off|switch them off/.test(message)) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return failed(e);
  }
}
