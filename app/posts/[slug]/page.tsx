import Link from "next/link";
import { notFound } from "next/navigation";
import MarkdownContent from "@/components/blog/MarkdownContent";
import CopyUrlButton from "@/components/blog/CopyUrlButton";
import LikeButton from "@/components/blog/LikeButton";
import CommentSection from "@/components/blog/CommentSection";
import DeletePostButton from "@/components/blog/DeletePostButton";
import {
  getPostBySlug,
  getComments,
  getPostCounts,
} from "@/lib/data/blog";
import { createClient } from "@/lib/supabase/server";
import detailStyles from "@/styles/modules/post-detail.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const isAuthor = user?.id === post.author_id;

  if (!post.published && !isAuthor) {
    notFound();
  }

  const [comments, counts] = await Promise.all([
    getComments(post.id),
    getPostCounts(post.id),
  ]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const postUrl = `${siteUrl}/posts/${post.slug}`;

  return (
    <>
      <Link href="/" className={detailStyles.back}>
        ← 목록으로
      </Link>

      {!post.published && isAuthor && (
        <p className={detailStyles.draftNotice}>
          비공개 글입니다. 본인만 볼 수 있습니다.
        </p>
      )}

      <article className={detailStyles.article}>
        <header className={detailStyles.header}>
          <h1 className={detailStyles.postTitle}>{post.title}</h1>
          <div className={detailStyles.info}>
            <time dateTime={post.created_at}>
              {formatDate(post.created_at)}
            </time>
            {post.categories?.name && (
              <span>{post.categories.name}</span>
            )}
            <span>♥ {counts.likeCount}</span>
            <span>💬 {counts.commentCount}</span>
          </div>
          <div className={detailStyles.actions}>
            {isAuthor && (
              <>
                <Link
                  href={`/write/edit/${post.id}`}
                  className={detailStyles.editLink}
                >
                  수정
                </Link>
                <DeletePostButton
                  postId={post.id}
                  postTitle={post.title}
                  variant="detail"
                />
              </>
            )}
            {post.published && (
              <>
                <LikeButton
                  postId={post.id}
                  postSlug={post.slug}
                  initialCount={counts.likeCount}
                  initialLiked={false}
                />
                <CopyUrlButton url={postUrl} />
              </>
            )}
          </div>
        </header>

        <MarkdownContent content={post.content} />
      </article>

      {post.published && (
        <CommentSection
          postId={post.id}
          postSlug={post.slug}
          initialComments={comments}
        />
      )}
    </>
  );
}
