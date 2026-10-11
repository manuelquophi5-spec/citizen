"use server";

import { revalidatePath } from "next/cache";
import { DataProvider } from "@/lib/data-provider";
import { getCurrentUserWithRole } from "@/lib/rbac";
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

    const currentUser = await getCurrentUserWithRole();
    if (!currentUser) {
      return {
        success: false,
        error: "Unauthorized: Authentication required to update profiles.",
      };
    }

    if (currentUser.userId !== userId && currentUser.role !== "admin") {
      return {
        success: false,
        error: "Forbidden: Cannot update another citizen's profile.",
      };
    }

    // Role escalation prevention: only administrators can change user roles
    const safeUpdates: ProfileUpdate = { ...updates };
    if (safeUpdates.role !== undefined && currentUser.role !== "admin") {
      delete safeUpdates.role;
    }

    const updated = await DataProvider.updateProfile(userId, safeUpdates);

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
    const currentUser = await getCurrentUserWithRole();
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "volunteer")) {
      return {
        success: false,
        error: "Unauthorized: Administrator or Volunteer privileges required.",
      };
    }

    const profiles = await DataProvider.getAllProfiles();
    return { success: true, data: profiles };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch district profiles.";
    return { success: false, error: message };
  }
}
