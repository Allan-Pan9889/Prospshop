import PageTitle from "@/components/PageTitle";
import BasketContent from "@/components/BasketContent";

export const metadata = {
  title: "Basket – Tradexel Digitech Private Limited",
};

export default function BasketPage() {
  return (
    <>
      <PageTitle
        title="Basket"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Basket" }]}
      />
      <div className="basket-page">
        <div className="container">
          <BasketContent />
        </div>
      </div>
    </>
  );
}
