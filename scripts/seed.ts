import { config } from "dotenv";

config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { getDb } from "../lib/db";
import { users, products } from "../lib/db/schema";
import allProducts from "../data/all-products.json";
import type { Product } from "../lib/types";

async function seed() {
  const db = getDb();
  const ADMIN_EMAIL = "admin@tradexelh.com";
  const LEGACY_ADMIN_EMAIL = "admin@prospshop.in";

  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  const [legacyAdmin] = existingAdmin
    ? [null]
    : await db
        .select()
        .from(users)
        .where(eq(users.email, LEGACY_ADMIN_EMAIL))
        .limit(1);

  if (existingAdmin) {
    if (existingAdmin.role !== "admin") {
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.email, ADMIN_EMAIL));
      console.log(`Promoted ${ADMIN_EMAIL} to admin`);
    } else {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    }
  } else if (legacyAdmin) {
    await db
      .update(users)
      .set({ email: ADMIN_EMAIL, role: "admin", name: legacyAdmin.name ?? "Admin" })
      .where(eq(users.email, LEGACY_ADMIN_EMAIL));
    console.log(`Migrated admin email: ${LEGACY_ADMIN_EMAIL} → ${ADMIN_EMAIL}`);
  } else {
    const hashed = await bcrypt.hash("admin123456", 12);
    await db.insert(users).values({
      email: ADMIN_EMAIL,
      name: "Admin",
      password: hashed,
      role: "admin",
    });
    console.log(`Created admin: ${ADMIN_EMAIL} / admin123456`);
  }

  const [productCount] = await db.select({ count: count() }).from(products);
  if (productCount.count > 0) {
    console.log(`Products already seeded (${productCount.count})`);
    return;
  }

  const items = allProducts as Product[];
  const batchSize = 50;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await db.insert(products).values(
      batch.map((p) => ({
        slug: p.slug,
        title: p.title,
        price: String(p.price),
        image: p.image,
        images: p.images ?? [p.image],
        categories: p.categories ?? [],
        description: p.description ?? null,
        productDetails: p.productDetails ?? null,
        attributes: p.attributes ?? [],
        hot: p.hot ?? false,
        variable: p.variable ?? false,
        inStock: p.inStock !== false,
        status: "published",
      }))
    );
    console.log(`Seeded ${Math.min(i + batchSize, items.length)}/${items.length}`);
  }

  console.log("Seed complete");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
