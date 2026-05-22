"use client";

import { useLike } from "@/hooks/useLike";
import btnStyles from "@/styles/modules/buttons.module.css";

type Props = {
  postId: string;
  postSlug: string;
  initialCount: number;
  initialLiked: boolean;
};

export default function LikeButton({
  postId,
  postSlug,
  initialCount,
  initialLiked,
}: Props) {
  const { liked, count, error, pending, isReady, toggle } = useLike({
    postId,
    postSlug,
    initialCount,
    initialLiked,
  });

  return (
    <span>
      <button
        type="button"
        className={`${btnStyles.btn} ${liked ? btnStyles.btnLiked : ""}`}
        onClick={toggle}
        disabled={pending || !isReady}
        aria-pressed={liked}
      >
        {pending ? "처리 중..." : liked ? "♥ 좋아요 취소" : "♡ 좋아요"} ({count})
      </button>
      {error && (
        <span className={btnStyles.errorHint} role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
