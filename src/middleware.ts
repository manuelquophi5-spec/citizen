import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { updateSession } from "@/lib/supabase/middleware";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_")
);

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/volunteer/dashboard(.*)",
  "/user(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Clerk-powered middleware handler (active when Clerk credentials exist)
const clerkHandler = hasClerkKeys
  ? clerkMiddleware(async (auth, request) => {
      const pathname = request.nextUrl.pathname;

      if (isAdminRoute(request) && pathname !== "/admin/login") {
        const { userId, sessionClaims } = auth();
        const clerkRole = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
        const rawSession = request.cookies.get(SESSION_COOKIE_NAME)?.value;
        const localSession = rawSession ? await verifySessionToken(rawSession) : null;

        const isAdmin = clerkRole === "admin" || localSession?.role === "admin";
        if (!userId && !localSession) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/admin/login";
          redirectUrl.searchParams.set("redirect", pathname);
          return NextResponse.redirect(redirectUrl);
        }
        if (!isAdmin && localSession && localSession.role !== "admin") {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/admin/login";
          redirectUrl.searchParams.set("redirect", pathname);
          return NextResponse.redirect(redirectUrl);
        }
      }

      if (isProtectedRoute(request) && pathname !== "/admin/login") {
        const { userId } = auth();
        const rawSession = request.cookies.get(SESSION_COOKIE_NAME)?.value;
        if (!userId && !rawSession) {
          auth().protect();
        }
      }

      return await updateSession(request);
    })
  : null;

// Fallback session middleware handler
async function fallbackMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const rawSession = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = rawSession ? await verifySessionToken(rawSession) : null;

    if (!session || session.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return await updateSession(request);
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (clerkHandler) {
    return clerkHandler(request, event);
  }
  return fallbackMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)",
  ],
};
