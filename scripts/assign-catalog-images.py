#!/usr/bin/env python3
"""Match the catalog to locally stored Indian clothing photos.

Run offline after adding reviewed outfits to data/catalog-photo-sources.json.
Matching is deterministic and restricted to the same garment type. Only image
fields are changed; titles, descriptions, prices and variants are preserved.
"""

import argparse
from collections import Counter
import hashlib
import html
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DATA_FILES = ('data/all-products.json', 'data/products.json', 'data-products-temp.json')
COLOR_ALIASES = {
    'navy': 'blue', 'sky blue': 'blue', 'royal blue': 'blue', 'celeste blue': 'blue',
    'aqua': 'teal', 'turquoise': 'teal', 'sea green': 'teal',
    'emerald': 'green', 'olive': 'green', 'lime green': 'green', 'moss green': 'green',
    'wine': 'maroon', 'burgundy': 'maroon', 'vine': 'maroon',
    'lavender': 'purple', 'violet': 'purple', 'plum': 'purple',
    'magenta': 'pink', 'rani pink': 'pink', 'flamingo pink': 'pink',
    'peach': 'peach', 'coral': 'peach', 'fawn': 'beige', 'skin': 'beige',
    'cream': 'cream', 'ivory': 'cream', 'ecru': 'cream', 'off white': 'cream',
    'golden': 'gold', 'mustard': 'yellow', 'rust': 'orange',
    'coffee': 'brown', 'bronze': 'brown', 'silver': 'grey', 'gray': 'grey',
    'multicolour': 'multi', 'multicolored': 'multi', 'multicoloured': 'multi',
    'multicolor': 'multi', 'multi colour': 'multi', 'multi color': 'multi',
}
BASE_COLORS = ('black', 'white', 'cream', 'beige', 'grey', 'red', 'maroon', 'pink',
               'peach', 'orange', 'yellow', 'gold', 'brown', 'green', 'teal', 'blue',
               'purple', 'multi')
COLOR_FAMILIES = ({'red', 'maroon'}, {'white', 'cream', 'beige'}, {'pink', 'peach'},
                  {'gold', 'yellow'}, {'green', 'teal'}, {'brown', 'orange'})
STYLE_PATTERNS = {
    'silk': r'silk|satin', 'cotton': r'cotton|linen|tant',
    'woven': r'woven|weav|zari|handloom', 'embroidered': r'embroider|chikankari|resham',
    'floral': r'floral|flower|blossom', 'printed': r'print|block|bandhani|bandhej',
    'sequins': r'sequin|embellish|stone|bead|glitter|shimmer',
    'sheer': r'net|organza|sheer', 'georgette': r'georgette|chiffon',
    'ruffle': r'ruffle|frill|pre.stitch|ready.to.wear', 'solid': r'solid|plain',
    'traditional': r'banarasi|kanji|kanchee|paithani|traditional|pattu',
    'long-sleeve': r'full.sleeve|long.sleeve', 'sleeveless': r'sleeveless',
    'winter': r'winter|fleece|thermal|wool|velvet', 'ankle': r'ankle|loafer|no.show',
}


def product_text(product: dict) -> str:
    """Return descriptive text, excluding image URLs and navigation categories."""
    details = product.get('productDetails') or {}
    values = [product.get('title', ''), product.get('description') or '',
              details.get('heading', ''), *details.get('items', [])]
    return html.unescape(' '.join(values)).lower()


def kind_of(product: dict) -> str:
    """Identify the garment itself, not accessories mentioned as part of a set."""
    title = html.unescape(product.get('title', '')).lower()
    categories = {c.lower() for c in product.get('categories', [])}
    category_kinds = {'socks': 'socks', 'gloves': 'gloves', 'leggings': 'leggings',
                      'blouse': 'blouse', 'scarf': 'scarf', 'dupatta': 'dupatta',
                      'cord set': 'co-ord', 'short kurtis': 'short-kurti',
                      'palazzo': 'palazzo', 'kurta set': 'kurta'}
    for category, kind in category_kinds.items():
        if category in categories:
            return kind
    if re.search(r'sock|glove|legging', title):
        return next(k for k in ('socks', 'gloves', 'leggings') if k[:-1] in title)
    if re.search(r'co[ -]?ord|coord|cord[ -]?set|top.*pant.*set', title):
        return 'co-ord'
    if re.search(r'readymade.*blouse|blouse.*crop top|stretchable.*blouse', title):
        return 'blouse'
    if re.search(r'saree|\bsari\b', title):
        return 'saree'
    if 'short' in title and re.search(r'kurti|kurta', title):
        return 'short-kurti'
    if re.search(r'kurta|kurti|anarkali|salwar', title):
        return 'kurta'
    if 'blouse' in title:
        return 'blouse'
    if re.search(r'palazzo|plazo', title):
        return 'palazzo'
    if re.search(r'scarf|scarve|stole|shawl', title):
        return 'scarf'
    if 'dupatta' in title:
        return 'dupatta'
    if 'top' in title or 'shirt' in title:
        return 'top'
    if 'dress' in title or 'gown' in title:
        return 'dress'
    raise ValueError(f"Unrecognized garment: {product.get('slug', title)}")


def extract_colors(text: str) -> list[str]:
    text = re.sub(r'[-_]', ' ', text.lower())
    aliases = {**{c: c for c in BASE_COLORS}, **COLOR_ALIASES}
    found = []
    # Match compound names before their component words (navy blue, off white).
    for label in sorted(aliases, key=lambda s: (-len(s), s)):
        pattern = r'\b' + re.escape(label) + r'\b'
        if re.search(pattern, text):
            found.append(aliases[label])
            text = re.sub(pattern, ' ', text)
    return list(dict.fromkeys(found))


