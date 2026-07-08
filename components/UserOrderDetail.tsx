import Link from "next/link";
import { formatPrice } from "@/lib/types";

interface OrderItem {
  id: string;
  productTitle: string;
  productSlug: string | null;
  price: string;
  quantity: number;
}

interface UserOrderDetailProps {
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

function StatusBadge({ status }: { status: string }) {
  return <span className={`order-status order-status-${status}`}>{status}</span>;
}

export default function UserOrderDetail({ order }: UserOrderDetailProps) {
  return (
    <div className="account-order-detail">
      <div className="account-order-detail-header">
        <div>
          <h4>Order {order.orderNumber}</h4>
          <p className="account-order-meta">
            Placed on{" "}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString("en-IN")
              : "—"}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="account-order-section">
        <h5>Shipping</h5>
        <p>{order.customerName}</p>
        <p>{order.shippingAddress}</p>
        <p>
          {[order.city, order.state, order.pinCode].filter(Boolean).join(", ")}
        </p>
        {order.customerPhone && <p>Phone: {order.customerPhone}</p>}
      </div>

      <div className="account-order-section">
        <h5>Items</h5>
        <div className="account-orders-table-wrap">
          <table className="account-orders-table">
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
                  <td>
                    {item.productSlug ? (
                      <Link href={`/product/${item.productSlug}`}>{item.productTitle}</Link>
                    ) : (
                      item.productTitle
                    )}
                  </td>
                  <td>₹{formatPrice(Number(item.price))}</td>
                  <td>{item.quantity}</td>
                  <td>₹{formatPrice(Number(item.price) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="account-order-totals">
        <div className="account-order-total-row">
          <span>Subtotal</span>
          <span>₹{formatPrice(Number(order.subtotal))}</span>
        </div>
        <div className="account-order-total-row account-order-total-row-strong">
          <span>Total</span>
          <span>₹{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      <Link href="/my-account" className="btn btn-outline account-order-back">
        ← Back to My Account
      </Link>
    </div>
  );
}
