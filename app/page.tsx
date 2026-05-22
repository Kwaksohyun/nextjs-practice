import { Suspense } from "react";
import PostCard from "@/components/blog/PostCard";
import CategoryFilter from "@/components/blog/CategoryFilter";
import { getCategories, getPosts } from "@/lib/data/blog";
import homeStyles from "@/styles/modules/blog-home.module.css";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { category } = await searchParams;
  const [categories, posts] = await Promise.all([
    getCategories(),
    getPosts(category),
  ]);

  return (
    <>
      <section className={homeStyles.hero}>
        <h1 className={homeStyles.title}>개발 블로그</h1>
        <p className={homeStyles.subtitle}>
          Next.js와 Supabase로 만든 개인 개발 기록
        </p>
      </section>

      <Suspense fallback={<div className={homeStyles.categoryRow}>로딩...</div>}>
        <CategoryFilter categories={categories} />
      </Suspense>

      {posts.length === 0 ? (
        <div className={homeStyles.empty}>
          아직 글이 없습니다. 로그인 후 첫 글을 작성해보세요.
        </div>
      ) : (
        <div className={homeStyles.list}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
