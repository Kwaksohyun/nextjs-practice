"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toggleLike } from "@/lib/actions/likes";
import { getVisitorId } from "@/lib/visitor";

type UseLikeOptions = {
  postId: string;
  postSlug: string;
  initialCount: number;
  initialLiked: boolean;
};

export function useLike({
  postId,
  postSlug,
  initialCount,
  initialLiked,
}: UseLikeOptions) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [visitorId, setVisitorId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setVisitorId(getVisitorId());
  }, []);

  const toggle = useCallback(() => {
    if (!visitorId) return;

    setError(null);
    startTransition(async () => {
      const result = await toggleLike(postId, postSlug, visitorId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setLiked(result.liked ?? false);
      if (typeof result.count === "number") {
        setCount(result.count);
      } else {
        setCount((c) => (result.liked ? c + 1 : Math.max(0, c - 1)));
      }
    });
  }, [visitorId, postId, postSlug]);

  return {
    liked,
    count,
    error,
    pending,
    isReady: !!visitorId,
    toggle,
  };
}
