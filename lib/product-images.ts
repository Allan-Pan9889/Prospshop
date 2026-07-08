export function getValidProductImages(product: {
  image?: string;
  images?: string[];
}): string[] {
  const fromGallery = (product.images ?? []).filter((url) => url?.trim());
  if (fromGallery.length > 0) return fromGallery;
  if (product.image?.trim()) return [product.image.trim()];
  return [];
}
