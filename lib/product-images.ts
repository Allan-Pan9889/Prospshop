import { rewriteLegacyAssetUrl, rewriteLegacyAssetUrls } from "@/lib/asset-url";

export function getValidProductImages(product: {
  image?: string;
  images?: string[];
}): string[] {
  const fromGallery = rewriteLegacyAssetUrls(product.images).filter((url) =>
    url.trim()
  );
  if (fromGallery.length > 0) return fromGallery;
  const main = rewriteLegacyAssetUrl(product.image);
  if (main) return [main];
  return [];
}
