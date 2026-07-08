import Link from "next/link";
import { getAllProductsAdmin } from "@/lib/products-db";
import { formatPrice } from "@/lib/types";

const PAGE_SIZE = 50;

function StatusBadge({ status }: { status: string }) {
  return <span className={`admin-badge admin-badge-${status}`}>{status}</span>;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const products = await getAllProductsAdmin();
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div>
      <div className="admin-page-header">
        <h2>Products ({products.length})</h2>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          + Add Product
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Status</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.title} />
                </td>
                <td>
                  <div>{p.title}</div>
                  <small style={{ color: "#94a3b8" }}>{p.slug}</small>
                </td>
                <td>₹{formatPrice(Number(p.price))}</td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
                <td>{p.inStock ? "In stock" : "Out of stock"}</td>
                <td>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          {currentPage > 1 && (
            <Link
              href={`/admin/products?page=${currentPage - 1}`}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              ← Previous
            </Link>
          )}
          <span>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/admin/products?page=${currentPage + 1}`}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
