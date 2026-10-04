"use server";

import { revalidatePath } from "next/cache";
import { DataProvider } from "@/lib/data-provider";
import type { ActionResult, ProfileRow, ProfileUpdate } from "@/types/database";

export async function getProfileAction(userId: string): Promise<ActionResult<ProfileRow>> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    const profile = await DataProvider.getProfileById(userId);
    if (!profile) {
      return { success: false, error: "Profile not found." };
    }

    return { success: true, data: profile };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve profile.";
    return { success: false, error: message };
  }
}

export async function updateProfileAction(
  userId: string,
  updates: ProfileUpdate
): Promise<ActionResult<ProfileRow>> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    const updated = await DataProvider.updateProfile(userId, updates);

    revalidatePath("/user");
    revalidatePath("/volunteer");
    revalidatePath("/admin");

    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update profile.";
    return { success: false, error: message };
  }
}

export async function getAllProfilesAction(): Promise<ActionResult<ProfileRow[]>> {
  try {
    const profiles = await DataProvider.getAllProfiles();
    return { success: true, data: profiles };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch district profiles.";
    return { success: false, error: message };
  }
}
