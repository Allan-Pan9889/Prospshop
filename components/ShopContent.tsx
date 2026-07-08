"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";
import {
  sortProducts,
  filterByCategory,
  filterByQuery,
  type SortOption,
} from "@/lib/product-utils";

interface ShopContentProps {
  products: Product[];
  totalCount: number;
}

const PER_PAGE_OPTIONS = [9, 12, 18, 24];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Sort by popularity" },
  { value: "latest", label: "Sort by latest" },
  { value: "price-asc", label: "Sort by price: low to high" },
  { value: "price-desc", label: "Sort by price: high to low" },
  { value: "random", label: "Random" },
];

const CATEGORIES = [
  "Saree",
  "Kurta Set",
  "New Arrival",
  "New Collection",
  "Short Kurtis",
  "Blouse",
  "Palazzo",
  "Scarf",
  "Socks",
];

export default function ShopContent({ products, totalCount }: ShopContentProps) {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [perPage, setPerPage] = useState(24);
  const [sort, setSort] = useState<SortOption>("popularity");
  const [visibleCount, setVisibleCount] = useState(24);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [activeCategory, setActiveCategory] = useState(categoryParam);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  const filtered = useMemo(() => {
    let result = products;
    if (queryParam) {
      result = filterByQuery(result, queryParam);
    }
    if (activeCategory) {
      result = filterByCategory(result, activeCategory);
    }
    return sortProducts(result, sort);
  }, [products, queryParam, activeCategory, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + perPage, filtered.length));
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    setVisibleCount(perPage);
  }, [perPage, queryParam, activeCategory, sort]);

  return (
    <div className="shop-page">
      <div className="container">
        <div className="shop-toolbar">
          <p className="shop-result-count">
            Showing 1–{Math.min(visibleCount, filtered.length)} of{" "}
            {queryParam ? filtered.length : totalCount} results
            {queryParam && ` for "${queryParam}"`}
          </p>
          <div className="shop-controls">
            <button
              className="shop-sidebar-toggle mobile-only"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "Hide" : "Show"} sidebar
            </button>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="shop-select"
              aria-label="Products per page"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  Show {n}
                </option>
              ))}
            </select>
            <div className="grid-view-btns desktop-only">
              {[2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  className={gridCols === cols ? "active" : ""}
                  onClick={() => setGridCols(cols)}
                  aria-label={`Grid view ${cols}`}
                >
                  {cols}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="shop-select"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="shop-layout">
          <aside className={`shop-sidebar ${sidebarOpen ? "open" : ""}`}>
            <h4>Filters</h4>
            <div className="filter-group">
              <h5>Categories</h5>
              <ul>
                <li>
                  <button
                    className={!activeCategory ? "active" : ""}
                    onClick={() => setActiveCategory("")}
                  >
                    All
                  </button>
                </li>
                {CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      className={
                        activeCategory === cat.toLowerCase().replace(/\s+/g, "-")
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveCategory(cat.toLowerCase().replace(/\s+/g, "-"))
                      }
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="shop-products">
            {visible.length === 0 ? (
              <p className="no-products">No products found.</p>
            ) : (
              <div
                className="product-grid"
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                }}
              >
                {visible.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            )}
            {hasMore && (
              <div className="load-more-wrap">
                <button
                  className={`load-more-btn ${loading ? "loading" : ""}`}
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load more products"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
