import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { getProductByIdAdmin, updateProduct, deleteProduct } from "@/lib/products-db";

const productSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  image: z.string().min(1).optional(),
  images: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  description: z.string().nullable().optional(),
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const product = await getProductByIdAdmin(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();

  if (body.image === "" || (typeof body.image === "string" && !body.image.trim())) {
    delete body.image;
  }

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  }

  const product = await updateProduct(id, parsed.data);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
