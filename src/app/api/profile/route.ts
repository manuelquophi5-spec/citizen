import { NextResponse } from "next/server";
import { DataProvider } from "@/lib/data-provider";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      const profiles = await DataProvider.getAllProfiles();
      return NextResponse.json({ success: true, data: profiles });
    }

    const profile = await DataProvider.getProfileById(userId);
    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch profile";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.userId) {
      return NextResponse.json({ success: false, error: "userId is required." }, { status: 400 });
    }

    const updated = await DataProvider.updateProfile(body.userId, body.updates || {});
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
