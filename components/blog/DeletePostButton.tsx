"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePost } from "@/lib/actions/posts";
import btnStyles from "@/styles/modules/buttons.module.css";
import detailStyles from "@/styles/modules/post-detail.module.css";
import formStyles from "@/styles/modules/form.module.css";

type Props = {
  postId: string;
  postTitle: string;
  variant?: "detail" | "list";
};

export default function DeletePostButton({
  postId,
  postTitle,
  variant = "detail",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`"${postTitle}" 글을 삭제할까요?\n삭제하면 복구할 수 없습니다.`)) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deletePost(postId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  const className =
    variant === "list"
      ? formStyles.myPostsLinkDanger
      : `${btnStyles.btn} ${btnStyles.btnDanger}`;

  return (
    <span className={variant === "detail" ? detailStyles.deleteWrap : undefined}>
      <button
        type="button"
        className={className}
        onClick={handleDelete}
        disabled={pending}
      >
        {pending ? "삭제 중..." : "삭제"}
      </button>
      {error && (
        <span className={formStyles.deleteError} role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
