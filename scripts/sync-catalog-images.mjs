/** Sync only catalog image fields, preserving all product and order metadata. */
import { config } from 'dotenv';
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import postgres from 'postgres';

config({ path: '.env.local', quiet: true });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(await readFile(path.join(root, 'data/all-products.json'), 'utf8'));
const bySlug = new Map(catalog.map((p) => [p.slug, p]));
const apply = process.argv.includes('--apply');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');

for (const p of catalog) {
  for (const image of [p.image, ...p.images]) {
    if (!image.startsWith('/catalog/') || image.includes('..')) throw new Error(`Invalid image: ${image}`);
    await access(path.join(root, 'public', image));
  }
}

const sql = postgres(process.env.DATABASE_URL, { connect_timeout: 5, max: 1 });
try {
  await sql.begin(async (tx) => {
    const products = await tx`SELECT id, slug, image, images FROM products FOR UPDATE`;
    const items = await tx`SELECT id, product_slug, product_image FROM order_items FOR UPDATE`;
    const matching = products.filter((p) => bySlug.has(p.slug));
    if (matching.length !== products.length) {
      throw new Error('Database contains products outside this catalog; no images were changed');
    }
    const changedProducts = matching.filter((p) => {
      const target = bySlug.get(p.slug);
      return p.image !== target.image || JSON.stringify(p.images) !== JSON.stringify(target.images);
    });
    const changedItems = items.filter((item) => bySlug.has(item.product_slug)
      && item.product_image !== bySlug.get(item.product_slug).image);
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', products: products.length,
      productImagesToUpdate: changedProducts.length, orderImagesToUpdate: changedItems.length }));
    if (!apply || (!changedProducts.length && !changedItems.length)) return;

    const backup = path.join(os.tmpdir(), `prospshop-images-backup-${Date.now()}.json`);
    await writeFile(backup, JSON.stringify({ products, orderItems: items }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    console.log(`Image backup: ${backup}`);
    for (const p of changedProducts) {
      const target = bySlug.get(p.slug);
      await tx`UPDATE products SET image = ${target.image}, images = ${tx.json(target.images)}::jsonb WHERE id = ${p.id}`;
    }
    for (const item of changedItems) {
      await tx`UPDATE order_items SET product_image = ${bySlug.get(item.product_slug).image} WHERE id = ${item.id}`;
    }
    console.log('Catalog and order image fields synchronized in one transaction');
  });
} finally {
  await sql.end({ timeout: 5 });
}
