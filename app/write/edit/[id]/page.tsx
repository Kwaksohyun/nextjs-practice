import { notFound, redirect } from "next/navigation";
import PostForm from "@/components/write/PostForm";
import { getPostById, getCategories } from "@/lib/data/blog";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/write/edit/${id}`);
  }

  const [post, categories] = await Promise.all([
    getPostById(id),
    getCategories(),
  ]);

  if (!post) {
    notFound();
  }

  if (post.author_id !== user.id) {
    notFound();
  }

  return <PostForm categories={categories} post={post} />;
}
