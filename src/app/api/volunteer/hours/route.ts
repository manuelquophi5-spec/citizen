import { NextResponse } from "next/server";
import { DataProvider } from "@/lib/data-provider";
import { getServerSession } from "@/lib/auth";
import type { VolunteerHourStatus } from "@/types/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const volunteerId = searchParams.get("volunteerId") || undefined;
    const status = (searchParams.get("status") as VolunteerHourStatus) || undefined;

    const hours = await DataProvider.getVolunteerHours({ volunteerId, status });
    return NextResponse.json({ success: true, data: hours });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch volunteer hours";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.volunteer_id || !body.activity || !body.hours) {
      return NextResponse.json(
        { success: false, error: "volunteer_id, activity, and hours are required." },
        { status: 400 }
      );
    }

    const session = await getServerSession();
    if (session && session.role === "volunteer" && session.userId !== body.volunteer_id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot log volunteer hours for another account." },
        { status: 403 }
      );
    }

    const entry = await DataProvider.logVolunteerHours({
      volunteer_id: body.volunteer_id,
      activity: body.activity,
      category: body.category || "Community Service",
      hours: Number(body.hours),
      date: body.date || new Date().toISOString().split("T")[0],
      supervisor: body.supervisor || "District Coordinator",
      status: "PENDING",
      field_notes: body.field_notes || body.notes || null,
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to log volunteer hours";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
