import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { DataProvider } from "@/lib/data-provider";
import { getServerSession } from "@/lib/auth";
import type { ProfileRow, UserRole } from "@/types/database";

export type { UserRole };

export type Permission =
  | "admin:access"
  | "admin:manage_users"
  | "admin:system_audit"
  | "reports:create"
  | "reports:view"
  | "reports:manage"
  | "reports:dispatch"
  | "volunteer:log_hours"
  | "volunteer:view_ledger"
  | "volunteer:verify_hours"
  | "volunteer:void_hours"
  | "initiatives:create"
  | "initiatives:edit"
  | "voting:cast_ballot"
  | "voting:view_results"
  | "media:upload"
  | "media:delete";

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: [
    "admin:access",
    "admin:manage_users",
    "admin:system_audit",
    "reports:create",
    "reports:view",
    "reports:manage",
    "reports:dispatch",
    "volunteer:log_hours",
    "volunteer:view_ledger",
    "volunteer:verify_hours",
    "volunteer:void_hours",
    "initiatives:create",
    "initiatives:edit",
    "voting:cast_ballot",
    "voting:view_results",
    "media:upload",
    "media:delete",
  ],
  volunteer: [
    "reports:create",
    "reports:view",
    "volunteer:log_hours",
    "volunteer:view_ledger",
    "voting:cast_ballot",
    "voting:view_results",
  ],
  citizen: [
    "reports:create",
    "reports:view",
    "voting:cast_ballot",
    "voting:view_results",
  ],
};

/**
 * Validates if Clerk authentication is configured with valid environment variables.
 */
export function isClerkConfigured(): boolean {
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secKey = process.env.CLERK_SECRET_KEY;
  return Boolean(
    pubKey &&
      secKey &&
      pubKey.startsWith("pk_") &&
      !pubKey.includes("dummy") &&
      !pubKey.includes("placeholder")
  );
}

/**
 * Checks if a specific role possesses the required domain permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export interface AuthenticatedUser {
  userId: string; // Supabase Profile ID (UUID)
  clerkId: string | null;
  email: string;
  fullName: string;
  role: UserRole;
  profile: ProfileRow;
}

/**
 * Synchronizes or creates a Supabase Profile for a Clerk identity,
 * ensuring Supabase remains the definitive source of truth for RBAC.
 */
export async function syncClerkUserToSupabase(
  clerkId: string,
  email: string,
  fullName: string,
  desiredRole?: UserRole
): Promise<ProfileRow> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Look up by clerk_id
  let profile = await DataProvider.getProfileByClerkId(clerkId);
  if (profile) {
    if (desiredRole && desiredRole !== profile.role) {
      profile = await DataProvider.updateProfile(profile.id, { role: desiredRole });
    }
    return profile;
  }

  // 2. Look up by email
  profile = await DataProvider.getProfileByEmail(normalizedEmail);
  if (profile) {
    // Associate clerk_id with existing Supabase profile
    profile = await DataProvider.updateProfile(profile.id, {
      clerk_id: clerkId,
      ...(desiredRole && desiredRole !== profile.role ? { role: desiredRole } : {}),
    });
    return profile;
  }

  // 3. Auto-provision new profile in Supabase
  let role: UserRole = desiredRole || "citizen";
  if (
    normalizedEmail === "coordinator@thecitizenproject.org" ||
    normalizedEmail.endsWith("@thecitizenproject.org")
  ) {
    role = "admin";
  }

  const newProfile = await DataProvider.createProfile({
    id: crypto.randomUUID(),
    clerk_id: clerkId,
    email: normalizedEmail,
    full_name: fullName || normalizedEmail.split("@")[0],
    role,
    electoral_area: "Sogakope Central",
    skills: role === "volunteer" ? ["Civic Mobilization", "Community Cleanup"] : [],
  });

  // Best effort: update Clerk publicMetadata so client tokens reflect the Supabase role
  if (isClerkConfigured()) {
    try {
      await clerkClient.users.updateUserMetadata(clerkId, {
        publicMetadata: { role: newProfile.role },
      });
    } catch {
      // Non-blocking if Clerk rate limits or offline
    }
  }

  return newProfile;
}

