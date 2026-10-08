import { cookies } from "next/headers";
import type { SessionData } from "@/app/actions/auth";

export const SESSION_COOKIE_NAME = "tcp_session";

/**
 * Retrieves the current authenticated session from HTTP cookies (Server-side).
 */
export async function getServerSession(): Promise<SessionData | null> {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

/**
 * Requires an active session with the 'admin' role. Throws an error or returns null.
 */
export async function requireAdminSession(): Promise<SessionData> {
  const session = await getServerSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized: Official Administrator privileges required.");
  }
  return session;
}
