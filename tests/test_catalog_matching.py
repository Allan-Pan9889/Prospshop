"""Regression checks for garment matching and complete local image coverage."""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('catalog', ROOT / 'scripts/assign-catalog-images.py')
catalog = importlib.util.module_from_spec(spec)
spec.loader.exec_module(catalog)


class MatchingTests(unittest.TestCase):
    def test_blouse_is_not_a_saree(self):
        self.assertEqual(catalog.kind_of({'title': 'Readymade Saree Blouse Crop Top', 'categories': ['Blouse']}), 'blouse')

    def test_kurta_with_dupatta_is_not_a_scarf(self):
        self.assertEqual(catalog.kind_of({'title': 'Printed Kurta with Palazzo & Dupatta'}), 'kurta')

    def test_cord_set_takes_precedence_over_kurta(self):
        self.assertEqual(catalog.kind_of({'title': 'Printed Co-Ord Set Kurta with Pant'}), 'co-ord')

    def test_short_kurti_is_separate_from_full_length_kurta(self):
        self.assertEqual(catalog.kind_of({'title': 'Short Chikankari Kurti'}), 'short-kurti')

    def test_color_uses_attributes_before_generic_title(self):
        p = {'title': 'Women Saree with Gold Border', 'attributes': [{'name': 'Colour', 'value': 'Navy Blue'}]}
        self.assertEqual(catalog.colors_of(p), ['blue'])

    def test_no_unrelated_garment_fallback(self):
        with self.assertRaises(ValueError):
            catalog.match_product({'slug': 'socks', 'title': 'Cotton Socks'}, [{'id': 'saree', 'kind': 'saree', 'colors': ['white'], 'tags': []}])

    def test_every_catalog_and_homepage_image_exists(self):
        for filename in ('data/all-products.json', 'data/products.json', 'data-products-temp.json'):
            data = json.loads((ROOT / filename).read_text())
            for product in catalog.walk_products(data):
                with self.subTest(file=filename, slug=product['slug']):
                    self.assertTrue(product['image'].startswith('/catalog/'))
                    self.assertTrue((ROOT / 'public' / product['image'].lstrip('/')).is_file())
                    self.assertEqual(product['images'][0], product['image'])
                    for image in product['images']:
                        self.assertTrue((ROOT / 'public' / image.lstrip('/')).is_file())


if __name__ == '__main__':
    unittest.main()
