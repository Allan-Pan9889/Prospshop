import { revalidatePath } from "next/cache";

export function revalidateProductPages(): void {
  revalidatePath("/");
  revalidatePath("/shop");
  // A slug change affects both the old URL and the new URL, plus related items.
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/[id]", "page");
}
