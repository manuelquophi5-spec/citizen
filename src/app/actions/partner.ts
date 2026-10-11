"use server";

import { DataProvider } from "@/lib/data-provider";
import type { ActionResult, PartnerApplicationInsert, PartnerApplicationRow } from "@/types/database";

export async function submitPartnerAction(
  input: PartnerApplicationInsert
): Promise<ActionResult<PartnerApplicationRow>> {
  try {
    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: "Full name is required." };
    }
    if (!input.email || !input.email.includes("@")) {
      return { success: false, error: "A valid email address is required." };
    }
    if (!input.category || input.category.trim().length === 0) {
      return { success: false, error: "Partner category is required." };
    }
    if (!input.purpose || input.purpose.trim().length === 0) {
      return { success: false, error: "Purpose of partnership is required." };
    }

    const application = await DataProvider.createPartnerApplication({
      name: input.name.trim(),
      position: input.position ? input.position.trim() : null,
      organisation: input.organisation ? input.organisation.trim() : null,
      email: input.email.trim().toLowerCase(),
      phone: input.phone ? input.phone.trim() : null,
      website: input.website ? input.website.trim() : null,
      category: input.category.trim(),
      purpose: input.purpose.trim(),
      areas_of_collaboration: input.areas_of_collaboration ? input.areas_of_collaboration.trim() : null,
      referral_source: input.referral_source ? input.referral_source.trim() : null,
      consent: input.consent ?? true,
      status: "PENDING",
    });

    return { success: true, data: application };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit partner application.";
    return { success: false, error: message };
  }
}
