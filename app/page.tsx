import HeroBanner from "@/components/HeroBanner";
import ProductSection from "@/components/ProductSection";
import productData from "@/data/products.json";
import type { ProductData } from "@/lib/types";

const data = productData as ProductData;

export default function HomePage() {
  return (
    <>
      <HeroBanner />
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
