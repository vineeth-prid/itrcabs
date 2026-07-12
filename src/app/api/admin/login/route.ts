import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma, hasDatabase } from "@/lib/prisma";
import { createSession, verifyPassword, DEMO_ADMIN } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  if (hasDatabase) {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await createSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
    return NextResponse.json({ ok: true });
  }

  // Demo mode
  if (!safeEqual(email, DEMO_ADMIN.email) || !safeEqual(password, DEMO_ADMIN.password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  await createSession({
    sub: "demo-admin",
    email: DEMO_ADMIN.email,
    name: DEMO_ADMIN.name,
    role: DEMO_ADMIN.role,
  });
  return NextResponse.json({ ok: true });
}
