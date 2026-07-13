import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

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
      // Build the redirect from the proxy's forwarded headers — req.nextUrl
      // points at the internal host (localhost:3000) behind a reverse proxy,
      // and Next.js middleware rejects relative Location headers.
      const proto =
        req.headers.get("x-forwarded-proto")?.split(",")[0].trim() ??
        req.nextUrl.protocol.replace(":", "");
      const host =
        req.headers.get("x-forwarded-host")?.split(",")[0].trim() ??
        req.headers.get("host") ??
        req.nextUrl.host;
      return NextResponse.redirect(
        `${proto}://${host}/admin/login?next=${encodeURIComponent(pathname)}`
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
