import { NextResponse } from "next/server";
import { DataProvider } from "@/lib/data-provider";
import type { ReportStatus } from "@/types/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const status = (searchParams.get("status") as ReportStatus) || undefined;
    const category = searchParams.get("category") || undefined;

    const reports = await DataProvider.getReports({ userId, status, category });
    return NextResponse.json({ success: true, data: reports });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch reports";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { success: false, error: "Title, description, and category are required." },
        { status: 400 }
      );
    }

    const report = await DataProvider.createReport({
      title: body.title,
      description: body.description,
      category: body.category,
      user_id: body.user_id || null,
      location: body.location || { community: "Sogakope", town: "South Tongu" },
      priority: body.priority || "MEDIUM",
      status: body.status || "SUBMITTED",
      image_url: body.image_url || null,
      reporter_name: body.reporter_name || null,
      reporter_phone: body.reporter_phone || null,
      reporter_email: body.reporter_email || null,
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create report";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
