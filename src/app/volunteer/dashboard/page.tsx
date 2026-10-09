"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, setSession, type LocalSession } from "@/lib/local-session";
import { VolunteerDashboard } from "@/components/dashboard/volunteer-dashboard";

export default function DedicatedVolunteerDashboardPage() {
  const router = useRouter();
  const [session, setSessionState] = useState<LocalSession | null | "checking">("checking");

  useEffect(() => {
    const existing = getSession();
    if (!existing) {
      router.replace("/login?role=volunteer&redirect=/volunteer/dashboard");
      return;
    }

    // If signed in as citizen, upgrade session to volunteer
    if (existing.role !== "volunteer") {
      const upgraded: LocalSession = { ...existing, role: "volunteer" };
      setSession(upgraded);
      setSessionState(upgraded);
    } else {
      setSessionState(existing);
    }
  }, [router]);

  if (session === "checking" || session === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#0c1322]">
        <div className="flex items-center gap-3 text-sm text-ocean-600 dark:text-ocean-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span>Opening Volunteer Console…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white dark:bg-[#0c1322]">
      <VolunteerDashboard session={session} />
    </div>
  );
}
