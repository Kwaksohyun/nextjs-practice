"use client";

import Link from "next/link";
import DeletePostButton from "@/components/blog/DeletePostButton";
import type { Post } from "@/lib/types";
import formStyles from "@/styles/modules/form.module.css";

type Props = {
  posts: Post[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MyPostsList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <p className={formStyles.myPostsEmpty}>
        아직 작성한 글이 없습니다. 아래 폼에서 첫 글을 작성해보세요.
      </p>
    );
  }

  return (
    <section className={formStyles.myPosts}>
      <h2 className={formStyles.myPostsTitle}>내가 쓴 글</h2>
      <ul className={formStyles.myPostsList}>
        {posts.map((post) => (
          <li key={post.id} className={formStyles.myPostsItem}>
            <div className={formStyles.myPostsInfo}>
              <span className={formStyles.myPostsName}>{post.title}</span>
              <span className={formStyles.myPostsMeta}>
                {formatDate(post.updated_at)}
                {!post.published && (
                  <span className={formStyles.draftBadge}>비공개</span>
                )}
              </span>
            </div>
            <div className={formStyles.myPostsActions}>
              {post.published && (
                <Link
                  href={`/posts/${encodeURIComponent(post.slug)}`}
                  className={formStyles.myPostsLink}
                >
                  보기
                </Link>
              )}
              <Link
                href={`/write/edit/${post.id}`}
                className={formStyles.myPostsLinkPrimary}
              >
                수정
              </Link>
              <DeletePostButton
                postId={post.id}
                postTitle={post.title}
                variant="list"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
