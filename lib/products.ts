import homepageData from "@/data/products.json";
import type { Product, ProductData } from "./types";

export {
  getAllProducts,
  getProductBySlug,
  getAllSlugs,
  searchProducts,
  getRelatedProducts,
} from "./products-db";

export { sortProducts, filterByCategory, type SortOption } from "./product-utils";

export function getHomepageData(): ProductData {
  return homepageData as ProductData;
}
