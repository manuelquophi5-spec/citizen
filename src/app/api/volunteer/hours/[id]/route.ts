import { NextResponse } from "next/server";
import { DataProvider } from "@/lib/data-provider";
import { getServerSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (body.status === "VERIFIED" && session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator privileges required to verify volunteer hours." },
        { status: 403 }
      );
    }

    if (session.role !== "admin") {
      const hours = await DataProvider.getVolunteerHours();
      const entry = hours.find((h) => h.id === params.id);
      if (!entry) {
        return NextResponse.json({ success: false, error: "Volunteer hours record not found." }, { status: 404 });
      }
      if (entry.volunteer_id !== session.userId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Cannot update another volunteer's record." },
          { status: 403 }
        );
      }
      if (entry.status === "VERIFIED") {
        return NextResponse.json(
          { success: false, error: "Forbidden: Verified hours cannot be modified." },
          { status: 400 }
        );
      }
    }

    const updated = body.status === "VOIDED"
      ? await DataProvider.voidVolunteerHours(params.id, body.notes)
      : await DataProvider.updateVolunteerHourStatus(
          params.id,
          body.status || "PENDING",
          body.supervisor,
          body.notes
        );
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update volunteer hour";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authentication required." },
        { status: 401 }
      );
    }

    if (session.role !== "admin") {
      const hours = await DataProvider.getVolunteerHours();
      const entry = hours.find((h) => h.id === params.id);
      if (!entry) {
        return NextResponse.json({ success: false, error: "Volunteer hours record not found." }, { status: 404 });
      }
      if (entry.volunteer_id !== session.userId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Cannot delete another volunteer's record." },
          { status: 403 }
        );
      }
    }

    const deleted = await DataProvider.voidVolunteerHours(params.id, "Deleted via API");
    return NextResponse.json({ success: true, data: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete volunteer hour";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
