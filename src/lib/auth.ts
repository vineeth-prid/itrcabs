import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "itr_admin_session";
const SESSION_TTL = 60 * 60 * 8; // 8 hours

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "itr-cabs-dev-secret-change-me");
}

export interface AdminSession {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export async function createSession(payload: AdminSession): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL,
    path: "/",
  });
}

export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export { SESSION_COOKIE };

/**
 * Demo admin credentials used only when no database is configured.
 * Replace by seeding an AdminUser and setting DATABASE_URL.
 */
export const DEMO_ADMIN = {
  email: process.env.DEMO_ADMIN_EMAIL ?? "admin@itrcabs.com",
  password: process.env.DEMO_ADMIN_PASSWORD ?? "itrcabs@2026",
  name: "ITR Admin",
  role: "SUPER_ADMIN",
};
