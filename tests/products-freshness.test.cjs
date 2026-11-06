const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const catalog = require('../data/all-products.json');
const homepage = require('../data/products.json');

function load(file, mocks = {}, env = { DATABASE_URL: 'postgres://configured' }) {
  const exports = {};
  const context = {
    exports, process: { env }, URLSearchParams,
    require(name) {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith('@/')) return require('../' + name.slice(2));
      return require(name);
    },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, esModuleInterop: true },
  }).outputText, context, { filename: file });
  return exports;
}

function databaseModule(getDb, env) {
  return load('lib/products-db.ts', {
    '@/lib/db': { getDb }, '@/lib/db/schema': { products: {} },
    '@/lib/types': { decodeHtml: (text) => text },
    '@/lib/asset-url': { rewriteLegacyAssetUrl: (url) => url, rewriteLegacyAssetUrls: (urls) => urls },
    '@/lib/admin-product-filters': { escapeLike: (value) => value },
  }, env);
}

function emptyDb() {
  return { select(fields) {
    const rows = fields?.count ? [{ count: 0 }] : [];
    const chain = { then: (resolve, reject) => Promise.resolve(rows).then(resolve, reject) };
    for (const name of ['from', 'where', 'orderBy', 'limit']) chain[name] = () => chain;
    return chain;
  }};
}

test('a configured but empty database never resurrects the JSON catalog', async () => {
  const products = databaseModule(emptyDb);
  assert.equal((await products.getAllProducts()).length, 0);
  assert.equal((await products.searchProducts('saree')).length, 0);
  assert.equal((await products.getAllSlugs()).length, 0);
});
test('database errors propagate rather than silently displaying deleted catalog entries', async () => {
  const products = databaseModule(() => { throw new Error('Database unavailable'); });
  await assert.rejects(products.getAllProducts(), /Database unavailable/);
});
test('build phase must not override a configured authoritative database', async () => {
  const products = databaseModule(emptyDb, { DATABASE_URL: 'postgres://configured', NEXT_PHASE: 'phase-production-build' });
  assert.equal(await products.getProductBySlug(catalog[0].slug), undefined);
});
test('a recovered connection is checked again on the next request', async () => {
  let fail = true;
  const products = databaseModule(() => { if (fail) throw new Error('Connection lost'); return emptyDb(); });
  await assert.rejects(products.getAllProducts(), /Connection lost/);
  fail = false;
  assert.equal((await products.getAllProducts()).length, 0);
});
test('JSON demo mode remains available only when no database is configured', async () => {
  const products = databaseModule(() => { throw new Error('Should not query database'); }, {});
  assert.equal((await products.getAllProducts()).length, catalog.length);
});

function homepageModule(getAllProducts) {
  return load('lib/products.ts', {
    './products-db': { getAllProducts }, './asset-url': {
      rewriteLegacyAssetUrl: (url) => url, rewriteLegacyAssetUrls: (urls) => urls,
    }, './product-utils': {},
    '@/data/products.json': homepage,
  });
}

test('homepage uses current catalog values and omits removed or draft featured products', async () => {
  const featured = homepage.recommendations[0];
  const live = { ...featured, title: 'Updated database title', price: 123.45 };
  const products = homepageModule(async () => [live]);
  const data = await products.getHomepageData();
  assert.equal(data.recommendations.length, 1);
  assert.equal(data.recommendations[0].title, live.title);
  assert.equal(data.recommendations[0].price, live.price);
  assert.ok([...data.recommendations, ...data.bestCollection].every(p => p.slug === live.slug));
});
test('homepage reevaluates changes for each request, including an empty catalog', async () => {
  let live = [homepage.recommendations[0]];
  const products = homepageModule(async () => live);
  assert.equal((await products.getHomepageData()).recommendations.length, 1);
  live = [];
  const data = await products.getHomepageData();
  assert.equal(data.recommendations.length, 0);
  assert.equal(data.bestCollection.length, 0);
});

test('catalog mutations invalidate storefront, detail and admin pages only after success', async () => {
  const paths = [];
  const invalidation = load('lib/product-cache.ts', {
    'next/cache': { revalidatePath: (...args) => paths.push(args) },
  });
  const events = [];
  const product = { id: 'test-id', slug: 'test-slug', title: 'Test', price: 1, image: 'https://example.com/test.jpg' };
  const mocks = {
    '@/lib/admin-api': { requireAdminApi: async () => ({ error: null }) },
    '@/lib/product-cache': { revalidateProductPages: () => { events.push('invalidate'); invalidation.revalidateProductPages(); } },
    '@/lib/products-db': {
      createProduct: async () => { events.push('create'); return product; },
      updateProduct: async () => { events.push('update'); return product; },
      deleteProduct: async () => { events.push('delete'); },
    },
  };
  const collection = load('app/api/admin/products/route.ts', mocks);
  const item = load('app/api/admin/products/[id]/route.ts', mocks);
  const params = { params: Promise.resolve({ id: product.id }) };
  const request = (body) => ({ json: async () => body });
  assert.equal((await collection.POST(request(product))).status, 201);
  assert.equal((await item.PATCH(request({ price: 2 }), params)).status, 200);
  assert.equal((await item.DELETE(request({}), params)).status, 200);
  assert.deepEqual(events, ['create', 'invalidate', 'update', 'invalidate', 'delete', 'invalidate']);
  for (const path of ['/', '/shop', '/product/[slug]', '/admin/products', '/admin/products/[id]']) {
    assert.equal(paths.filter(([value]) => value === path).length, 3, path);
  }
  assert.ok(paths.some(([path, type]) => path === '/product/[slug]' && type === 'page'));

  events.length = 0;
  mocks['@/lib/products-db'].updateProduct = async () => null;
  const missing = load('app/api/admin/products/[id]/route.ts', mocks);
  assert.equal((await missing.PATCH(request({ price: 2 }), params)).status, 404);
  assert.deepEqual(events, []);
});
