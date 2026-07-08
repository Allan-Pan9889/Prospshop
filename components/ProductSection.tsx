"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

interface ProductSectionProps {
  title: string;
  products: Product[];
  initialCount?: number;
  loadMoreStep?: number;
  showLoadMore?: boolean;
}

export default function ProductSection({
  title,
  products,
  initialCount,
  loadMoreStep = 8,
  showLoadMore = false,
}: ProductSectionProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount ?? products.length);
  const [loading, setLoading] = useState(false);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + loadMoreStep, products.length));
      setLoading(false);
    }, 600);
  };

  return (
    <section className="product-section">
      <div className="container">
        <div className="section-spacer" />
        <h4 className="section-title">{title}</h4>
        <div className="section-spacer-sm" />
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        {showLoadMore && hasMore && (
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
    </section>
  );
}
