"use server";

import { revalidatePath } from "next/cache";
import { DataProvider } from "@/lib/data-provider";
import { getCurrentUserWithRole } from "@/lib/rbac";
import type {
  ActionResult,
  ReportInsert,
  ReportRow,
  ReportStatus,
  ReportUpdate,
} from "@/types/database";

export async function createReportAction(
  input: Omit<ReportInsert, "id" | "created_at" | "updated_at">
): Promise<ActionResult<ReportRow>> {
  try {
    if (!input.title || input.title.trim().length === 0) {
      return { success: false, error: "Report title is required." };
    }
    if (!input.description || input.description.trim().length === 0) {
      return { success: false, error: "Report description is required." };
    }
    if (!input.category || input.category.trim().length === 0) {
      return { success: false, error: "Report category is required." };
    }

    const report = await DataProvider.createReport({
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category.trim(),
      user_id: input.user_id || null,
      location: input.location || { community: "Sogakope", town: "South Tongu" },
      priority: input.priority || "MEDIUM",
      status: input.status || "SUBMITTED",
      image_url: input.image_url || null,
      reporter_name: input.reporter_name || null,
      reporter_phone: input.reporter_phone || null,
      reporter_email: input.reporter_email || null,
    });

    revalidatePath("/admin");
    revalidatePath("/user");
    revalidatePath("/community-map");
    revalidatePath("/impact");
    revalidatePath("/");

    return { success: true, data: report };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit civic report.";
    return { success: false, error: message };
  }
}

export async function getReportsAction(filter?: {
  userId?: string;
  status?: ReportStatus;
  category?: string;
}): Promise<ActionResult<ReportRow[]>> {
  try {
    const reports = await DataProvider.getReports(filter);
    return { success: true, data: reports };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch civic reports.";
    return { success: false, error: message };
  }
}

export async function updateReportStatusAction(
  id: string,
  status: ReportStatus,
  adminNotes?: string,
  officialFeedback?: string
): Promise<ActionResult<ReportRow>> {
  try {
    if (!id) {
      return { success: false, error: "Report ID is required." };
    }

    const user = await getCurrentUserWithRole();
    if (!user || user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized: Official Administrator privileges required to update civic report status.",
      };
    }

    const updates: ReportUpdate = { status };
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;
    if (officialFeedback !== undefined) updates.official_feedback = officialFeedback;

    const updated = await DataProvider.updateReport(id, updates);

    revalidatePath("/admin");
    revalidatePath("/user");
    revalidatePath("/community-map");
    revalidatePath("/impact");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update report status.";
    return { success: false, error: message };
  }
}

export async function deleteReportAction(id: string): Promise<ActionResult<boolean>> {
  try {
    if (!id) {
      return { success: false, error: "Report ID is required." };
    }

    const user = await getCurrentUserWithRole();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized: Authentication required to delete civic reports.",
      };
    }

    if (user.role !== "admin") {
      const reports = await DataProvider.getReports();
      const report = reports.find((r) => r.id === id);
      if (!report) {
        return { success: false, error: "Report not found." };
      }
      if (report.user_id !== user.userId) {
        return { success: false, error: "Forbidden: Cannot delete other citizens' reports." };
      }
      if (report.status !== "SUBMITTED") {
        return { success: false, error: "Cannot delete report once under official review." };
      }
    }

    const deleted = await DataProvider.deleteReport(id);

    revalidatePath("/admin");
    revalidatePath("/user");
    revalidatePath("/community-map");
    revalidatePath("/impact");
    revalidatePath("/");

    return { success: true, data: deleted };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete report.";
    return { success: false, error: message };
  }
}
