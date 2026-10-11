"use server";

import { DataProvider } from "@/lib/data-provider";
import type { ActionResult, ContactInquiryInsert, ContactInquiryRow } from "@/types/database";

export async function submitContactAction(
  input: ContactInquiryInsert
): Promise<ActionResult<ContactInquiryRow>> {
  try {
    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: "Full name is required." };
    }
    if (!input.email || !input.email.includes("@")) {
      return { success: false, error: "A valid email address is required." };
    }
    if (!input.subject || input.subject.trim().length === 0) {
      return { success: false, error: "Subject is required." };
    }
    if (!input.message || input.message.trim().length === 0) {
      return { success: false, error: "Message content is required." };
    }

    const inquiry = await DataProvider.createContactInquiry({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone ? input.phone.trim() : null,
      subject: input.subject.trim(),
      message: input.message.trim(),
      status: "NEW",
    });

    return { success: true, data: inquiry };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit contact message.";
    return { success: false, error: message };
  }
}
