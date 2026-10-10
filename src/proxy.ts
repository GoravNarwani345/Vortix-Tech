import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Next.js 16 proxy / middleware
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept malformed bot / scanner server action probes (e.g. Next-Action: "\"x\"")
  const nextAction = request.headers.get("next-action");
  if (nextAction) {
    if (
      nextAction.length < 16 ||
      nextAction.includes('"') ||
      nextAction.includes("'") ||
      nextAction.includes("\\")
    ) {
      return new NextResponse("Invalid action reference", { status: 400 });
    }
  }

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (!(await verifySession(token))) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/admin/upload|uploads).*)",
  ],
};
