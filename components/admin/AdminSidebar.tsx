"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  { href: "/admin/users", label: "Users", icon: "👥" },
];

interface AdminSidebarProps {
  userName: string;
}

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
          <Link href="/admin">prospshop.com Admin</Link>
      </div>
      <nav className="admin-nav">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link${active ? " active" : ""}`}
              prefetch={false}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="admin-sidebar-footer">
        <p className="admin-user">{userName}</p>
        <Link href="/" className="admin-nav-link" prefetch={false}>
          ← Back to store
        </Link>
      </div>
    </aside>
  );
}
