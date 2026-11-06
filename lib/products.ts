import homepageData from "@/data/products.json";
import { getAllProducts } from "./products-db";
import type { Product, ProductData } from "./types";

export {
  getAllProducts,
  getProductBySlug,
  getAllSlugs,
  searchProducts,
  getRelatedProducts,
} from "./products-db";

export { sortProducts, filterByCategory, type SortOption } from "./product-utils";

function liveSelection(curated: Product[], catalog: Product[]): Product[] {
  const bySlug = new Map(catalog.map((product) => [product.slug, product]));
  const selected = new Map<string, Product>();
  for (const item of curated) {
    const live = bySlug.get(item.slug);
    if (live) selected.set(live.slug, live);
  }
  for (const product of catalog) {
    if (selected.size >= curated.length) break;
    if (!selected.has(product.slug)) selected.set(product.slug, product);
  }
  return [...selected.values()];
}

export async function getHomepageData(): Promise<ProductData> {
  const catalog = await getAllProducts();
  const data = homepageData as ProductData;
  return {
    recommendations: liveSelection(data.recommendations, catalog),
    bestCollection: liveSelection(data.bestCollection, catalog),
  };
}
