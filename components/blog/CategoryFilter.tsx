"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";
import homeStyles from "@/styles/modules/blog-home.module.css";

type Props = {
  categories: Category[];
};

export default function CategoryFilter({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";

  function select(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <div className={homeStyles.categoryRow}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className={`${homeStyles.categoryChip} ${
            active === cat.slug ? homeStyles.categoryChipActive : ""
          }`}
          onClick={() => select(cat.slug)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
