"use server";

import { DataProvider } from "@/lib/data-provider";
import type { ActionResult, NewsletterSubscriberRow } from "@/types/database";

export async function subscribeNewsletterAction(
  email: string
): Promise<ActionResult<NewsletterSubscriberRow>> {
  try {
    const trimmed = (email || "").trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const subscriber = await DataProvider.createNewsletterSubscription({
      email: trimmed,
      status: "ACTIVE",
    });

    return { success: true, data: subscriber };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to subscribe to civic updates.";
    return { success: false, error: message };
  }
}
