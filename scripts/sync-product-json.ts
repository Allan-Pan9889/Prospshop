import fs from "fs";
import path from "path";

const PATCHES: Record<
  string,
  {
    image?: string;
    images?: string[];
    attributes?: { name: string; value: string }[];
    variable?: boolean;
  }
> = {
  "winter-socks-for-women-1-pair-thumb-toe-design-warm-inner-fleece-cotton-polyester-lycra-blend-stretchable-assorted-color-free-size":
    {
      image:
        "https://prospshop.in/wp-content/uploads/2024/12/41pPzT93R5L._SX679_.jpg",
      images: [
        "https://prospshop.in/wp-content/uploads/2024/12/41pPzT93R5L._SX679_.jpg",
      ],
      attributes: [
        { name: "Size", value: "Free Size" },
        { name: "Colour", value: "Skin" },
      ],
      variable: false,
    },
  "women-printed-flared-a-line-kurta-with-pant-and-dupatta-suit-set-kurta-set": {
    attributes: [
      { name: "Size", value: "S, L, M, XL" },
      { name: "Colour", value: "Green" },
    ],
    images: [
      "https://prospshop.in/wp-content/uploads/2024/12/61bnkK-0oYL._SY741_.jpg",
      "https://prospshop.in/wp-content/uploads/2024/12/71rDcXyGtGL._SY741_.jpg",
      "https://prospshop.in/wp-content/uploads/2024/12/81S76GsHOVL._SX569_.jpg",
      "https://prospshop.in/wp-content/uploads/2024/12/71J4Ag2jZhL._SX569_.jpg",
    ],
    variable: true,
  },
  "womens-rayon-blend-anarkali-printed-kurta-with-palazzo-dupatta": {
    attributes: [
      { name: "Size", value: "S, L, M, XL" },
      { name: "Colour", value: "Yellow" },
    ],
    images: [
      "https://prospshop.in/wp-content/uploads/2024/12/71mX4WATh-L._SX569_.jpg",
      "https://prospshop.in/wp-content/uploads/2024/12/8122DgcOT1L._SX569_.jpg",
      "https://prospshop.in/wp-content/uploads/2024/12/81W8szHm-fL._SX569_.jpg",
    ],
    variable: true,
  },
  "womens-blouse": {
    image: "https://prospshop.in/wp-content/uploads/2024/12/814rQsvDutL._SY879_.jpg",
    images: [
      "https://prospshop.in/wp-content/uploads/2024/12/814rQsvDutL._SY879_.jpg",
    ],
    attributes: [
      { name: "Size", value: "S, L, M, XL" },
      { name: "Colour", value: "Black" },
    ],
    variable: true,
  },
};

function patchProduct<T extends { slug: string; image?: string }>(product: T): T {
  const patch = PATCHES[product.slug];
  if (!patch) return product;
  const images = patch.images ?? (product as { images?: string[] }).images;
  const image =
    patch.image ??
    images?.[0] ??
    product.image;
  return {
    ...product,
    ...patch,
    image,
    images: images ?? (patch.images ? patch.images : undefined),
  };
}

function patchFile(filePath: string, isHomepage = false) {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);

  if (isHomepage) {
    data.recommendations = data.recommendations.map(patchProduct);
    data.bestCollection = data.bestCollection.map(patchProduct);
  } else {
    const patched = data.map(patchProduct);
    fs.writeFileSync(filePath, JSON.stringify(patched, null, 2));
    console.log(`Patched ${filePath}`);
    return;
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Patched ${filePath}`);
}

const root = path.join(process.cwd(), "data");
patchFile(path.join(root, "all-products.json"));
patchFile(path.join(root, "products.json"), true);

console.log("JSON sync complete");
