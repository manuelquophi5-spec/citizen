"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithRole } from "@/lib/rbac";
import {
  getMediaRegistry,
  saveMediaItem,
  deleteMediaItem,
  type MediaItem,
} from "@/lib/media-registry";
import type { ActionResult } from "@/types/database";

export async function getMediaItemsAction(): Promise<ActionResult<MediaItem[]>> {
  try {
    const items = getMediaRegistry();
    return { success: true, data: items };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch media assets.";
    return { success: false, error: message };
  }
}

export async function deleteMediaItemAction(id: string): Promise<ActionResult<MediaItem[]>> {
  try {
    if (!id) {
      return { success: false, error: "Media item ID is required." };
    }

    const user = await getCurrentUserWithRole();
    if (!user || user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized: Official Administrator privileges required to delete media assets.",
      };
    }

    const updated = deleteMediaItem(id);

    revalidatePath("/gallery");
    revalidatePath("/initiatives");
    revalidatePath("/blog");
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete media asset.";
    return { success: false, error: message };
  }
}

export async function saveMediaRegistryItemAction(
  item: MediaItem
): Promise<ActionResult<MediaItem[]>> {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized: Administrator privileges required to record media assets.",
      };
    }

    const updated = saveMediaItem(item);

    revalidatePath("/gallery");
    revalidatePath("/initiatives");
    revalidatePath("/blog");
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save media asset.";
    return { success: false, error: message };
  }
}
