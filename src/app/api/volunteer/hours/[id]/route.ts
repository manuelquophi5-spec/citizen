import { NextResponse } from "next/server";
import { DataProvider } from "@/lib/data-provider";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
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
    const deleted = await DataProvider.voidVolunteerHours(params.id, "Deleted via API");
    return NextResponse.json({ success: true, data: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete volunteer hour";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
