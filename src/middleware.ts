import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/", "/auth/login", "/auth/signup"];
  console.log("Middleware Debug:", {
    pathname,
    session: !!session,
  });
  if (!session && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/session|_next/static|_next/image).*)"],
};
