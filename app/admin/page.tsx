import Link from "next/link";
import { getOrderStats } from "@/lib/orders";
import { getDb } from "@/lib/db";
import { users, products } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/types";

function StatusBadge({ status }: { status: string }) {
  return <span className={`admin-badge admin-badge-${status}`}>{status}</span>;
}

export default async function AdminDashboard() {
  const db = getDb();
  const [userCount] = await db.select({ count: count() }).from(users);
  const [productCount] = await db.select({ count: count() }).from(products);
  const orderStats = await getOrderStats();
  const recentOrders = (await getAllOrders()).slice(0, 5);

  return (
    <div>
      <div className="admin-page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <h3>Total Revenue</h3>
          <div className="value">₹{formatPrice(orderStats.totalRevenue)}</div>
        </div>
        <div className="admin-stat-card">
          <h3>Orders</h3>
          <div className="value">{orderStats.totalOrders}</div>
        </div>
        <div className="admin-stat-card">
          <h3>Pending Orders</h3>
          <div className="value">{orderStats.pendingOrders}</div>
        </div>
        <div className="admin-stat-card">
          <h3>Products</h3>
          <div className="value">{productCount.count}</div>
        </div>
        <div className="admin-stat-card">
          <h3>Users</h3>
          <div className="value">{userCount.count}</div>
        </div>
      </div>

      <div className="admin-page-header">
        <h2>Recent Orders</h2>
        <Link href="/admin/orders" className="admin-btn admin-btn-secondary admin-btn-sm">
          View all
        </Link>
      </div>

      <div className="admin-table-wrap">
        {recentOrders.length === 0 ? (
          <p className="admin-empty">No orders yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                  </td>
                  <td>{order.customerName}</td>
                  <td>₹{formatPrice(Number(order.total))}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN")
                      : "—"}
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
