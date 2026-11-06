export const ADMIN_PRODUCT_PAGE_SIZES = [25, 50, 100] as const;
export const DEFAULT_ADMIN_PRODUCT_PAGE_SIZE = 50;

type SearchParams = Record<string, string | string[] | undefined>;

export interface AdminProductFilters {
  q: string;
  category: string;
  page: number;
  pageSize: number;
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function positiveInteger(value: string): number {
  const number = Number(value);
  return /^\d+$/.test(value) && Number.isSafeInteger(number) && number > 0
    ? number
    : 1;
}

export function parseAdminProductFilters(params: SearchParams): AdminProductFilters {
  const size = Number(first(params.pageSize));
  return {
    q: first(params.q).trim().slice(0, 200).trim(),
    category: first(params.category).trim().slice(0, 100).trim(),
    page: positiveInteger(first(params.page)),
    pageSize: ADMIN_PRODUCT_PAGE_SIZES.some((allowed) => allowed === size)
      ? size
      : DEFAULT_ADMIN_PRODUCT_PAGE_SIZE,
  };
}

export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function adminProductsHref(filters: AdminProductFilters, page = 1): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.pageSize !== DEFAULT_ADMIN_PRODUCT_PAGE_SIZE) {
    params.set("pageSize", String(filters.pageSize));
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/admin/products${query ? `?${query}` : ""}`;
}

export function paginationItems(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  if (page >= totalPages - 3) {
    return [1, "ellipsis", ...Array.from({ length: 5 }, (_, index) => totalPages - 4 + index)];
  }
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}
