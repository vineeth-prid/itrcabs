import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, hasDatabase } from "@/lib/prisma";
import {
  generateOtp,
  hashOtp,
  getOtpProvider,
  memoryOtpStore,
  OTP_TTL_MS,
  OTP_RESEND_COOLDOWN_S,
} from "@/lib/otp";

const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { phone } = parsed.data;

  const code = generateOtp();
  const codeHash = hashOtp(phone, code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  if (hasDatabase) {
    // Rate limit: one active OTP per cooldown window
    const recent = await prisma.otpCode.findFirst({
      where: { phone, createdAt: { gt: new Date(Date.now() - OTP_RESEND_COOLDOWN_S * 1000) } },
    });
    if (recent) {
      return NextResponse.json(
        { error: `Please wait ${OTP_RESEND_COOLDOWN_S}s before requesting a new code` },
        { status: 429 }
      );
    }
    await prisma.otpCode.deleteMany({ where: { phone } });
    await prisma.otpCode.create({ data: { phone, codeHash, expiresAt } });
  } else {
    memoryOtpStore.set(phone, {
      codeHash,
      expiresAt: expiresAt.getTime(),
      attempts: 0,
      verified: false,
    });
  }

  try {
    await getOtpProvider().send(phone, code);
  } catch (e) {
    console.error("OTP send failed", e);
    return NextResponse.json({ error: "Could not send OTP. Please try again." }, { status: 502 });
  }

  const isDemo = (process.env.OTP_PROVIDER ?? "console") === "console";
  return NextResponse.json({
    ok: true,
    cooldown: OTP_RESEND_COOLDOWN_S,
    // Demo mode only: surface the code so the flow can be completed without an SMS gateway.
    ...(isDemo ? { devCode: code } : {}),
  });
}
