"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addComment(
  postId: string,
  postSlug: string,
  authorName: string,
  content: string
) {
  const supabase = await createClient();

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_name: authorName.trim() || "익명",
    content: content.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath(`/posts/${postSlug}`);
  return { success: true };
}
