import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const userAuthToken = request.cookies.get("auth_token")?.value;
  const adminAuthToken = request.cookies.get("admin_auth_token")?.value;
  const currentPath = request.nextUrl.pathname;

  const loginRoutes = ["/auth/login", "/auth/register"];
  const openPaths = ["/", "/meme", "/generate"];

  const isPathMatch = (paths: string[]) =>
    paths.some((path) => currentPath.startsWith(path));

  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, request.url));

  // Admin is authenticated
  if (adminAuthToken) {
    if (isPathMatch(loginRoutes)) {
      return redirectTo("/admin/users");
    }
    if (currentPath.endsWith("/admin")) {
        return redirectTo("/admin/users");
      }
    return NextResponse.next();
  }

  // User is authenticated
  if (userAuthToken) {
    if (isPathMatch(loginRoutes)) {
      return redirectTo("/");
    }

    // Authenticated user accessing admin
    if (currentPath.startsWith("/admin")) {
      return redirectTo("/");
    }

    return NextResponse.next();
  }

  // Unauthenticated user
  if (isPathMatch(loginRoutes)) {
    return NextResponse.next();
  }

  if (currentPath.startsWith("/admin")) {
    return redirectTo("/auth/login");
  }

  if (isPathMatch(openPaths)) {
    return NextResponse.next();
  }

  return redirectTo("/auth/login");
}

export const config = {
  matcher: [
    "/auth/login",
    "/auth/register",
    "/",
    "/meme",
    "/generate",
    "/admin/:path*",
  ],
};
