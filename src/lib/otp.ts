import crypto from "crypto";

/**
 * OTP provider abstraction.
 * Swap providers via OTP_PROVIDER env: "console" (dev) | "msg91" | "twilio".
 * All providers share the same interface so the booking flow never changes.
 */
export interface OtpProvider {
  send(phone: string, code: string): Promise<void>;
}

class ConsoleOtpProvider implements OtpProvider {
  async send(phone: string, code: string) {
    console.log(`[OTP:dev] ${phone} → ${code}`);
  }
}

class Msg91OtpProvider implements OtpProvider {
  async send(phone: string, code: string) {
    const res = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: process.env.MSG91_AUTH_KEY ?? "",
      },
      body: JSON.stringify({
        template_id: process.env.MSG91_TEMPLATE_ID,
        short_url: "0",
        recipients: [{ mobiles: `91${phone}`, otp: code }],
      }),
    });
    if (!res.ok) throw new Error(`MSG91 send failed: ${res.status}`);
  }
}

class TwilioOtpProvider implements OtpProvider {
  async send(phone: string, code: string) {
    const sid = process.env.TWILIO_ACCOUNT_SID ?? "";
    const token = process.env.TWILIO_AUTH_TOKEN ?? "";
    const from = process.env.TWILIO_FROM ?? "";
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: `+91${phone}`,
        From: from,
        Body: `${code} is your ITR Cabs verification code. Valid for 5 minutes.`,
      }),
    });
    if (!res.ok) throw new Error(`Twilio send failed: ${res.status}`);
  }
}

export function getOtpProvider(): OtpProvider {
  switch (process.env.OTP_PROVIDER) {
    case "msg91":
      return new Msg91OtpProvider();
    case "twilio":
      return new TwilioOtpProvider();
    default:
      return new ConsoleOtpProvider();
  }
}

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function hashOtp(phone: string, code: string): string {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET ?? "itr-otp-dev-secret")
    .update(`${phone}:${code}`)
    .digest("hex");
}

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_S = 30;
export const OTP_MAX_ATTEMPTS = 5;

/**
 * In-memory OTP store for demo mode (no DATABASE_URL).
 * Production uses the OtpCode table via Prisma.
 */
type OtpEntry = { codeHash: string; expiresAt: number; attempts: number; verified: boolean };
const globalOtp = globalThis as unknown as { __otpStore?: Map<string, OtpEntry> };
export const memoryOtpStore: Map<string, OtpEntry> =
  globalOtp.__otpStore ?? (globalOtp.__otpStore = new Map());
