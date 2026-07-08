import { notFound, redirect } from "next/navigation";
import PageTitle from "@/components/PageTitle";
import UserOrderDetail from "@/components/UserOrderDetail";
import { auth } from "@/lib/auth";
import { getOrderForUser } from "@/lib/orders";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { title: "Order – My account" };
  }

  const order = await getOrderForUser(id, session.user.id, session.user.email);
  return {
    title: order
      ? `Order ${order.orderNumber} – My account`
      : "Order – My account",
  };
}

export default async function UserOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/my-account");
  }

  const { id } = await params;
  const order = await getOrderForUser(id, session.user.id, session.user.email);
  if (!order) notFound();

  return (
    <>
      <PageTitle
        title={`Order ${order.orderNumber}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "My account", href: "/my-account" },
          { label: order.orderNumber },
        ]}
      />
      <div className="account-page">
        <div className="container">
          <UserOrderDetail order={order} />
        </div>
      </div>
    </>
  );
}
