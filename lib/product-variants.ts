import type { ProductAttribute } from "./types";

export function parseAttributeOptions(value: string): string[] {
  return value
    .split(/,\s*/)
    .map((option) => option.trim())
    .filter(Boolean);
}

export function getVariationAttributes(
  attributes: ProductAttribute[] | undefined
): ProductAttribute[] {
  if (!attributes?.length) return [];
  return attributes.filter((attr) => parseAttributeOptions(attr.value).length > 0);
}

export function getVariantKey(options: Record<string, string>): string {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}:${value}`)
    .join("|");
}

export function getCartLineId(slug: string, options?: Record<string, string>): string {
  if (!options || Object.keys(options).length === 0) return slug;
  return `${slug}::${getVariantKey(options)}`;
}

export function formatVariantLabel(options: Record<string, string>): string {
  return Object.entries(options)
    .map(([name, value]) => `${name}: ${value}`)
    .join(", ");
}

export function buildCartTitle(title: string, options?: Record<string, string>): string {
  if (!options || Object.keys(options).length === 0) return title;
  return `${title} (${formatVariantLabel(options)})`;
}

export function areAllOptionsSelected(
  attributes: ProductAttribute[],
  selected: Record<string, string>
): boolean {
  return attributes.every((attr) => Boolean(selected[attr.name]));
}
