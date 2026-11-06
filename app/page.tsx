import ProductSection from "@/components/ProductSection";
import { getHomepageData } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomepageData();
  return (
    <>
      <ProductSection
        title="Our Recommendations"
        products={data.recommendations}
      />
      <ProductSection
        title="Best Collection"
        products={data.bestCollection}
        initialCount={12}
        loadMoreStep={8}
        showLoadMore
      />
    </>
  );
}
