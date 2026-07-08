import { Suspense } from "react";
import PageTitle from "@/components/PageTitle";
import ShopContent from "@/components/ShopContent";
import { getAllProducts } from "@/lib/products";

export const metadata = {
  title: "Shop – Prospirete Crest Technologies Private Limited | Woman Fashion Store",
};

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <>
      <PageTitle title="Shop" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <Suspense fallback={<div className="container shop-loading">Loading...</div>}>
        <ShopContent products={products} totalCount={products.length} />
      </Suspense>
    </>
  );
}
