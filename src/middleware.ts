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
      const login = req.nextUrl.clone();
      login.pathname = "/admin/login";
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
