"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/types";
import { useCart } from "@/contexts/CartContext";
import { useModal } from "@/contexts/ModalContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { openQuickView } = useModal();

  const handleAddToCart = () => {
    addItem(product);
  };

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <Link href={`/product/${product.slug}`} className="product-image-link">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              width={638}
              height={800}
              className="product-image"
              unoptimized
            />
          ) : (
            <div className="product-image-placeholder">No image</div>
          )}
        </Link>
        {product.hot && <span className="product-label label-hot">Hot</span>}
        <div className="product-actions">
          <button
            className="quick-view-btn"
            aria-label="Quick view"
            onClick={() => openQuickView(product)}
          >
            Quick view
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-title">
          <Link href={`/product/${product.slug}`}>{product.title}</Link>
        </h3>
        {product.categories.length > 0 && (
          <div className="product-categories">
            {product.categories.map((cat, i) => (
              <span key={cat}>
                <Link
                  href={`/shop?category=${cat.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {cat}
                </Link>
                {i < product.categories.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}
        <span className="product-price">
          {formatPrice(product.price)} Incl GST.
        </span>
        <div className="product-add-btn">
          {product.variable ? (
            <Link href={`/product/${product.slug}`} className="btn btn-default">
              Select options
            </Link>
          ) : (
            <button className="btn btn-default add-to-cart-btn" onClick={handleAddToCart}>
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
