import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, hasDatabase } from "@/lib/prisma";
import { hashOtp, memoryOtpStore, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import { issuePhoneToken } from "@/lib/otp-token";

const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { phone, code } = parsed.data;
  const codeHash = hashOtp(phone, code);

  if (hasDatabase) {
    const record = await prisma.otpCode.findFirst({
      where: { phone, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!record) {
      return NextResponse.json({ error: "Code expired — request a new one" }, { status: 400 });
    }
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many attempts — request a new code" }, { status: 429 });
    }
    if (record.codeHash !== codeHash) {
      await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ error: "Incorrect code — please check and retry" }, { status: 400 });
    }
    await prisma.otpCode.update({ where: { id: record.id }, data: { verified: true } });
  } else {
    const entry = memoryOtpStore.get(phone);
    if (!entry || entry.expiresAt < Date.now()) {
      return NextResponse.json({ error: "Code expired — request a new one" }, { status: 400 });
    }
    if (entry.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many attempts — request a new code" }, { status: 429 });
    }
    if (entry.codeHash !== codeHash) {
      entry.attempts += 1;
      return NextResponse.json({ error: "Incorrect code — please check and retry" }, { status: 400 });
    }
    entry.verified = true;
  }

  const token = await issuePhoneToken(phone);
  return NextResponse.json({ ok: true, token });
}
