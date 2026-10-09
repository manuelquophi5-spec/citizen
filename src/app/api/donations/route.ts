import { NextResponse } from "next/server";
import { DataProvider } from "@/lib/data-provider";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const initiativeId = searchParams.get("initiativeId") || undefined;

    const donations = await DataProvider.getDonations({ userId, initiativeId });
    return NextResponse.json(
      { success: true, data: donations },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch donations";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.amount || !body.donor_email) {
      return NextResponse.json(
        { success: false, error: "amount and donor_email are required." },
        { status: 400 }
      );
    }

    const donation = await DataProvider.createDonation({
      amount: Number(body.amount),
      currency: body.currency || "GHS",
      frequency: body.frequency || "ONE_TIME",
      donor_email: body.donor_email,
      donor_name: body.donor_name || null,
      user_id: body.user_id || null,
      initiative_id: body.initiative_id || null,
      payment_method: body.payment_method || "Paystack",
      reference: body.reference || `TCP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: body.status || "SUCCESS",
      anonymous: !!body.anonymous,
    });

    return NextResponse.json({ success: true, data: donation }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record donation";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
