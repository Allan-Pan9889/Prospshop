export interface ProductDetailInfo {
  heading: string;
  items: string[];
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Product {
  id?: number;
  slug: string;
  url?: string;
  title: string;
  price: number;
  image: string;
  images?: string[];
  categories: string[];
  hot: boolean;
  variable: boolean;
  description?: string;
  productDetails?: ProductDetailInfo | null;
  attributes?: ProductAttribute[];
  inStock?: boolean;
}

export interface ProductData {
  recommendations: Product[];
  bestCollection: Product[];
}

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  options?: Record<string, string>;
}

export function formatPrice(price: number): string {
  return price.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function decodeHtml(text: string): string {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}
