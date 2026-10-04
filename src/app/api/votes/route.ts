import { NextResponse } from "next/server";
import { DataProvider } from "@/lib/data-provider";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const mode = searchParams.get("mode");

    if (mode === "counts") {
      const counts = await DataProvider.getPriorityVoteCounts();
      return NextResponse.json({ success: true, data: counts });
    }

    const votes = await DataProvider.getPriorityVotes(userId);
    return NextResponse.json({ success: true, data: votes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch priority votes";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.user_id || !body.project_name) {
      return NextResponse.json(
        { success: false, error: "user_id and project_name are required." },
        { status: 400 }
      );
    }

    const vote = await DataProvider.castPriorityVote({
      user_id: body.user_id,
      project_name: body.project_name,
      category: body.category || "General",
      vote_date: body.vote_date || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: vote }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to cast priority vote";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
