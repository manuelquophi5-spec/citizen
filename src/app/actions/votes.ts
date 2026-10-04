"use server";

import { revalidatePath } from "next/cache";
import { DataProvider } from "@/lib/data-provider";
import type { ActionResult, PriorityVoteInsert, PriorityVoteRow } from "@/types/database";

export async function castPriorityVoteAction(
  input: PriorityVoteInsert
): Promise<ActionResult<PriorityVoteRow>> {
  try {
    if (!input.user_id) {
      return { success: false, error: "Authentication required to cast priority votes." };
    }
    if (!input.project_name || input.project_name.trim().length === 0) {
      return { success: false, error: "Project name is required." };
    }

    const vote = await DataProvider.castPriorityVote({
      user_id: input.user_id,
      project_name: input.project_name.trim(),
      category: input.category || "General",
      vote_date: input.vote_date || new Date().toISOString(),
    });

    revalidatePath("/user");
    revalidatePath("/admin");

    return { success: true, data: vote };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to cast priority vote.";
    return { success: false, error: message };
  }
}

export async function getPriorityVotesAction(userId?: string): Promise<ActionResult<PriorityVoteRow[]>> {
  try {
    const votes = await DataProvider.getPriorityVotes(userId);
    return { success: true, data: votes };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch priority votes.";
    return { success: false, error: message };
  }
}

export async function getPriorityVoteCountsAction(): Promise<ActionResult<Record<string, number>>> {
  try {
    const counts = await DataProvider.getPriorityVoteCounts();
    return { success: true, data: counts };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch vote tallies.";
    return { success: false, error: message };
  }
}

export async function deletePriorityVoteAction(id: string): Promise<ActionResult<boolean>> {
  try {
    if (!id) {
      return { success: false, error: "Vote ID is required." };
    }

    const success = await DataProvider.deletePriorityVote(id);

    revalidatePath("/user");
    revalidatePath("/admin");

    return { success: true, data: success };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove priority vote.";
    return { success: false, error: message };
  }
}
