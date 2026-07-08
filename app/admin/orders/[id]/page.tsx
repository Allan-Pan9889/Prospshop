import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import OrderDetailClient from "@/components/admin/OrderDetailClient";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return <OrderDetailClient order={order} />;
}
