"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/types";

export default function BasketContent() {
  const { items, itemCount, total, removeItem, updateQuantity, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="basket-empty">
        <p>Your basket is currently empty.</p>
        <Link href="/shop" className="btn btn-default">
          Return to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="basket-layout">
      <div className="basket-items">
        <table className="basket-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="basket-product">
                  <Link href={`/product/${item.slug}`}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={80}
                      height={100}
                      unoptimized
                    />
                  </Link>
                  <Link href={`/product/${item.slug}`}>{item.title}</Link>
                </td>
                <td>{formatPrice(item.price)}</td>
                <td>
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
                </td>
                <td>{formatPrice(item.price * item.quantity)}</td>
                <td>
                  <button
                    className="basket-remove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="basket-actions-row">
          <Link href="/shop" className="btn btn-outline">
            Continue shopping
          </Link>
          <button className="btn btn-outline" onClick={clearCart}>
            Clear basket
          </button>
        </div>
      </div>
      <div className="basket-totals">
        <h4>Basket totals</h4>
        <div className="totals-row">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="totals-row totals-grand">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <p className="totals-note">Incl GST.</p>
        <Link href="/checkout" className="btn btn-default btn-full">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
