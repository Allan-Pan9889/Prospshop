import legacyImageMap from "@/data/legacy-image-map.json";

const LEGACY_HOSTS = new Set([
  "prospshop.in",
  "www.prospshop.in",
  "prospshop.com",
  "www.prospshop.com",
]);

// Amazon product images that were copied onto the old shop, e.g. 41pPzT93R5L._SX679_.jpg
const AMAZON_IMAGE =
  /([A-Za-z0-9+-]{10,}\._S[XY]\d+_)(?:-\d+|-Copy)?\.(jpe?g|png|webp)$/i;

function amazonImageUrl(filename: string): string | null {
  const match = filename.match(AMAZON_IMAGE);
  if (!match) return null;
  return `https://m.media-amazon.com/images/I/${match[1]}.${match[2].toLowerCase()}`;
}

export function rewriteLegacyAssetUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  let path = trimmed;
  let remoteAmazon = false;
  if (!trimmed.startsWith("/")) {
    try {
      const parsed = new URL(trimmed);
      if (LEGACY_HOSTS.has(parsed.hostname.toLowerCase())) {
        path = `${parsed.pathname}${parsed.search}`;
      } else if (parsed.hostname === "m.media-amazon.com") {
        path = parsed.pathname;
        remoteAmazon = true;
      } else {
        return trimmed;
      }
    } catch {
      path = trimmed;
    }
  }

  const rawFilename = path.split("?")[0].split("/").pop() ?? "";
  let filename = rawFilename;
  try {
    filename = decodeURIComponent(rawFilename);
  } catch {
    // Malformed percent escapes should not break rendering of an admin-entered URL.
  }
  if (path.startsWith("/wp-content/uploads/") || path.startsWith("/images/I/")) {
    const local = (legacyImageMap as Record<string, string>)[filename];
    if (typeof local === "string") return local;
  }
  return amazonImageUrl(filename) ?? (remoteAmazon ? trimmed : path);
}

export function rewriteLegacyAssetUrls(urls?: string[] | null): string[] {
  return [...new Set((urls ?? []).map(rewriteLegacyAssetUrl).filter(Boolean))];
}
