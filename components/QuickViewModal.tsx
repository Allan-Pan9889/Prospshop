"use client";

import Image from "next/image";
import Link from "next/link";
import { useModal } from "@/contexts/ModalContext";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/types";
import { getValidProductImages } from "@/lib/product-images";

export default function QuickViewModal() {
  const { quickViewProduct, closeQuickView } = useModal();
  const { addItem } = useCart();

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const images = getValidProductImages(product);

  const handleAdd = () => {
    addItem(product);
    closeQuickView();
  };

  return (
    <div className="modal-overlay" onClick={closeQuickView}>
      <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeQuickView} aria-label="Close">
          ✕
        </button>
        <div className="quick-view-grid">
          <div className="quick-view-image">
            {images[0] ? (
              <Image
                src={images[0]}
                alt={product.title}
                width={460}
                height={575}
                unoptimized
              />
            ) : (
              <div className="product-image-placeholder">No image</div>
            )}
          </div>
          <div className="quick-view-info">
            {product.hot && <span className="product-label label-hot">Hot</span>}
            <h2 className="quick-view-title">{product.title}</h2>
            {product.categories.length > 0 && (
              <div className="product-categories">
                {product.categories.join(", ")}
              </div>
            )}
            <p className="quick-view-price">
              {formatPrice(product.price)} Incl GST.
            </p>
            {product.productDetails && product.productDetails.items.length > 0 ? (
              <div className="woocommerce-product-details__short-description">
                <h2 className="prod-heading">
                  <strong>{product.productDetails.heading}</strong>
                </h2>
                <ul className="prod-list">
                  {product.productDetails.items.slice(0, 4).map((item, i) => (
                    <li key={i} className="detail-list">{item}</li>
                  ))}
                  {product.productDetails.items.length > 4 && (
                    <li className="detail-list">...</li>
                  )}
                </ul>
              </div>
            ) : product.description ? (
              <p className="quick-view-desc">{product.description}</p>
            ) : null}
            <div className="quick-view-actions">
              {product.variable ? (
                <Link
                  href={`/product/${product.slug}`}
                  className="btn btn-default"
                  onClick={closeQuickView}
                >
                  Select options
                </Link>
              ) : (
                <button className="btn btn-default" onClick={handleAdd}>
                  Add to cart
                </button>
              )}
              <Link
                href={`/product/${product.slug}`}
                className="btn btn-outline"
                onClick={closeQuickView}
              >
                View details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
