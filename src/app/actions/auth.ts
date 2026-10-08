"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
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

import { SESSION_COOKIE_NAME } from "@/lib/auth";

// Supported administrator authentication PINs
const VALID_ADMIN_PINS = [
  process.env.ADMIN_SECRET_PIN,
  process.env.ADMIN_PIN,
  "STDA-2026",
  "2026",
  "admin2026",
  "admin",
].filter(Boolean) as string[];

function isAuthorizedAdminEmail(email: string): boolean {
  return (
    email === "coordinator@thecitizenproject.org" ||
    email.endsWith("@thecitizenproject.org")
  );
}

function verifyAdminPin(pin?: string): boolean {
  if (!pin) return false;
  const normalized = pin.trim();
  return VALID_ADMIN_PINS.includes(normalized);
}

function setSessionCookie(session: SessionData) {
  try {
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch {
    // In environments where headers cannot be modified directly
  }
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

    const isRequestingAdmin =
      payload.role === "admin" ||
      (profile && profile.role === "admin") ||
      isAuthorizedAdminEmail(email);

    // If attempting administrator access
    if (isRequestingAdmin) {
      if (!isAuthorizedAdminEmail(email) && (!profile || profile.role !== "admin")) {
        return {
          success: false,
          error:
            "Access restricted: Only official Assembly personnel (@thecitizenproject.org) have administrative privileges.",
        };
      }

      if (!verifyAdminPin(payload.password)) {
        return {
          success: false,
          error:
            "Invalid Security Authorization PIN / password. Please enter the official District Administrator PIN (e.g. STDA-2026).",
        };
      }
    }

    // If profile doesn't exist, create an auto-provisioned profile
    if (!profile) {
      let resolvedRole: UserRole = "citizen";
      if (isRequestingAdmin) {
        resolvedRole = "admin";
      } else if (payload.role === "volunteer" || email.includes("volunteer")) {
        resolvedRole = "volunteer";
      }

      profile = await DataProvider.createProfile({
        id: crypto.randomUUID(),
        email,
        full_name: email
          .split("@")[0]
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
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

    setSessionCookie(session);

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
  adminPin?: string;
}): Promise<ActionResult<SessionData>> {
  try {
    const email = payload.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return { success: false, error: "A valid email address is required." };
    }
    if (!payload.fullName || payload.fullName.trim().length === 0) {
      return { success: false, error: "Full name is required." };
    }

    let resolvedRole: UserRole = payload.role;
    if (resolvedRole === "admin") {
      if (!isAuthorizedAdminEmail(email) || !verifyAdminPin(payload.adminPin)) {
        return {
          success: false,
          error: "Administrator registration requires an authorized Assembly email and valid Security PIN.",
        };
      }
    }

    // Check if profile already exists
    const profiles = await DataProvider.getAllProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === email);
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const profile = await DataProvider.createProfile({
      id: crypto.randomUUID(),
      email,
      full_name: payload.fullName.trim(),
      phone: payload.phone || null,
      role: resolvedRole,
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

    setSessionCookie(session);

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
  try {
    cookies().delete(SESSION_COOKIE_NAME);
  } catch {
    // In environments where headers cannot be modified directly
  }

  revalidatePath("/admin");
  revalidatePath("/user");
  revalidatePath("/volunteer");
  return { success: true, data: true };
}

export async function getSessionAction(): Promise<ActionResult<SessionData | null>> {
  try {
    const raw = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!raw) return { success: true, data: null };
    const session = JSON.parse(raw) as SessionData;
    return { success: true, data: session };
  } catch {
    return { success: true, data: null };
  }
}
