import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { getDb } from "../lib/db";
import { products } from "../lib/db/schema";
import allProducts from "../data/all-products.json";
import type { Product } from "../lib/types";

const PATCHES: Record<
  string,
  {
    image?: string;
    images?: string[];
    attributes?: { name: string; value: string }[];
    variable?: boolean;
  }
> = {
  "winter-socks-for-women-1-pair-thumb-toe-design-warm-inner-fleece-cotton-polyester-lycra-blend-stretchable-assorted-color-free-size":
    {
      image:
        "https://prospshop.in/wp-content/uploads/2024/12/41pPzT93R5L._SX679_.jpg",
      images: [
        "https://prospshop.in/wp-content/uploads/2024/12/41pPzT93R5L._SX679_.jpg",
      ],
      attributes: [
        { name: "Size", value: "Free Size" },
        { name: "Colour", value: "Skin" },
      ],
      variable: false,
    },
  "women-printed-flared-a-line-kurta-with-pant-and-dupatta-suit-set-kurta-set": {
    attributes: [
      { name: "Size", value: "S, L, M, XL" },
      { name: "Colour", value: "Green" },
    ],
    images: [
      "https://prospshop.in/wp-content/uploads/2024/12/61bnkK-0oYL._SY741_.jpg",
      "https://prospshop.in/wp-content/uploads/2024/12/71rDcXyGtGL._SY741_.jpg",
      "https://prospshop.in/wp-content/uploads/2024/12/81S76GsHOVL._SX569_.jpg",
      "https://prospshop.in/wp-content/uploads/2024/12/71J4Ag2jZhL._SX569_.jpg",
    ],
    variable: true,
  },
  "womens-rayon-blend-anarkali-printed-kurta-with-palazzo-dupatta": {
    attributes: [
      { name: "Size", value: "S, L, M, XL" },
      { name: "Colour", value: "Yellow" },
    ],
    images: [
      "https://prospshop.in/wp-content/uploads/2024/12/71mX4WATh-L._SX569_.jpg",
      "https://prospshop.in/wp-content/uploads/2024/12/8122DgcOT1L._SX569_.jpg",
      "https://prospshop.in/wp-content/uploads/2024/12/81W8szHm-fL._SX569_.jpg",
    ],
    variable: true,
  },
  "womens-blouse": {
    image: "https://prospshop.in/wp-content/uploads/2024/12/814rQsvDutL._SY879_.jpg",
    images: [
      "https://prospshop.in/wp-content/uploads/2024/12/814rQsvDutL._SY879_.jpg",
    ],
    attributes: [
      { name: "Size", value: "S, L, M, XL" },
      { name: "Colour", value: "Black" },
    ],
    variable: true,
  },
};

async function patchDb() {
  const db = getDb();
  const catalog = allProducts as Product[];

  for (const [slug, patch] of Object.entries(PATCHES)) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.image) updateData.image = patch.image;
    if (patch.images) updateData.images = patch.images;
    if (patch.attributes) updateData.attributes = patch.attributes;
    if (patch.variable !== undefined) updateData.variable = patch.variable;

    const result = await db
      .update(products)
      .set(updateData)
      .where(eq(products.slug, slug))
      .returning({ slug: products.slug });

    if (result.length) {
      console.log(`Updated DB: ${slug}`);
      continue;
    }

    const source = catalog.find((p) => p.slug === slug);
    if (!source) {
      console.log(`Not in DB or JSON: ${slug}`);
      continue;
    }

    await db.insert(products).values({
      slug: source.slug,
      title: source.title,
      price: String(source.price),
      image: patch.image ?? source.image,
      images: patch.images ?? source.images ?? [source.image],
      categories: source.categories ?? [],
      description: source.description ?? null,
      productDetails: source.productDetails ?? null,
      attributes: patch.attributes ?? source.attributes ?? [],
      hot: source.hot ?? false,
      variable: patch.variable ?? source.variable ?? false,
      inStock: source.inStock !== false,
      status: "published",
      updatedAt: new Date(),
    });
    console.log(`Inserted DB: ${slug}`);
  }
}

patchDb()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
