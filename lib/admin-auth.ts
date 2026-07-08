import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const db = getDb();
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user ?? null;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/my-account?error=admin_required");
  }
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.role === "admin";
}
