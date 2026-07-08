import { requireAdmin } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import "./admin.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="admin-app">
      <AdminSidebar userName={user.name ?? user.email ?? "Admin"} />
      <div className="admin-main">
        <header className="admin-topbar">
          <h1>Management Console</h1>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
