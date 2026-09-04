import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { updateCustomer } from "@/lib/booking-store";

export const dynamic = "force-dynamic";

const phone = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

const patchSchema = z.object({
  /** The customer being edited, identified by their current phone number. */
  phone,
  name: z.string().min(2).max(80).optional(),
  newPhone: phone.optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue.path.join(".")}: ${issue.message}` }, { status: 400 });
  }
  const { phone: current, newPhone, ...rest } = parsed.data;
  const updated = await updateCustomer(current, { ...rest, phone: newPhone });
  if (updated === 0) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json({ ok: true, bookingsUpdated: updated });
}
