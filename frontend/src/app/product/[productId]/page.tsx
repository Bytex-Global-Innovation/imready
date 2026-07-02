import { Navbar, Footer } from "@/components/layout";
import { ProductDetailsPage } from "@/features/product-details";

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <ProductDetailsPage productId={productId} />
      </main>
      <Footer />
    </>
  );
}
