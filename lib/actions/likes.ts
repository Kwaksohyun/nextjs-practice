"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleLike(
  postId: string,
  postSlug: string,
  visitorId: string
) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("id", existing.id);

    if (error) return { error: error.message, liked: false };
  } else {
    const { error } = await supabase.from("likes").insert({
      post_id: postId,
      visitor_id: visitorId,
    });

    if (error) return { error: error.message, liked: false };
  }

  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  revalidatePath(`/posts/${postSlug}`);
  revalidatePath("/");

  return { success: true, liked: !existing, count: count ?? 0 };
}
