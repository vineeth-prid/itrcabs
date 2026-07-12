import { SignJWT, jwtVerify } from "jose";

const secret = () =>
  new TextEncoder().encode(process.env.OTP_SECRET ?? "itr-otp-dev-secret");

/** Short-lived proof that a phone number passed OTP verification. */
export async function issuePhoneToken(phone: string): Promise<string> {
  return new SignJWT({ phone, purpose: "booking" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("20m")
    .sign(secret());
}

export async function verifyPhoneToken(token: string, phone: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.phone === phone && payload.purpose === "booking";
  } catch {
    return false;
  }
}
