# 商品图片维护

2026-11-06 已为全部 570 个商品重新匹配本地图片，并同步首页两个商品区及临时商品数据。

- 150 个商品恢复了原图片源上的服饰照片，420 个商品按描述匹配同类参考服饰。
- 按服饰类型优先，再匹配颜色、材质、印花、绣花和款式；同一个图库只使用同一套服饰的照片。
- 部分相近商品共用参考图片；替代照片不代表原商品实拍，也不保证面料、工艺和细节完全一致。
- 来源包含现有目录图片的原始 Amazon 图片地址，以及手工检查过的 Pexels 服饰照片。Pexels 素材按 [Pexels License](https://www.pexels.com/license/) 使用。
- 所有图片均存储于 `public/catalog/`，页面加载不再依赖旧站或外部图片服务器。
- 价格、标题、描述、规格、分类和库存标记均保持原值。

## 相关文件

| 文件 | 用途 |
| --- | --- |
| `data/catalog-photo-sources.json` | 经检查的服饰照片组、类型、颜色、风格及原始来源地址 |
| `data/catalog-image-matches.json` | 每个商品的匹配结果、图片组及历史文件名 |
| `data/legacy-image-map.json` | 历史商品图片文件名到本地图片的映射 |
| `scripts/assign-catalog-images.py` | 可重复执行的离线匹配脚本，稳定排序避免每次运行随机换图 |
| `scripts/sync-catalog-images.mjs` | 仅同步数据库中的商品图片及订单缩略图；写入前备份并使用事务 |

匹配器不会跨服饰类型回退，例如不会用纱丽替代袜子或用套装替代单独的衬衫。
新增照片时，先将文件放入 `public/catalog/`，并在素材清单中填写实际服饰类型、颜色、风格及来源。一个 `images` 组必须展示同一款服饰。

## 维护命令

```bash
# 重新匹配全部 JSON 商品；首页使用相同 slug 的一致结果
npm run catalog:match

# 检查匹配可复现性、本地文件完整性、分类规则及旧地址兼容
npm run catalog:check

# 预览数据库同步数量，不写入
npm run db:sync-images

# 实际同步图片字段，并先在系统临时目录保存原字段备份
npm run db:sync-images -- --apply

npm run build
```

数据库同步脚本只修改 `products.image`、`products.images` 和 `order_items.product_image`。脚本遇到不在 JSON 目录里的数据库商品时会终止，避免无提示地漏掉新增商品。重复同步已一致的数据不会产生写入。

浏览器旧购物车里的旧域名、`/wp-content/uploads/` 图片，以及维护脚本中的旧图片路径，由 `lib/asset-url.ts` 映射到本地文件。新填写的其他外部图片地址不受此映射影响。
