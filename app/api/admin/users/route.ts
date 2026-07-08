import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-api";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

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

  return NextResponse.json(allUsers);
}
