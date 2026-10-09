import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { syncClerkUserToSupabase, isClerkConfigured } from "@/lib/rbac";
import type { UserRole } from "@/types/database";

export async function POST(request: Request) {
  try {
    if (!isClerkConfigured()) {
      return NextResponse.json(
        { success: false, error: "Clerk authentication is not configured in this environment." },
        { status: 400 }
      );
    }

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Active Clerk session required." },
        { status: 401 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User identity details could not be retrieved from Clerk." },
        { status: 404 }
      );
    }

    let desiredRole: UserRole | undefined;
    try {
      const body = await request.json();
      if (body.role && ["admin", "citizen", "volunteer"].includes(body.role)) {
        desiredRole = body.role as UserRole;
      }
    } catch {
      // Body is optional
    }

    const primaryEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
      user.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      return NextResponse.json(
        { success: false, error: "User does not have a verified email address." },
        { status: 400 }
      );
    }

    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || primaryEmail.split("@")[0];

    const profile = await syncClerkUserToSupabase(
      userId,
      primaryEmail,
      fullName,
      desiredRole
    );

    return NextResponse.json({
      success: true,
      profile,
      role: profile.role,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!isClerkConfigured()) {
      return NextResponse.json({ success: true, clerkConfigured: false, authenticated: false });
    }

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ success: true, clerkConfigured: true, authenticated: false });
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    return NextResponse.json({
      success: true,
      clerkConfigured: true,
      authenticated: true,
      userId,
      email,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
