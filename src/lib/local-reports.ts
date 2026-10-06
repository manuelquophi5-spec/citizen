import type { SurveyReport } from "@/lib/mock-data";

// Reports submitted through the Survey form on this device. There is no
// backend yet (see PRODUCT.md), so a submitted report is saved to this
// browser's localStorage only — visible on this device's Community Map,
// not shared with other visitors, until a real backend is connected.

const STORAGE_KEY = "tcp:local-reports";
export const REPORTS_CHANGED_EVENT = "tcp:reports-changed";

export type LocalSurveyReport = SurveyReport & { source: "local" };

export function purgeLegacyDemoCache(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("tcp:local-reports");
    window.localStorage.removeItem("tcp:local-donations");
    window.localStorage.removeItem("tcp:volunteer-hours");
  } catch {
    // no-op
  }
}

export function getLocalReports(): LocalSurveyReport[] {
  if (typeof window === "undefined") return [];
  if (process.env.NEXT_PUBLIC_INTEGRITY_MODE === "live") {
    try {
      if (!window.sessionStorage.getItem("tcp:cache-purged")) {
        purgeLegacyDemoCache();
        window.sessionStorage.setItem("tcp:cache-purged", "true");
      }
    } catch {
      // no-op
    }
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as (SurveyReport & { source: "local" })[];
    return parsed.map((r) => ({ ...r, createdAt: new Date(r.createdAt) }));
  } catch {
    return [];
  }
}

export function addLocalReport(report: Omit<LocalSurveyReport, "source">): LocalSurveyReport {
  const full: LocalSurveyReport = { ...report, source: "local" };
  if (typeof window !== "undefined") {
    try {
      const existing = getLocalReports();
      const updated = [full, ...existing];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(REPORTS_CHANGED_EVENT, { detail: updated }));
    } catch {
      // localStorage unavailable
    }
  }
  return full;
}

export function updateLocalReport(id: string, updates: Partial<SurveyReport>): LocalSurveyReport[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getLocalReports();
    const updated = existing.map((r) => (r.id === id ? { ...r, ...updates } : r));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(REPORTS_CHANGED_EVENT, { detail: updated }));
    return updated;
  } catch {
    return [];
  }
}

export function deleteLocalReport(id: string): LocalSurveyReport[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getLocalReports();
    const updated = existing.filter((r) => r.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(REPORTS_CHANGED_EVENT, { detail: updated }));
    return updated;
  } catch {
    return [];
  }
}

export function generateLocalReportId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
