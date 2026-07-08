import Link from "next/link";
import { formatPrice } from "@/lib/types";

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: Date | null;
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`order-status order-status-${status}`}>{status}</span>;
}

export default function OrderHistory({ orders }: { orders: OrderSummary[] }) {
  if (orders.length === 0) {
    return (
      <div className="account-orders">
        <h4>Order History</h4>
        <p className="account-orders-empty">You haven&apos;t placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="account-orders">
      <h4>Order History</h4>
      <div className="account-orders-table-wrap">
        <table className="account-orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN")
                    : "—"}
                </td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>₹{formatPrice(Number(order.total))}</td>
                <td>
                  <Link href={`/my-account/orders/${order.id}`} className="account-order-link">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
