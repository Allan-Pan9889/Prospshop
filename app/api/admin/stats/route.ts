import { NextResponse } from "next/server";
import { count } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-api";
import { getDb } from "@/lib/db";
import { users, products } from "@/lib/db/schema";
import { getOrderStats } from "@/lib/orders";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const db = getDb();
  const [userCount] = await db.select({ count: count() }).from(users);
  const [productCount] = await db.select({ count: count() }).from(products);
  const orderStats = await getOrderStats();

  return NextResponse.json({
    users: userCount.count,
    products: productCount.count,
    ...orderStats,
  });
}
