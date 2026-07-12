import { Footer } from "@/components/layout/footer";
import { ProductComparisonPage } from "@/features/product-comparison/components/product-comparison-page";

export default function ProductComparisonRoute() {
  return (
    <>
      <main className="flex-1 bg-background">
        <ProductComparisonPage />
      </main>
      <Footer />
    </>
  );
}
