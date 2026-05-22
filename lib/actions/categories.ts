"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/slug";

export async function createCategory(name: string) {
  const supabase = await createClient();
  const slug = toSlug(name);

  const { data: maxOrder } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (maxOrder?.sort_order ?? -1) + 1;

  const { error } = await supabase
    .from("categories")
    .insert({ name, slug, sort_order });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function reorderCategories(
  orderedIds: string[]
) {
  const supabase = await createClient();

  const updates = orderedIds.map((id, index) =>
    supabase.from("categories").update({ sort_order: index }).eq("id", id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);

  if (failed?.error) return { error: failed.error.message };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true };
}
