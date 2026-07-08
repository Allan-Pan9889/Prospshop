"use client";

import Image from "next/image";
import Link from "next/link";
import { useModal } from "@/contexts/ModalContext";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/types";

export default function CartSidebar() {
  const { cartSidebarOpen, closeCartSidebar } = useModal();
  const { items, itemCount, total, removeItem, updateQuantity } = useCart();

  if (!cartSidebarOpen) return null;

  return (
    <div className="cart-sidebar-overlay" onClick={closeCartSidebar}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-sidebar-header">
          <h3>Shopping cart</h3>
          <button onClick={closeCartSidebar} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="cart-sidebar-body">
          {items.length === 0 ? (
            <p className="cart-empty">Your cart is empty.</p>
          ) : (
            <ul className="cart-items-list">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeCartSidebar}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={80}
                      height={100}
                      unoptimized
                    />
                  </Link>
                  <div className="cart-item-info">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCartSidebar}
                    >
                      {item.title}
                    </Link>
                    <span className="cart-item-price">
                      {formatPrice(item.price)}
                    </span>
                    <div className="qty-control">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="cart-sidebar-footer">
            <div className="cart-subtotal">
              <span>Subtotal ({itemCount} items)</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <Link
              href="/basket"
              className="btn btn-default btn-full"
              onClick={closeCartSidebar}
            >
              View basket
            </Link>
            <Link
              href="/checkout"
              className="btn btn-outline btn-full"
              onClick={closeCartSidebar}
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
