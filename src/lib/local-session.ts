// A dummy, client-side-only "session" for the login/signup/dashboard demo.
// There is no backend yet (see PRODUCT.md) — this never validates a password
// or creates a real account. It exists so the login/signup/dashboard flow is
// navigable end-to-end and ready to be swapped for real auth later.

const STORAGE_KEY = "tcp:session";
export const SESSION_CHANGED_EVENT = "tcp:session-changed";

export type UserRole = "user" | "volunteer" | "admin" | "citizen";

export type LocalSession = {
  name: string;
  email: string;
  role: UserRole;
  loggedInAt: string;
  userId?: string;
};

export const DEMO_ACCOUNTS: Record<string, { name: string; email: string; role: UserRole; label: string; desc: string }> = {
  user: {
    name: "Kofi Mensah",
    email: "kofi@citizen.gh",
    role: "user",
    label: "Citizen Supporter",
    desc: "Personal donations, saved initiatives, and community issue tracking.",
  },
  volunteer: {
    name: "Akua Agbavitor",
    email: "akua.volunteer@citizen.gh",
    role: "volunteer",
    label: "Community Volunteer",
    desc: "Log service hours, earn ambassador tiers, and coordinate local events.",
  },
  admin: {
    name: "Selorm Dzreke",
    email: "coordinator@thecitizenproject.org",
    role: "admin",
    label: "District Coordinator",
    desc: "Review community issues, approve volunteer hours, and audit finances.",
  },
};

export function getSession(): LocalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Partial<LocalSession>;
    if (!session.name || !session.email) return null;
    return {
      name: session.name,
      email: session.email,
      role: session.role ?? "user",
      loggedInAt: session.loggedInAt ?? new Date().toISOString(),
      userId: session.userId,
    };
  } catch {
    return null;
  }
}

export function setSession(session: Omit<LocalSession, "loggedInAt"> & { role?: UserRole; userId?: string }) {
  if (typeof window === "undefined") return;
  try {
    const full: LocalSession = {
      name: session.name,
      email: session.email,
      role: session.role ?? "user",
      loggedInAt: new Date().toISOString(),
      userId: session.userId,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT, { detail: full }));
  } catch {
    // localStorage unavailable — the dummy flow just won't persist across reloads.
  }
}

export function switchRole(role: UserRole) {
  if (typeof window === "undefined") return;
  const current = getSession();
  if (current) {
    setSession({ ...current, role });
  } else {
    setSession(DEMO_ACCOUNTS[role]);
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT, { detail: null }));
  } catch {
    // no-op
  }
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || "there";
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
