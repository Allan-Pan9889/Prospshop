import { notFound } from "next/navigation";
import { getProductByIdAdmin } from "@/lib/products-db";
import EditProductForm from "@/components/admin/EditProductForm";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductByIdAdmin(id);
  if (!product) notFound();

  return <EditProductForm product={product} />;
}
