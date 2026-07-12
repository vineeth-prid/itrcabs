import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { hasDatabase } from "@/lib/prisma";
import { getEffectiveFleet, setFleetOverride } from "@/lib/fleet-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vehicles = await getEffectiveFleet();
  return NextResponse.json({ vehicles, source: hasDatabase ? "database" : "demo" });
}

const patchSchema = z.object({
  slug: z.string().min(1),
  basePrice: z.number().int().min(500).max(100000).optional(),
  perDayPrice: z.number().int().min(500).max(100000).optional(),
  extraKmRate: z.number().int().min(5).max(200).optional(),
  driverBata: z.number().int().min(0).max(5000).optional(),
  available: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: `${issue.path.join(".")}: ${issue.message}` },
      { status: 400 }
    );
  }
  const { slug, ...changes } = parsed.data;
  await setFleetOverride(slug, changes);
  return NextResponse.json({ ok: true });
}
