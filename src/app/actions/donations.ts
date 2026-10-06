"use server";

import { revalidatePath } from "next/cache";
import { DataProvider } from "@/lib/data-provider";
import type {
  ActionResult,
  DonationInsert,
  DonationRow,
  DonationStatus,
  InitiativeRow,
} from "@/types/database";

export async function recordDonationAction(
  input: Omit<DonationInsert, "id" | "created_at">
): Promise<ActionResult<DonationRow>> {
  try {
    if (typeof input.amount !== "number" || isNaN(input.amount) || input.amount <= 0) {
      return { success: false, error: "Donation amount must be greater than zero." };
    }
    if (!input.donor_email || input.donor_email.trim().length === 0) {
      return { success: false, error: "Donor email is required." };
    }

    const donation = await DataProvider.createDonation({
      amount: Number(input.amount),
      currency: input.currency || "GHS",
      frequency: input.frequency || "ONE_TIME",
      donor_email: input.donor_email.trim(),
      donor_name: input.donor_name || null,
      user_id: input.user_id || null,
      initiative_id: input.initiative_id || null,
      payment_method: input.payment_method || "Paystack",
      reference: input.reference || `TCP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: input.status || "SUCCESS",
      anonymous: !!input.anonymous,
    });

    revalidatePath("/donate");
    revalidatePath("/initiatives");
    revalidatePath("/user");
    revalidatePath("/admin");

    return { success: true, data: donation };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record donation.";
    return { success: false, error: message };
  }
}

export async function getDonationHistoryAction(filter?: {
  userId?: string;
  initiativeId?: string;
}): Promise<ActionResult<DonationRow[]>> {
  try {
    const donations = await DataProvider.getDonations(filter);
    return { success: true, data: donations };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch donation history.";
    return { success: false, error: message };
  }
}

export async function updateDonationStatusAction(
  id: string,
  status: DonationStatus
): Promise<ActionResult<DonationRow>> {
  try {
    if (!id) {
      return { success: false, error: "Donation ID is required." };
    }

    const donation = await DataProvider.updateDonationStatus(id, status);

    revalidatePath("/donate");
    revalidatePath("/initiatives");
    revalidatePath("/user");
    revalidatePath("/admin");

    return { success: true, data: donation };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update donation status.";
    return { success: false, error: message };
  }
}

export async function getInitiativesAction(): Promise<ActionResult<InitiativeRow[]>> {
  try {
    const initiatives = await DataProvider.getInitiatives();
    return { success: true, data: initiatives };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch initiatives.";
    return { success: false, error: message };
  }
}

export const createDonationAction = recordDonationAction;