def colors_of(product: dict) -> list[str]:
    """Prefer the explicit colour attribute over incidental trim colors in prose."""
    values = [a['value'] for a in product.get('attributes', [])
              if a['name'].lower() in ('color', 'colour')]
    return extract_colors(' '.join(values)) or extract_colors(product.get('title', ''))


def tags_of(product: dict) -> list[str]:
    text = product_text(product)
    return [tag for tag, pattern in STYLE_PATTERNS.items() if re.search(pattern, text)]


def match_product(product: dict, sources: list[dict], usage: Counter | None = None) -> dict:
    """Choose one reviewed outfit; never combine different garments into a gallery."""
    kind = kind_of(product)
    candidates = [source for source in sources if source['kind'] == kind]
    if not candidates:
        raise ValueError(f'No reviewed images for {kind}: {product["slug"]}')
    exact = next((s for s in candidates if s.get('sourceSlug') == product['slug']), None)
    if exact:
        return exact
    colors, tags = set(colors_of(product)), set(tags_of(product))

    def rank(source: dict) -> tuple[float, str]:
        source_colors = set(source['colors'])
        overlap = (colors & source_colors) - {'multi'}
        similar = any(colors & family and source_colors & family for family in COLOR_FAMILIES)
        color_score = 60 if overlap else 30 if similar else 12 if 'multi' in source_colors else 0
        if colors == {'multi'}:
            color_score = 60 if 'multi' in source_colors else 30 if len(source_colors) > 1 else 12
        elif not colors:
            color_score = 12
        style_score = min(30, 6 * len(tags & set(source['tags'])))
        reuse_penalty = min(12, (usage or {}).get(source['id'], 0) * 0.7)
        studio_bonus = 3 if source.get('sourceSlug') else 0
        tie = hashlib.sha256(f'{product["slug"]}:{source["id"]}'.encode()).hexdigest()
        return color_score + style_score + studio_bonus - reuse_penalty, tie

    return max(candidates, key=rank)


def walk_products(node):
    if isinstance(node, list):
        for item in node:
            yield from walk_products(item)
    elif isinstance(node, dict):
        if 'slug' in node and 'image' in node:
            yield node
        else:
            for value in node.values():
                yield from walk_products(value)


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Validate assets and coverage without writing')
    args = parser.parse_args()
    sources = json.loads((ROOT / 'data/catalog-photo-sources.json').read_text())
    # Validate the whole image pool before touching any catalog data.
    for source in sources:
        if not source['images']:
            raise ValueError(f'Empty photo group: {source["id"]}')
        for photo in source['images']:
            file = ROOT / 'public' / photo['path'].lstrip('/')
            if not photo['path'].startswith('/catalog/') or not file.is_file() or file.stat().st_size < 512:
                raise ValueError(f'Missing or invalid asset: {file}')
    documents = {name: json.loads((ROOT / name).read_text()) for name in DATA_FILES}
    catalog = documents['data/all-products.json']
    report_path = ROOT / 'data/catalog-image-matches.json'
    previous = {p['slug']: p for p in json.loads(report_path.read_text())} if report_path.exists() else {}
    usage = Counter()
    matches = {}
    report = []
    for product in catalog:
        source = match_product(product, sources, usage)
        usage[source['id']] += 1
        paths = list(dict.fromkeys(p['path'] for p in source['images']))
        matches[product['slug']] = paths
        legacy = [unquote(urlsplit(url).path).rsplit('/', 1)[-1]
                  for url in [product['image'], *product.get('images', [])]
                  if '/wp-content/uploads/' in url]
        report.append({'slug': product['slug'], 'title': product['title'],
                       'kind': kind_of(product), 'colors': colors_of(product),
                       'sourceId': source['id'], 'sourceColors': source['colors'],
                       'mode': 'recovered-original' if source.get('sourceSlug') == product['slug'] else 'matched-reference',
                       'images': paths,
                       'legacyFilenames': legacy or previous.get(product['slug'], {}).get('legacyFilenames', [])})
    aliases_path = ROOT / 'data/legacy-image-map.json'
    aliases = json.loads(aliases_path.read_text()) if aliases_path.exists() else {}
    # Refresh historical aliases when a product is rematched to a better outfit.
    current_aliases = {}
    for match in report:
        for index, filename in enumerate(match['legacyFilenames']):
            current_aliases.setdefault(filename, match['images'][max(0, index - 1) % len(match['images'])])
    aliases.update(current_aliases)
    for data in documents.values():
        for product in walk_products(data):
            if product['slug'] not in matches:
                raise ValueError(f'Homepage product missing from catalog: {product["slug"]}')
            paths = matches[product['slug']]
            for index, old in enumerate([product['image'], *product.get('images', [])]):
                old_path = unquote(urlsplit(old).path)
                if '/wp-content/uploads/' in old_path:
                    aliases.setdefault(old_path.rsplit('/', 1)[-1], paths[max(0, index - 1) % len(paths)])
            if args.check and (product['image'] != paths[0] or product.get('images') != paths):
                raise ValueError(f'Catalog image mismatch: {product["slug"]}; rerun without --check')
            product['image'], product['images'] = paths[0], paths
    if not args.check:
        for name, data in documents.items():
            write_json(ROOT / name, data)
        write_json(aliases_path, dict(sorted(aliases.items())))
        write_json(ROOT / 'data/catalog-image-matches.json', report)
    print(json.dumps({'products': len(matches), 'outfitsUsed': len(usage),
                      'recoveredProducts': sum(p['mode'] == 'recovered-original' for p in report),
                      'garments': dict(Counter(p['kind'] for p in report)), 'legacyAliases': len(aliases)}, indent=2))


if __name__ == '__main__':
    main()
