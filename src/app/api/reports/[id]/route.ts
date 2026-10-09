import { NextResponse } from "next/server";
import { DataProvider } from "@/lib/data-provider";
import { getServerSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await DataProvider.getReportById(params.id);
    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: report });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch report";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator privileges required to update civic reports." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = await DataProvider.updateReport(params.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update report";
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
      const report = await DataProvider.getReportById(params.id);
      if (!report) {
        return NextResponse.json({ success: false, error: "Report not found." }, { status: 404 });
      }
      if (report.user_id !== session.userId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Cannot delete other citizens' reports." },
          { status: 403 }
        );
      }
      if (report.status !== "SUBMITTED") {
        return NextResponse.json(
          { success: false, error: "Cannot delete report once under official review." },
          { status: 400 }
        );
      }
    }

    const deleted = await DataProvider.deleteReport(params.id);
    return NextResponse.json({ success: true, data: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete report";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
