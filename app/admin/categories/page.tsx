import CategoryManager from "@/components/admin/CategoryManager";
import { getCategories } from "@/lib/data/blog";

export default async function CategoriesAdminPage() {
  const categories = await getCategories();

  return <CategoryManager initialCategories={categories} />;
}
