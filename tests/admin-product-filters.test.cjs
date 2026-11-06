const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {}, URLSearchParams };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/admin-product-filters.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, context);
const { parseAdminProductFilters: parse, adminProductsHref: href, paginationItems, escapeLike } = context.exports;

test('normalizes filters and retains a valid combined query', () => {
  const f = parse({ q: '  blue cotton  ', category: ' Kurta Set ', page: '3', pageSize: '25' });
  assert.equal(f.q, 'blue cotton'); assert.equal(f.category, 'Kurta Set');
  assert.equal(f.page, 3); assert.equal(f.pageSize, 25);
});
test('invalid, fractional, huge and repeated paging parameters cannot break offsets', () => {
  for (const page of ['0', '-1', '1.5', 'NaN', 'Infinity', '1e2', '999999999999999999999']) {
    assert.equal(parse({ page }).page, 1, page);
  }
  assert.equal(parse({page: ['2','3']}).page, 2);
  assert.equal(parse({pageSize: '999999'}).pageSize, 50);
  assert.equal(parse({pageSize: '100'}).pageSize, 100);
  assert.equal(parse({q:'x'.repeat(500)}).q.length, 200);
});
test('pagination links preserve and encode keyword, category and page size', () => {
  const filters = parse({q:'silk & gold + 100%', category:'New Arrival', pageSize:'25'});
  const url = new URL(href(filters, 3), 'http://localhost');
  assert.equal(url.pathname, '/admin/products');
  assert.equal(url.searchParams.get('q'), filters.q);
  assert.equal(url.searchParams.get('category'), filters.category);
  assert.equal(url.searchParams.get('pageSize'), '25');
  assert.equal(url.searchParams.get('page'), '3');
  assert.equal(href(parse({}), 1), '/admin/products');
});
test('SQL wildcard characters are searched literally', () => {
  assert.equal(escapeLike('100%_cotton\\silk'), '100\\%\\_cotton\\\\silk');
});
test('page links are compact, ordered and always include current and endpoints', () => {
  assert.equal(Array.from(paginationItems(1,1)).join(','), '1');
  assert.equal(Array.from(paginationItems(1,12)).join(','), '1,2,3,4,5,ellipsis,12');
  assert.equal(Array.from(paginationItems(6,12)).join(','), '1,ellipsis,5,6,7,ellipsis,12');
  assert.equal(Array.from(paginationItems(12,12)).join(','), '1,ellipsis,8,9,10,11,12');
  for (let total=1;total<30;total++) for(let page=1;page<=total;page++) {
    const items=Array.from(paginationItems(page,total));
    const nums=items.filter(n=>typeof n==='number');
    assert.ok(items.length<=7); assert.ok(nums.includes(page));
    assert.equal(nums[0],1); assert.equal(nums.at(-1),total);
    assert.ok(nums.every((n,i)=>n>=1&&n<=total&&(i===0||n>nums[i-1])));
  }
});
