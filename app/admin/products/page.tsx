import Link from "next/link";
import { getProductsAdminPage } from "@/lib/products-db";
import { formatPrice } from "@/lib/types";
import {
  ADMIN_PRODUCT_PAGE_SIZES,
  adminProductsHref,
  parseAdminProductFilters,
} from "@/lib/admin-product-filters";
import ProductPagination from "@/components/admin/ProductPagination";

function StatusBadge({ status }: { status: string }) {
  return <span className={`admin-badge admin-badge-${status}`}>{status}</span>;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseAdminProductFilters(await searchParams);
  const { products, total, totalPages, page, categories } = await getProductsAdminPage(filters);
  const currentFilters = { ...filters, page };
  const resetHref = adminProductsHref({ ...currentFilters, q: "", category: "" });
  const start = total ? (page - 1) * filters.pageSize + 1 : 0;
  const end = Math.min(page * filters.pageSize, total);
  const hasFilters = Boolean(filters.q || filters.category);

  return (
    <div className="admin-product-list">
      <div className="admin-page-header">
        <h2>Products ({total})</h2>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          + Add Product
        </Link>
      </div>

      <form key={adminProductsHref(currentFilters, page)} action="/admin/products" method="get"
        className="admin-product-filters" aria-label="Filter products">
        <div className="admin-filter-field admin-filter-keyword">
          <label htmlFor="product-keyword">Keyword</label>
          <input id="product-keyword" name="q" type="search" maxLength={200}
            placeholder="Search title, slug or description" defaultValue={filters.q} />
        </div>
        <div className="admin-filter-field">
          <label htmlFor="product-category">Category</label>
          <select id="product-category" name="category" defaultValue={filters.category}>
            <option value="">All categories</option>
            {filters.category && !categories.includes(filters.category) && (
              <option value={filters.category}>{filters.category} (unavailable)</option>
            )}
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div className="admin-filter-field">
          <label htmlFor="product-page-size">Per page</label>
          <select id="product-page-size" name="pageSize" defaultValue={filters.pageSize}>
            {ADMIN_PRODUCT_PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
        <div className="admin-filter-actions">
          <button type="submit" className="admin-btn admin-btn-primary">Search</button>
          {hasFilters && <a href={resetHref} className="admin-btn admin-btn-secondary" >Clear filters</a>}
        </div>
      </form>

      <p className="admin-product-summary" role="status">
        {total ? `Showing ${start}–${end} of ${total} ${hasFilters ? "matching " : ""}products` : "0 products found"}
        {total > 0 && <span>Page {page} of {totalPages}</span>}
      </p>

      {total > 0 && <ProductPagination filters={currentFilters} totalPages={totalPages} position="top" />}
      <div className="admin-table-wrap">
        {products.length === 0 ? (
          <div className="admin-products-empty">
            <h3>No matching products</h3>
            <p>Try another keyword or category, or clear the filters to see all products.</p>
            {hasFilters && <a href={resetHref} className="admin-btn admin-btn-secondary" >Clear filters</a>}
          </div>
        ) : (
          <table className="admin-table admin-products-table">
            <thead>
              <tr>
                <th>Image</th><th>Title / Categories</th><th>Price</th>
                <th>Status</th><th>Stock</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.title} />
                  </td>
                  <td className="admin-product-title-cell">
                    <div>{p.title}</div>
                    <small className="admin-product-category-text">{p.categories?.join(", ")}</small>
                    <small className="admin-product-slug">{p.slug}</small>
                  </td>
                  <td className="admin-product-price">₹{formatPrice(Number(p.price))}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>{p.inStock ? "In stock" : "Out of stock"}</td>
                  <td>
                    <Link href={`/admin/products/${p.id}`} className="admin-btn admin-btn-secondary admin-btn-sm" prefetch={false}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {total > 0 && <ProductPagination filters={currentFilters} totalPages={totalPages} />}
    </div>
  );
}
