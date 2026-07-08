"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/types";
import {
  areAllOptionsSelected,
  getVariationAttributes,
  parseAttributeOptions,
} from "@/lib/product-variants";
import { getValidProductImages } from "@/lib/product-images";

interface ProductDetailProps {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const images = getValidProductImages(product);
  const [activeImage, setActiveImage] = useState(0);

  const variationAttributes = useMemo(
    () => (product.variable ? getVariationAttributes(product.attributes) : []),
    [product.variable, product.attributes]
  );

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const initial: Record<string, string> = {};
    variationAttributes.forEach((attr) => {
      const options = parseAttributeOptions(attr.value);
      if (options.length === 1) initial[attr.name] = options[0];
    });
    setSelectedOptions(initial);
  }, [product.slug, variationAttributes]);

  const allOptionsSelected = areAllOptionsSelected(
    variationAttributes,
    selectedOptions
  );

  const displayAttributes = useMemo(() => {
    if (!product.attributes?.length) return [];
    if (!product.variable) return product.attributes;
    const variationNames = new Set(variationAttributes.map((attr) => attr.name));
    return product.attributes.filter((attr) => !variationNames.has(attr.name));
  }, [product.attributes, product.variable, variationAttributes]);

  const handleAdd = () => {
    if (product.variable && !allOptionsSelected) return;
    addItem(product, qty, product.variable ? selectedOptions : undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.variable && !allOptionsSelected) return;
    addItem(product, qty, product.variable ? selectedOptions : undefined);
    router.push("/checkout");
  };

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail-grid">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="product-main-image">
              {images.length > 0 ? (
                <Image
                  src={images[activeImage]}
                  alt={product.title}
                  width={600}
                  height={750}
                  unoptimized
                  priority
                />
              ) : (
                <div className="product-image-placeholder">No image</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={activeImage === i ? "active" : ""}
                    onClick={() => setActiveImage(i)}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} ${i + 1}`}
                      width={80}
                      height={100}
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="product-summary">
            {product.hot && (
              <span className="product-label label-hot">Hot</span>
            )}

            <h1 className="product-detail-title">{product.title}</h1>

            <p className="product-detail-price">
              <span className="price-amount">{formatPrice(product.price)}</span>
              <small className="price-suffix">Incl GST.</small>
            </p>

            {/* Product Details */}
            {product.productDetails && product.productDetails.items.length > 0 && (
              <div className="woocommerce-product-details__short-description">
                <h2 className="prod-heading" aria-label={product.productDetails.heading}>
                  <strong>{product.productDetails.heading}</strong>
                </h2>
                <ul className="prod-list">
                  {product.productDetails.items.map((item, i) => (
                    <li key={i} className="detail-list">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attributes Table */}
            {displayAttributes.length > 0 && (
              <table
                className="woocommerce-product-attributes shop_attributes"
                aria-label="Product Details"
              >
                <tbody>
                  {displayAttributes.map((attr) => (
                    <tr
                      key={attr.name}
                      className={`woocommerce-product-attributes-item woocommerce-product-attributes-item--attribute_${attr.name.toLowerCase().replace(/\s+/g, "_")}`}
                    >
                      <th className="woocommerce-product-attributes-item__label" scope="row">
                        <span className="wd-attr-name">
                          <span className="wd-attr-name-label">{attr.name}</span>
                        </span>
                      </th>
                      <td className="woocommerce-product-attributes-item__value">
                        <span className="wd-attr-term">
                          <p>{attr.value}</p>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Add to Cart Form */}
            <form
              className="cart"
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
            >
              {product.variable && variationAttributes.length > 0 && (
                <ProductVariantSelector
                  attributes={variationAttributes}
                  selected={selectedOptions}
                  onChange={handleOptionChange}
                />
              )}

              <div className="quantity">
                <button
                  type="button"
                  className="minus btn"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  className="input-text qty text"
                  value={qty}
                  min={1}
                  onChange={(e) =>
                    setQty(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  aria-label="Product quantity"
                />
                <button
                  type="button"
                  className="plus btn"
                  onClick={() => setQty(qty + 1)}
                >
                  +
                </button>
              </div>

              {product.variable ? (
                <>
                  <button
                    type="submit"
                    className="single_add_to_cart_button button alt"
                    disabled={!allOptionsSelected}
                  >
                    {added
                      ? "Added ✓"
                      : allOptionsSelected
                        ? "Add to basket"
                        : "Select options"}
                  </button>
                  <button
                    type="button"
                    className="wd-buy-now-btn button alt"
                    onClick={handleBuyNow}
                    disabled={!allOptionsSelected}
                  >
                    Buy now
                  </button>
                </>
              ) : (
                <>
                  <button type="submit" className="single_add_to_cart_button button alt">
                    {added ? "Added ✓" : "Add to basket"}
                  </button>
                  <button
                    type="button"
                    className="wd-buy-now-btn button alt"
                    onClick={handleBuyNow}
                  >
                    Buy now
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Categories Meta */}
        {product.categories.length > 0 && (
          <div className="wd-before-product-tabs">
            <div className="product_meta wd-layout-inline">
              <span className="posted_in">
                <span className="meta-label">Categories:</span>{" "}
                {product.categories.map((cat, i) => (
                  <span key={cat}>
                    <Link
                      href={`/shop?category=${cat.toLowerCase().replace(/\s+/g, "-")}`}
                      rel="tag"
                    >
                      {cat}
                    </Link>
                    {i < product.categories.length - 1 && (
                      <span className="meta-sep">, </span>
                    )}
                  </span>
                ))}
              </span>
            </div>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <section className="related-products-section">
            <h2 className="related-title">
              <span>Related products</span>
            </h2>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
