import {
  adminProductsHref,
  paginationItems,
  type AdminProductFilters,
} from "@/lib/admin-product-filters";

interface ProductPaginationProps {
  filters: AdminProductFilters;
  totalPages: number;
  position?: "top" | "bottom";
}

export default function ProductPagination({ filters, totalPages, position = "bottom" }: ProductPaginationProps) {
  const { page, pageSize, q, category } = filters;
  const inputId = `admin-page-number-${position}`;

  function navigation(label: string, target: number, disabled: boolean, edge = false) {
    const className = `admin-page-link${edge ? " admin-page-link-edge" : ""}`;
    return disabled ? (
      <span className={`${className} is-disabled`} aria-disabled="true">{label}</span>
    ) : (
      <a href={adminProductsHref(filters, target)} className={className}
        aria-label={`${label} page`}>
        {label}
      </a>
    );
  }

  return (
    <div className="admin-product-pagination">
      <nav className="admin-page-links" aria-label={`Product pagination, ${position}`}>
        {navigation("First", 1, page === 1, true)}
        {navigation("Previous", page - 1, page === 1)}
        {paginationItems(page, totalPages).map((item, index) => item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="admin-page-ellipsis" aria-hidden="true">…</span>
        ) : item === page ? (
          <span key={item} className="admin-page-link is-current" aria-current="page"
            aria-label={`Page ${item}`}>{item}</span>
        ) : (
          <a key={item} href={adminProductsHref(filters, item)} className="admin-page-link"
            aria-label={`Page ${item}`}>{item}</a>
        ))}
        {navigation("Next", page + 1, page === totalPages)}
        {navigation("Last", totalPages, page === totalPages, true)}
      </nav>
      <form key={adminProductsHref(filters, page)} action="/admin/products" method="get" className="admin-page-jump">
        {q && <input type="hidden" name="q" value={q} />}
        {category && <input type="hidden" name="category" value={category} />}
        <input type="hidden" name="pageSize" value={pageSize} />
        <label htmlFor={inputId}>Page</label>
        <input id={inputId} type="number" name="page" min={1} max={totalPages}
          defaultValue={page} required />
        <span>of {totalPages}</span>
        <button type="submit" className="admin-btn admin-btn-secondary">Go</button>
      </form>
    </div>
  );
}
