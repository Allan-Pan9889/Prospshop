import type { Product } from "./types";

export type SortOption =
  | "popularity"
  | "latest"
  | "price-asc"
  | "price-desc"
  | "random";

export function sortProducts(productsList: Product[], sort: SortOption): Product[] {
  const arr = [...productsList];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "latest":
      return arr.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    case "random":
      return arr.sort(() => Math.random() - 0.5);
    default:
      return arr.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0));
  }
}

export function filterByCategory(productsList: Product[], category: string): Product[] {
  if (!category) return productsList;
  const c = category.toLowerCase().replace(/-/g, " ");
  return productsList.filter((p) =>
    p.categories.some((cat) => cat.toLowerCase().replace(/\s+/g, " ") === c)
  );
}

export function filterByQuery(productsList: Product[], query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return productsList;
  return productsList.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.categories.some((c) => c.toLowerCase().includes(q))
  );
}
