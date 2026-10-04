import { NextResponse } from "next/server";
import { DataProvider } from "@/lib/data-provider";

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
    const deleted = await DataProvider.deleteReport(params.id);
    return NextResponse.json({ success: true, data: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete report";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
