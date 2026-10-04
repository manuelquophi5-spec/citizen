"use server";

import { revalidatePath } from "next/cache";
import { DataProvider } from "@/lib/data-provider";
import type { ActionResult, ProfileRow, UserRole } from "@/types/database";

export interface SessionData {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  electoralArea?: string | null;
  skills?: string[] | null;
}

export async function signInAction(payload: {
  email: string;
  password?: string;
  role?: string;
}): Promise<ActionResult<SessionData>> {
  try {
    const email = payload.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return { success: false, error: "Valid email address is required." };
    }

    const profiles = await DataProvider.getAllProfiles();
    let profile = profiles.find((p) => p.email.toLowerCase() === email);

    // If profile doesn't exist, create an auto-provisioned profile
    if (!profile) {
      let resolvedRole: UserRole = "citizen";
      if (payload.role === "volunteer" || email.includes("volunteer")) {
        resolvedRole = "volunteer";
      } else if (payload.role === "admin" || email.includes("coordinator") || email.endsWith("@thecitizenproject.org")) {
        resolvedRole = "admin";
      }

      profile = await DataProvider.createProfile({
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        email,
        full_name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        role: resolvedRole,
        electoral_area: "Sogakope Central",
        skills: resolvedRole === "volunteer" ? ["Civic Mobilization", "Community Cleanup"] : [],
      });
    }

    const session: SessionData = {
      userId: profile.id,
      name: profile.full_name,
      email: profile.email,
      role: profile.role,
      electoralArea: profile.electoral_area,
      skills: profile.skills,
    };

    revalidatePath("/admin");
    revalidatePath("/user");
    revalidatePath("/volunteer");

    return { success: true, data: session };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed.";
    return { success: false, error: message };
  }
}

export async function signUpAction(payload: {
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  electoralArea?: string;
  skills?: string[];
}): Promise<ActionResult<SessionData>> {
  try {
    const email = payload.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return { success: false, error: "A valid email address is required." };
    }
    if (!payload.fullName || payload.fullName.trim().length === 0) {
      return { success: false, error: "Full name is required." };
    }

    // Check if profile already exists
    const profiles = await DataProvider.getAllProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === email);
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const profile = await DataProvider.createProfile({
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      full_name: payload.fullName.trim(),
      phone: payload.phone || null,
      role: payload.role,
      electoral_area: payload.electoralArea || "Sogakope Central",
      skills: payload.skills || [],
    });

    const session: SessionData = {
      userId: profile.id,
      name: profile.full_name,
      email: profile.email,
      role: profile.role,
      electoralArea: profile.electoral_area,
      skills: profile.skills,
    };

    revalidatePath("/admin");
    revalidatePath("/user");
    revalidatePath("/volunteer");

    return { success: true, data: session };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed.";
    return { success: false, error: message };
  }
}

export async function signOutAction(): Promise<ActionResult<boolean>> {
  revalidatePath("/admin");
  revalidatePath("/user");
  revalidatePath("/volunteer");
  return { success: true, data: true };
}
