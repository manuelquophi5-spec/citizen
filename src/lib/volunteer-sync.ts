import type { VolunteerHourRow } from "@/types/database";

export const VOLUNTEER_HOURS_CHANGED_EVENT = "tcp:volunteer-hours-changed";
const STORAGE_HOURS_KEY = "tcp:volunteer-hours";

export interface VolunteerHourDisplay {
  id: string;
  volunteerName?: string;
  description: string;
  initiativeTitle: string;
  date: string;
  hours: number;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  supervisor?: string;
  fieldNotes?: string;
}

export async function syncVolunteerHoursFromBackend(): Promise<VolunteerHourDisplay[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch("/api/volunteer/hours");
    if (!res.ok) return [];
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      const converted: VolunteerHourDisplay[] = json.data.map((row: VolunteerHourRow) => ({
        id: row.id,
        volunteerName: row.volunteer_id ? "Akua Agbavitor" : undefined,
        description: row.activity,
        initiativeTitle: row.category,
        date: row.date,
        hours: row.hours,
        approved: row.status === "VERIFIED",
        approvedBy: row.status === "VERIFIED" ? "Selorm Dzreke (District Coordinator)" : undefined,
        approvedAt: row.status === "VERIFIED" ? row.created_at.split("T")[0] : undefined,
        supervisor: row.supervisor || undefined,
        fieldNotes: row.field_notes || undefined,
      }));

      window.localStorage.setItem(STORAGE_HOURS_KEY, JSON.stringify(converted));
      window.dispatchEvent(new CustomEvent(VOLUNTEER_HOURS_CHANGED_EVENT, { detail: converted }));
      return converted;
    }
  } catch {
    // Fallback
  }
  return [];
}

export async function persistVolunteerHourToBackend(entry: {
  volunteer_id: string;
  activity: string;
  category?: string;
  hours: number;
  date?: string;
  supervisor?: string;
  notes?: string;
  reflection?: string;
}) {
  try {
    await fetch("/api/volunteer/hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  } catch {
    // Graceful offline fallback
  }
}

export async function updateVolunteerHourInBackend(
  id: string,
  updates: Partial<VolunteerHourRow>
) {
  try {
    await fetch(`/api/volunteer/hours/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  } catch {
    // Graceful offline fallback
  }
}
