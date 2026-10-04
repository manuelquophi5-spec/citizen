"use server";

import { revalidatePath } from "next/cache";
import { DataProvider } from "@/lib/data-provider";
import type {
  ActionResult,
  VolunteerHourInsert,
  VolunteerHourRow,
  VolunteerHourStatus,
  VolunteerHourUpdate,
} from "@/types/database";

export async function logVolunteerHoursAction(
  input: Omit<VolunteerHourInsert, "id" | "created_at">
): Promise<ActionResult<VolunteerHourRow>> {
  try {
    if (!input.volunteer_id) {
      return { success: false, error: "Volunteer ID is required." };
    }
    if (!input.activity || input.activity.trim().length === 0) {
      return { success: false, error: "Activity description is required." };
    }
    if (typeof input.hours !== "number" || isNaN(input.hours) || input.hours <= 0) {
      return { success: false, error: "Hours must be a positive number." };
    }

    const entry = await DataProvider.logVolunteerHours({
      volunteer_id: input.volunteer_id,
      activity: input.activity.trim(),
      category: input.category || "Community Service",
      hours: Number(input.hours),
      date: input.date || new Date().toISOString().split("T")[0],
      supervisor: input.supervisor || "District Coordinator",
      status: "PENDING",
      field_notes: input.field_notes || null,
    });

    revalidatePath("/volunteer");
    revalidatePath("/admin");

    return { success: true, data: entry };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to log volunteer hours.";
    return { success: false, error: message };
  }
}

export async function getVolunteerHoursAction(filter?: {
  volunteerId?: string;
  status?: VolunteerHourStatus;
}): Promise<ActionResult<VolunteerHourRow[]>> {
  try {
    const hours = await DataProvider.getVolunteerHours(filter);
    return { success: true, data: hours };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch volunteer hours.";
    return { success: false, error: message };
  }
}

export async function updateVolunteerHoursAction(
  id: string,
  updates: VolunteerHourUpdate
): Promise<ActionResult<VolunteerHourRow>> {
  try {
    if (!id) {
      return { success: false, error: "Hour entry ID is required." };
    }

    const updated = await DataProvider.updateVolunteerHourStatus(
      id,
      updates.status || "PENDING",
      updates.supervisor || undefined,
      updates.field_notes || undefined
    );

    revalidatePath("/volunteer");
    revalidatePath("/admin");

    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update volunteer hours.";
    return { success: false, error: message };
  }
}

export async function voidVolunteerHoursAction(
  id: string,
  reason?: string
): Promise<ActionResult<VolunteerHourRow>> {
  try {
    if (!id) {
      return { success: false, error: "Hour entry ID is required." };
    }

    const updated = await DataProvider.voidVolunteerHours(id, reason);

    revalidatePath("/volunteer");
    revalidatePath("/admin");

    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to void volunteer hours.";
    return { success: false, error: message };
  }
}

export async function verifyVolunteerHoursAction(
  id: string,
  approved: boolean,
  notes?: string
): Promise<ActionResult<VolunteerHourRow>> {
  try {
    if (!id) {
      return { success: false, error: "Hour entry ID is required." };
    }

    const status: VolunteerHourStatus = approved ? "VERIFIED" : "VOIDED";
    const updated = await DataProvider.updateVolunteerHourStatus(
      id,
      status,
      notes || (approved ? "Approved by District Coordinator" : "Rejected by District Coordinator")
    );

    revalidatePath("/volunteer");
    revalidatePath("/admin");

    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to verify volunteer hours.";
    return { success: false, error: message };
  }
}

export async function getApprovedHoursTotalAction(volunteerId: string): Promise<ActionResult<number>> {
  try {
    if (!volunteerId) {
      return { success: false, error: "Volunteer ID is required." };
    }

    const total = await DataProvider.getApprovedHoursTotal(volunteerId);
    return { success: true, data: total };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to calculate approved hours.";
    return { success: false, error: message };
  }
}
