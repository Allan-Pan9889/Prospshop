"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/types";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/db/schema";

interface OrderItem {
  id: string;
  productTitle: string;
  productSlug: string | null;
  productImage: string | null;
  price: string;
  quantity: number;
}

interface OrderDetailProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    shippingAddress: string;
    city: string | null;
    state: string | null;
    pinCode: string | null;
    subtotal: string;
    total: string;
    createdAt: Date | null;
    items: OrderItem[];
  };
}

export default function OrderDetailClient({ order }: OrderDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  async function updateStatus(newStatus: OrderStatus) {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setStatus(newStatus);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2>Order {order.orderNumber}</h2>
        <Link href="/admin/orders" className="admin-btn admin-btn-secondary">
          ← Back
        </Link>
      </div>

      <div className="admin-order-detail">
        <div className="admin-card">
          <h3>Order Info</h3>
          <div className="admin-detail-row">
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => updateStatus(e.target.value as OrderStatus)}
              disabled={saving}
              style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0" }}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-detail-row">
            <span>Date</span>
            <span>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString("en-IN")
                : "—"}
            </span>
          </div>
          <div className="admin-detail-row">
            <span>Subtotal</span>
            <span>₹{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="admin-detail-row">
            <span>Total</span>
            <strong>₹{formatPrice(Number(order.total))}</strong>
          </div>
        </div>

        <div className="admin-card">
          <h3>Customer</h3>
          <div className="admin-detail-row">
            <span>Name</span>
            <span>{order.customerName}</span>
          </div>
          <div className="admin-detail-row">
            <span>Email</span>
            <span>{order.customerEmail}</span>
          </div>
          <div className="admin-detail-row">
            <span>Phone</span>
            <span>{order.customerPhone ?? "—"}</span>
          </div>
          <div className="admin-detail-row">
            <span>Address</span>
            <span>{order.shippingAddress}</span>
          </div>
          <div className="admin-detail-row">
            <span>City / State</span>
            <span>
              {[order.city, order.state].filter(Boolean).join(", ") || "—"}
            </span>
          </div>
          <div className="admin-detail-row">
            <span>PIN</span>
            <span>{order.pinCode ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 24 }}>
        <h3>Items ({order.items.length})</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.productTitle}</td>
                <td>₹{formatPrice(Number(item.price))}</td>
                <td>{item.quantity}</td>
                <td>₹{formatPrice(Number(item.price) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
