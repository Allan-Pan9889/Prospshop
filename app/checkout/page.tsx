import PageTitle from "@/components/PageTitle";
import CheckoutContent from "@/components/CheckoutContent";

export const metadata = {
  title: "Checkout – Prospirete Crest Technologies Private Limited",
};

export default function CheckoutPage() {
  return (
    <>
      <PageTitle
        title="Checkout"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Checkout" }]}
      />
      <CheckoutContent />
    </>
  );
}
