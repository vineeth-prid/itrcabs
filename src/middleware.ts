import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { siteConfig } from "@/config/site";

const SESSION_COOKIE = "itr_admin_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET ?? "itr-cabs-dev-secret-change-me"
    );
    try {
      if (!token) throw new Error("no session");
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      // Built from the trusted configured origin, not request headers —
      // req.nextUrl resolves to the internal host (localhost:3000) behind a
      // reverse proxy, and Host/X-Forwarded-Host are attacker-controllable.
      return NextResponse.redirect(
        `${siteConfig.url}/admin/login?next=${encodeURIComponent(pathname)}`
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
