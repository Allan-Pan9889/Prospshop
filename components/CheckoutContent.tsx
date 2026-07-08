"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/types";

export default function CheckoutContent() {
  const { items, total, clearCart } = useCart();
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0 && !placed) {
    return (
      <div className="container checkout-empty">
        <p>Your basket is empty.</p>
        <Link href="/shop" className="btn btn-default">
          Go to shop
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="container checkout-success">
        <h4>Thank you for your order!</h4>
        <p>
          Your order <strong>{orderNumber}</strong> has been placed successfully.
          You will receive a confirmation email shortly.
        </p>
        <Link href="/shop" className="btn btn-default">
          Continue shopping
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const firstName = form.get("firstName") as string;
    const lastName = form.get("lastName") as string;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${firstName} ${lastName}`,
          customerEmail: form.get("email"),
          customerPhone: form.get("phone"),
          shippingAddress: form.get("address"),
          city: form.get("city"),
          state: form.get("state"),
          pinCode: form.get("pinCode"),
          items: items.map((item) => ({
            slug: item.slug,
            title: item.title,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to place order");
      }

      const data = await res.json();
      setOrderNumber(data.orderNumber);
      clearCart();
      setPlaced(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <form className="checkout-form" onSubmit={handleSubmit}>
          {error && (
            <p style={{ color: "#dc2626", marginBottom: 16, gridColumn: "1 / -1" }}>
              {error}
            </p>
          )}
          <div className="checkout-billing">
            <h4>Billing details</h4>
            <div className="form-row">
              <div className="form-group">
                <label>First name *</label>
                <input type="text" name="firstName" required />
              </div>
              <div className="form-group">
                <label>Last name *</label>
                <input type="text" name="lastName" required />
              </div>
            </div>
            <div className="form-group">
              <label>Email address *</label>
              <input type="email" name="email" required />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input type="tel" name="phone" required />
            </div>
            <div className="form-group">
              <label>Street address *</label>
              <input type="text" name="address" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Town / City *</label>
                <input type="text" name="city" required />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input type="text" name="state" required />
              </div>
            </div>
            <div className="form-group">
              <label>PIN Code *</label>
              <input type="text" name="pinCode" required />
            </div>
          </div>
          <div className="checkout-order">
            <h4>Your order</h4>
            <ul className="checkout-items">
              {items.map((item) => (
                <li key={item.slug}>
                  <span>
                    {item.title} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="checkout-total">
              <span>Total</span>
              <strong>{formatPrice(total)} Incl GST.</strong>
            </div>
            <button
              type="submit"
              className="btn btn-default btn-full"
              disabled={submitting}
            >
              {submitting ? "Placing order..." : "Place order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
