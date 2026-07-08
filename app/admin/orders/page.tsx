import Link from "next/link";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/types";

function StatusBadge({ status }: { status: string }) {
  return <span className={`admin-badge admin-badge-${status}`}>{status}</span>;
}

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <div className="admin-page-header">
        <h2>Orders ({orders.length})</h2>
      </div>

      <div className="admin-table-wrap">
        {orders.length === 0 ? (
          <p className="admin-empty">No orders yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{order.customerEmail}</td>
                  <td>₹{formatPrice(Number(order.total))}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
