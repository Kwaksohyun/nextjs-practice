import { createClient } from "@/lib/supabase/server";
import type { Category, Comment, Post, PostWithMeta } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPosts(categorySlug?: string): Promise<PostWithMeta[]> {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("*, categories(name, slug)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (categorySlug && categorySlug !== "all") {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();

    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  const { data: posts, error } = await query;
  if (error) throw new Error(error.message);
  if (!posts?.length) return [];

  const postIds = posts.map((p) => p.id);

  const [{ data: likes }, { data: comments }] = await Promise.all([
    supabase.from("likes").select("post_id").in("post_id", postIds),
    supabase.from("comments").select("post_id").in("post_id", postIds),
  ]);

  const likeCounts = new Map<string, number>();
  const commentCounts = new Map<string, number>();

  likes?.forEach((l) => {
    likeCounts.set(l.post_id, (likeCounts.get(l.post_id) ?? 0) + 1);
  });
  comments?.forEach((c) => {
    commentCounts.set(c.post_id, (commentCounts.get(c.post_id) ?? 0) + 1);
  });

  return posts.map((post) => ({
    ...post,
    like_count: likeCounts.get(post.id) ?? 0,
    comment_count: commentCounts.get(post.id) ?? 0,
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(name, slug)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getMyPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(name, slug)")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPostCounts(postId: string) {
  const supabase = await createClient();

  const [{ count: likeCount }, { count: commentCount }] = await Promise.all([
    supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId),
    supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId),
  ]);

  return {
    likeCount: likeCount ?? 0,
    commentCount: commentCount ?? 0,
  };
}

export async function getComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUserLiked(
  postId: string,
  visitorId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("visitor_id", visitorId)
    .maybeSingle();

  return !!data;
}
