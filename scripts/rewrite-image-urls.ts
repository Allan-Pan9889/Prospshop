import { config } from "dotenv";

config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { getDb } from "../lib/db";

async function rewriteImageUrls() {
  const db = getDb();
  const pattern = sql.raw("'https?://(www\\.)?prospshop\\.(in|com)'");

  await db.execute(sql`
    UPDATE products
    SET
      image = regexp_replace(image, ${pattern}, '', 'gi'),
      images = regexp_replace(images::text, ${pattern}, '', 'gi')::jsonb
    WHERE image ~* ${pattern}
       OR images::text ~* ${pattern}
  `);

  await db.execute(sql`
    UPDATE order_items
    SET product_image = regexp_replace(product_image, ${pattern}, '', 'gi')
    WHERE product_image IS NOT NULL
      AND product_image ~* ${pattern}
  `);

  console.log("Rewrote legacy prospshop image URLs to same-origin paths");
}

rewriteImageUrls().catch((err) => {
  console.error(err);
  process.exit(1);
});
