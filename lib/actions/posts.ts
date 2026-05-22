"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/slug";

export type PostFormData = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: string | null;
  published: boolean;
};

type ActionResult =
  | { success: true; slug: string }
  | { success: true; redirectTo: "/" }
  | { error: string };

function resolveSlug(title: string, slug: string) {
  return slug.trim() || toSlug(title);
}

export async function createPost(data: PostFormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const finalSlug = resolveSlug(data.title, data.slug);

  const { error } = await supabase.from("posts").insert({
    title: data.title,
    slug: finalSlug,
    content: data.content,
    excerpt: data.excerpt || null,
    category_id: data.category_id || null,
    published: data.published,
    author_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/write");
  return { success: true, slug: finalSlug };
}

export async function updatePost(
  id: string,
  data: PostFormData,
  previousSlug?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { data: existing } = await supabase
    .from("posts")
    .select("author_id, slug")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { error: "글을 찾을 수 없습니다." };
  if (existing.author_id !== user.id) {
    return { error: "수정 권한이 없습니다." };
  }

  const finalSlug = resolveSlug(data.title, data.slug);

  const { error } = await supabase
    .from("posts")
    .update({
      title: data.title,
      slug: finalSlug,
      content: data.content,
      excerpt: data.excerpt || null,
      category_id: data.category_id || null,
      published: data.published,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const oldSlug = previousSlug ?? existing.slug;
  revalidatePath("/");
  revalidatePath("/write");
  revalidatePath(`/write/edit/${id}`);
  revalidatePath(`/posts/${oldSlug}`);
  if (oldSlug !== finalSlug) {
    revalidatePath(`/posts/${finalSlug}`);
  }

  return { success: true, slug: finalSlug };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { data: existing } = await supabase
    .from("posts")
    .select("author_id, slug")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { error: "글을 찾을 수 없습니다." };
  if (existing.author_id !== user.id) {
    return { error: "삭제 권한이 없습니다." };
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/write");
  revalidatePath(`/posts/${existing.slug}`);
  return { success: true, redirectTo: "/" };
}
