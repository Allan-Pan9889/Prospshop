import { eq, desc, ilike, or, sql, count, and, ne } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import type { Product, ProductAttribute, ProductDetailInfo } from "@/lib/types";
import { decodeHtml } from "@/lib/types";
import allProducts from "@/data/all-products.json";

type DbProduct = typeof products.$inferSelect;

function rowToProduct(row: DbProduct): Product {
  return {
    id: undefined,
    slug: row.slug,
    title: decodeHtml(row.title),
    price: Number(row.price),
    image: row.image,
    images: (row.images as string[]) ?? [row.image],
    categories: (row.categories as string[]) ?? [],
    description: row.description ?? undefined,
    productDetails: (row.productDetails as ProductDetailInfo | null) ?? undefined,
    attributes: (row.attributes as ProductAttribute[]) ?? [],
    hot: row.hot,
    variable: row.variable,
    inStock: row.inStock,
  };
}

const jsonCatalog = (allProducts as Product[]).map((p) => ({
  ...p,
  title: decodeHtml(p.title),
}));

function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

let dbProductCount: number | null = null;

async function hasDbProducts(): Promise<boolean> {
  if (isBuildPhase()) return false;
  if (dbProductCount !== null) return dbProductCount > 0;
  try {
    const db = getDb();
    const [result] = await db.select({ count: count() }).from(products);
    dbProductCount = result.count;
    return result.count > 0;
  } catch {
    dbProductCount = 0;
    return false;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  if (!(await hasDbProducts())) return jsonCatalog;

  const db = getDb();
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.status, "published"))
    .orderBy(desc(products.hot), desc(products.createdAt));

  return rows.map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!(await hasDbProducts())) {
    return jsonCatalog.find((p) => p.slug === slug);
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, "published")))
    .limit(1);

  return row ? rowToProduct(row) : undefined;
}

export async function getAllSlugs(): Promise<string[]> {
  if (!(await hasDbProducts())) return jsonCatalog.map((p) => p.slug);

  const db = getDb();
  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.status, "published"));
  return rows.map((r) => r.slug);
}

export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  if (!(await hasDbProducts())) {
    return jsonCatalog
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.categories.some((c) => c.toLowerCase().includes(q))
      )
      .slice(0, limit);
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, "published"),
        or(
          ilike(products.title, `%${q}%`),
          sql`${products.categories}::text ILIKE ${"%" + q + "%"}`
        )
      )
    )
    .limit(limit);

  return rows.map(rowToProduct);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const cat = product.categories[0];

  if (!(await hasDbProducts())) {
    if (!cat) return jsonCatalog.filter((p) => p.slug !== product.slug).slice(0, limit);
    return jsonCatalog
      .filter((p) => p.slug !== product.slug && p.categories.includes(cat))
      .slice(0, limit);
  }

  const db = getDb();
  const conditions = [
    eq(products.status, "published"),
    ne(products.slug, product.slug),
  ];
  if (cat) {
    conditions.push(
      sql`${products.categories}::jsonb @> ${JSON.stringify([cat])}::jsonb`
    );
  }

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .limit(limit);

  return rows.map(rowToProduct);
}

// Admin helpers
export async function getAllProductsAdmin() {
  const db = getDb();
  return db.select().from(products).orderBy(desc(products.updatedAt));
}

export async function getProductByIdAdmin(id: string) {
  const db = getDb();
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return row ?? null;
}

export async function createProduct(data: {
  slug: string;
  title: string;
  price: number;
  image: string;
  images?: string[];
  categories?: string[];
  description?: string;
  productDetails?: ProductDetailInfo | null;
  attributes?: ProductAttribute[];
  hot?: boolean;
  variable?: boolean;
  inStock?: boolean;
  status?: string;
}) {
  const db = getDb();
  const [row] = await db
    .insert(products)
    .values({
      slug: data.slug,
      title: data.title,
      price: String(data.price),
      image: data.image,
      images: data.images ?? [data.image],
      categories: data.categories ?? [],
      description: data.description ?? null,
      productDetails: data.productDetails ?? null,
      attributes: data.attributes ?? [],
      hot: data.hot ?? false,
      variable: data.variable ?? false,
      inStock: data.inStock !== false,
      status: data.status ?? "published",
      updatedAt: new Date(),
    })
    .returning();
  return row;
}

export async function updateProduct(
  id: string,
  data: Partial<{
    slug: string;
    title: string;
    price: number;
    image: string;
    images: string[];
    categories: string[];
    description: string | null;
    productDetails: ProductDetailInfo | null;
    attributes: ProductAttribute[];
    hot: boolean;
    variable: boolean;
    inStock: boolean;
    status: string;
  }>
) {
  const db = getDb();
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.price !== undefined) updateData.price = String(data.price);
  if (data.image !== undefined && data.image.trim() !== "") {
    updateData.image = data.image.trim();
    if (data.images === undefined) {
      updateData.images = [data.image.trim()];
    }
  }
  if (data.images !== undefined) {
    updateData.images = data.images.filter((url) => url.trim() !== "");
  }
  if (data.categories !== undefined) updateData.categories = data.categories;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.productDetails !== undefined) updateData.productDetails = data.productDetails;
  if (data.attributes !== undefined) updateData.attributes = data.attributes;
  if (data.hot !== undefined) updateData.hot = data.hot;
  if (data.variable !== undefined) updateData.variable = data.variable;
  if (data.inStock !== undefined) updateData.inStock = data.inStock;
  if (data.status !== undefined) updateData.status = data.status;

  const [row] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, id))
    .returning();
  return row ?? null;
}

export async function deleteProduct(id: string) {
  const db = getDb();
  await db.delete(products).where(eq(products.id, id));
}
