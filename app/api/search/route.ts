import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/products-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? "8");

  const results = await searchProducts(q, limit);
  return NextResponse.json(results);
}
