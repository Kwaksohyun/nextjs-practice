export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category_id: string | null;
  published: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  categories?: Pick<Category, "name" | "slug"> | null;
};

export type Comment = {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
};

export type PostWithMeta = Post & {
  like_count: number;
  comment_count: number;
};
