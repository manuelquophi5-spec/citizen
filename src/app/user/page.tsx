"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  SESSION_CHANGED_EVENT,
  type LocalSession,
} from "@/lib/local-session";
import { getFavoriteSlugs, FAVORITES_CHANGED_EVENT } from "@/lib/local-favorites";
import { UserDashboard } from "@/components/dashboard/user-dashboard";

const SAMPLE_FAVORITE_SLUGS = ["youth-skills-livelihood-initiative"];

export default function DedicatedUserPage() {
  const router = useRouter();
  const [session, setSessionState] = useState<LocalSession | null | "checking">("checking");
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);

  useEffect(() => {
    const existing = getSession();
    if (!existing || (existing.role !== "user" && existing.role !== "citizen")) {
      router.replace("/login?role=user&redirect=/user");
      return;
    }
    setSessionState(existing);

    const saved = getFavoriteSlugs();
    setFavoriteSlugs(saved.length > 0 ? saved : SAMPLE_FAVORITE_SLUGS);

    const handleSessionSync = () => {
      const current = getSession();
      if (!current || (current.role !== "user" && current.role !== "citizen")) {
        router.replace("/login?role=user&redirect=/user");
      } else {
        setSessionState(current);
      }
    };

    const handleFavoritesSync = () => {
      const updated = getFavoriteSlugs();
      setFavoriteSlugs(updated.length > 0 ? updated : SAMPLE_FAVORITE_SLUGS);
    };

    window.addEventListener(SESSION_CHANGED_EVENT, handleSessionSync);
    window.addEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesSync);

    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, handleSessionSync);
      window.removeEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesSync);
    };
  }, [router]);

  if (session === "checking" || session === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#0c1322]">
        <div className="flex items-center gap-3 text-sm text-ocean-600 dark:text-ocean-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span>Authenticating Citizen Portal…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white dark:bg-[#0c1322]">
      <UserDashboard session={session} favoriteSlugs={favoriteSlugs} />
    </div>
  );
}
