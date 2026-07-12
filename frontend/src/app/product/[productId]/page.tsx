import { Footer } from "@/components/layout/footer";
import { ProductDetailsPage } from "@/features/product-details/product-details-page";

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

  return (
    <>
      <main className="flex-1 bg-white">
        <ProductDetailsPage productId={productId} />
      </main>
      <Footer />
    </>
  );
}
