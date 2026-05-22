export function toSlug(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `post-${Date.now()}`;
}
