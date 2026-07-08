import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

function RoleBadge({ role }: { role: string }) {
  return <span className={`admin-badge admin-badge-${role}`}>{role}</span>;
}

export default async function AdminUsersPage() {
  const db = getDb();
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <div>
      <div className="admin-page-header">
        <h2>Users ({allUsers.length})</h2>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name ?? "—"}</td>
                <td>{user.email}</td>
                <td>
                  <RoleBadge role={user.role} />
                </td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-IN")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
