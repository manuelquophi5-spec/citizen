import { NextResponse } from "next/server";
import { DataProvider } from "@/lib/data-provider";

export async function GET() {
  try {
    const initiatives = await DataProvider.getInitiatives();
    return NextResponse.json({ success: true, data: initiatives });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch initiatives";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
