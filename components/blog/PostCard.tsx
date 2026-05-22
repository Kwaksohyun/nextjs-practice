import Link from "next/link";
import type { PostWithMeta } from "@/lib/types";
import cardStyles from "@/styles/modules/post-card.module.css";

type Props = {
  post: PostWithMeta;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostCard({ post }: Props) {
  const categoryName = post.categories?.name;

  return (
    <Link
      href={`/posts/${encodeURIComponent(post.slug)}`}
      className={cardStyles.card}
    >
      <div className={cardStyles.meta}>
        <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
        {categoryName && <span className={cardStyles.badge}>{categoryName}</span>}
      </div>
      <h2 className={cardStyles.cardTitle}>{post.title}</h2>
      {post.excerpt && <p className={cardStyles.excerpt}>{post.excerpt}</p>}
      <div className={cardStyles.stats}>
        <span>♥ {post.like_count}</span>
        <span>💬 {post.comment_count}</span>
      </div>
    </Link>
  );
}
