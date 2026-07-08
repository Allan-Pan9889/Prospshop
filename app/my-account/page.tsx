import PageTitle from "@/components/PageTitle";
import AccountForm from "@/components/AccountForm";
import { auth } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/orders";

export const metadata = {
  title: "My account – Prospirete Crest Technologies Private Limited",
};

export default async function MyAccountPage() {
  const session = await auth();
  const orders =
    session?.user?.id && session.user.email
      ? await getOrdersForUser(session.user.id, session.user.email)
      : [];

  return (
    <>
      <PageTitle
        title="My account"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "My account" }]}
      />
      <div className="account-page">
        <div className="container">
          <AccountForm orders={orders} />
        </div>
      </div>
    </>
  );
}
