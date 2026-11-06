import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return {
    title: `${product.title} – Tradexel Digitech Private Limited`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);

  return <ProductDetail product={product} related={related} />;
}
