"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "@/lib/actions/comments";
import type { Comment } from "@/lib/types";
import commentStyles from "@/styles/modules/comments.module.css";
import btnStyles from "@/styles/modules/buttons.module.css";

type Props = {
  postId: string;
  postSlug: string;
  initialComments: Comment[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentSection({
  postId,
  postSlug,
  initialComments,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const authorName = (fd.get("authorName") as string) ?? "";
    const content = (fd.get("content") as string) ?? "";

    if (!content.trim()) return;

    startTransition(async () => {
      const result = await addComment(postId, postSlug, authorName, content);
      if (result.error) {
        alert(result.error);
        return;
      }
      form.reset();
      router.refresh();
    });
  }

  return (
    <section className={commentStyles.section}>
      <h2 className={commentStyles.sectionTitle}>
        댓글 ({initialComments.length})
      </h2>

      <form className={commentStyles.form} onSubmit={handleSubmit}>
        <input
          className={commentStyles.input}
          name="authorName"
          placeholder="이름 (선택, 미입력 시 익명)"
          maxLength={40}
        />
        <textarea
          className={commentStyles.textarea}
          name="content"
          placeholder="댓글을 입력하세요"
          required
          maxLength={2000}
        />
        <button
          type="submit"
          className={`${btnStyles.btn} ${btnStyles.btnPrimary}`}
          disabled={pending}
        >
          {pending ? "등록 중..." : "댓글 등록"}
        </button>
      </form>

      {initialComments.length === 0 ? (
        <p className={commentStyles.empty}>첫 댓글을 남겨보세요.</p>
      ) : (
        <ul className={commentStyles.list}>
          {initialComments.map((c) => (
            <li key={c.id} className={commentStyles.item}>
              <div className={commentStyles.author}>
                {c.author_name}
                <span className={commentStyles.date}>
                  {formatDate(c.created_at)}
                </span>
              </div>
              <p className={commentStyles.body}>{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
