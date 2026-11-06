const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const context = { exports: {}, URL, require: (name) => require(name.startsWith('@/') ? path.resolve(root, name.slice(2)) : path.resolve(root, 'lib', name)) };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'lib/asset-url.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, esModuleInterop: true },
}).outputText, context);
const { rewriteLegacyAssetUrl: rewrite, rewriteLegacyAssetUrls: rewriteAll } = context.exports;
const aliases = require('../data/legacy-image-map.json');
const oldCatalog = Object.keys(aliases).map((name) => ({ image: '/wp-content/uploads/2024/12/' + name, images: [] }));

test('all old main and gallery addresses resolve to local files', () => {
  for (const p of oldCatalog) {
    for (const old of [p.image, ...(p.images || [])]) {
      const replacement = rewrite(old);
      assert.ok(replacement.startsWith('/catalog/'), `${old} => ${replacement}`);
      assert.ok(fs.existsSync(path.join(root, 'public', replacement)), replacement);
      for (const host of ['https://prospshop.in', 'https://www.prospshop.com']) {
        assert.equal(rewrite(host + old), replacement);
      }
    }
  }
});
test('local catalog paths and unrelated external URLs are preserved', () => {
  assert.equal(rewrite('/catalog/example.jpg'), '/catalog/example.jpg');
  assert.equal(rewrite('https://other.example/71mX4WATh-L._SX569_.jpg'), 'https://other.example/71mX4WATh-L._SX569_.jpg');
});
test('legacy galleries deduplicate after multiple missing photos map to one reference', () => {
  const results = rewriteAll([oldCatalog[1].image, oldCatalog[1].image]);
  assert.equal(results.length, 1);
  assert.equal(results.length, new Set(results).size);
});
test('malformed and prototype-like legacy filenames cannot break image rendering', () => {
  for (const name of ['toString', 'constructor', '__proto__', '%invalid']) {
    const url = '/wp-content/uploads/' + name;
    assert.equal(rewrite(url), url);
  }
  assert.equal(rewrite('https://m.media-amazon.com/images/I/new-image.jpg'), 'https://m.media-amazon.com/images/I/new-image.jpg');
});
