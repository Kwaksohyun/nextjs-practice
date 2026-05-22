import PostForm from "@/components/write/PostForm";
import MyPostsList from "@/components/write/MyPostsList";
import { getCategories, getMyPosts } from "@/lib/data/blog";

export default async function WritePage() {
  const [categories, myPosts] = await Promise.all([
    getCategories(),
    getMyPosts(),
  ]);

  return (
    <>
      <MyPostsList posts={myPosts} />
      <PostForm categories={categories} />
    </>
  );
}
