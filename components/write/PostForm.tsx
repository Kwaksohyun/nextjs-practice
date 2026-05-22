"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPost, updatePost } from "@/lib/actions/posts";
import DeletePostButton from "@/components/blog/DeletePostButton";
import { toSlug } from "@/lib/slug";
import type { Category, Post } from "@/lib/types";
import formStyles from "@/styles/modules/form.module.css";
import btnStyles from "@/styles/modules/buttons.module.css";

type Props = {
  categories: Category[];
  post?: Post;
};

export default function PostForm({ categories, post }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [published, setPublished] = useState(post?.published ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const writableCategories = categories.filter((c) => c.slug !== "all");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!post) {
      setSlug(toSlug(value));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || toSlug(title),
      content,
      excerpt: excerpt.trim(),
      category_id: categoryId || null,
      published,
    };

    if (!payload.title) {
      setError("제목을 입력해주세요.");
      return;
    }

    startTransition(async () => {
      const result = post
        ? await updatePost(post.id, payload, post.slug)
        : await createPost(payload);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      if ("redirectTo" in result) {
        router.push(result.redirectTo);
        router.refresh();
        return;
      }

      router.push(`/posts/${encodeURIComponent(result.slug)}`);
      router.refresh();
    });
  }

  return (
    <>
      <h1 className={formStyles.pageTitle}>
        {post ? "글 수정" : "새 글 작성"}
      </h1>
      <p className={formStyles.pageDesc}>마크다운으로 작성할 수 있습니다.</p>

      <form className={formStyles.form} onSubmit={handleSubmit}>
        <div className={formStyles.field}>
          <label htmlFor="title">제목</label>
          <input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
        </div>

        <div className={formStyles.field}>
          <label htmlFor="slug">URL 슬러그</label>
          <input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <p className={formStyles.hint}>/posts/{slug || "..."}</p>
        </div>

        <div className={formStyles.field}>
          <label htmlFor="category">카테고리</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">선택 안 함</option>
            {writableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className={formStyles.field}>
          <label htmlFor="excerpt">요약 (목록에 표시)</label>
          <input
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className={formStyles.field}>
          <label htmlFor="content">본문 (Markdown)</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div className={formStyles.row}>
          <input
            id="published"
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <label htmlFor="published">공개</label>
        </div>

        {error && <p className={formStyles.error}>{error}</p>}

        <div className={formStyles.actions}>
          <button
            type="submit"
            className={`${btnStyles.btn} ${btnStyles.btnPrimary}`}
            disabled={pending}
          >
            {pending ? "저장 중..." : post ? "수정 저장" : "글 발행"}
          </button>
          {post && (
            <Link
              href={
                post.published
                  ? `/posts/${encodeURIComponent(post.slug)}`
                  : "/write"
              }
              className={btnStyles.btn}
            >
              취소
            </Link>
          )}
          {post && (
            <DeletePostButton
              postId={post.id}
              postTitle={post.title}
              variant="detail"
            />
          )}
        </div>
      </form>
    </>
  );
}
