import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { getAllOrders } from "@/lib/orders";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const orders = await getAllOrders();
  return NextResponse.json(orders);
}
