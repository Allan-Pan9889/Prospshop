import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import {
  getAllProductsAdmin,
  createProduct,
  getProductByIdAdmin,
  updateProduct,
  deleteProduct,
} from "@/lib/products-db";

const productSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  price: z.number().positive(),
  image: z.string().url(),
  images: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  description: z.string().optional(),
  productDetails: z
    .object({ heading: z.string(), items: z.array(z.string()) })
    .nullable()
    .optional(),
  attributes: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
  hot: z.boolean().optional(),
  variable: z.boolean().optional(),
  inStock: z.boolean().optional(),
  status: z.enum(["published", "draft"]).optional(),
});

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const products = await getAllProductsAdmin();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  }

  try {
    const product = await createProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
