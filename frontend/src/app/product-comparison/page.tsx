import { Navbar, Footer } from "@/components/layout";
import { ProductComparisonPage } from "@/features/product-comparison";

export default function ProductComparisonRoute() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <ProductComparisonPage />
      </main>
      <Footer />
    </>
  );
}