/**
 * Retrieves the currently authenticated identity and their Supabase RBAC profile.
 * Prioritizes Clerk identity, seamlessly falling back to local cryptographic session
 * for local development and headless E2E suites.
 */
export async function getCurrentUserWithRole(): Promise<AuthenticatedUser | null> {
  // Strategy A: Check Clerk Auth
  if (isClerkConfigured()) {
    try {
      const { userId: clerkUserId } = auth();
      if (clerkUserId) {
        const clerkUser = await currentUser();
        if (clerkUser) {
          const primaryEmail =
            clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
              ?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

          if (primaryEmail) {
            const fullName =
              [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
              primaryEmail.split("@")[0];

            const profile = await syncClerkUserToSupabase(
              clerkUserId,
              primaryEmail,
              fullName
            );

            return {
              userId: profile.id,
              clerkId: clerkUserId,
              email: profile.email,
              fullName: profile.full_name,
              role: profile.role,
              profile,
            };
          }
        }
      }
    } catch {
      // Continue to local session fallback
    }
  }

  // Strategy B: Check Local Cryptographic Session (cookie-based fallback)
  const session = await getServerSession();
  if (session) {
    let profile = await DataProvider.getProfileById(session.userId);
    if (!profile) {
      profile = await DataProvider.getProfileByEmail(session.email);
    }

    const authoritativeRole = profile ? profile.role : session.role;

    const effectiveProfile: ProfileRow = profile || {
      id: session.userId,
      clerk_id: null,
      email: session.email,
      full_name: session.name,
      phone: null,
      role: authoritativeRole,
      electoral_area: session.electoralArea || "Sogakope Central",
      skills: session.skills || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      userId: effectiveProfile.id,
      clerkId: null,
      email: effectiveProfile.email,
      fullName: effectiveProfile.full_name,
      role: authoritativeRole,
      profile: effectiveProfile,
    };
  }

  return null;
}

/**
 * Server-side RBAC guard. Ensures the user is authenticated and possesses
 * one of the required Supabase roles. Throws or redirects if unauthorized.
 */
export async function requireRole(
  allowedRoles: UserRole | UserRole[],
  options?: { redirectTo?: string }
): Promise<AuthenticatedUser> {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const user = await getCurrentUserWithRole();

  if (!user) {
    const loginUrl = options?.redirectTo || (isClerkConfigured() ? "/sign-in" : "/login");
    throw new Error(`Unauthorized: Authentication required. Redirect to ${loginUrl}`);
  }

  if (!roles.includes(user.role)) {
    throw new Error(
      `Forbidden: Insufficient privileges. Required role: [${roles.join(", ")}], current: ${user.role}`
    );
  }

  return user;
}

export async function requireAdmin(redirectTo?: string): Promise<AuthenticatedUser> {
  return requireRole("admin", { redirectTo: redirectTo || "/admin/login" });
}

export async function requireVolunteer(redirectTo?: string): Promise<AuthenticatedUser> {
  return requireRole(["volunteer", "admin"], { redirectTo });
}

export async function requireCitizen(redirectTo?: string): Promise<AuthenticatedUser> {
  return requireRole(["citizen", "volunteer", "admin"], { redirectTo });
}

/**
 * Updates a user's role in Supabase and synchronizes to Clerk metadata.
 */
export async function updateUserRoleInSupabase(
  profileId: string,
  newRole: UserRole
): Promise<ProfileRow> {
  const profile = await DataProvider.updateProfile(profileId, { role: newRole });

  if (profile.clerk_id && isClerkConfigured()) {
    try {
      await clerkClient.users.updateUserMetadata(profile.clerk_id, {
        publicMetadata: { role: newRole },
      });
    } catch {
      // Best-effort sync
    }
  }

  return profile;
}
