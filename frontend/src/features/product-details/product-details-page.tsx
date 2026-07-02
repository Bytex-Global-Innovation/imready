"use client";

import { useMemo } from "react";
import {
  PRODUCT_DETAIL_COPY,
  getProductDetailsById,
} from "@/constants/product-detail";
import { ProductDetails } from "./components/product-details";
import { Specifications } from "./components/specifications";
import { cn } from "@/lib/utils";

interface ProductDetailsPageProps {
  productId: string;
}

export function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const productDetails = useMemo(() => getProductDetailsById(productId), [productId]);
  const selectedSubVariant = productDetails?.variants[0]?.subVariants[0] ?? null;

  if (!productDetails) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-hero-heading">Product not found</h1>
        <p className="mt-2 text-muted">The product you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <ProductDetails productDetails={productDetails} />

      <div className="container mx-auto hidden px-4 pb-4 pt-0 lg:block">
        <div className="border-t border-border pt-4">
          <p className={cn("text-2xl font-semibold", "text-foreground")}>
            {PRODUCT_DETAIL_COPY.detailsHeading}
          </p>
          <p className="mt-2 leading-relaxed text-muted">{productDetails.description}</p>
        </div>

        {productDetails.specs ? (
          <Specifications
            specifications={productDetails.specs}
            selectedSubVariant={selectedSubVariant}
          />
        ) : null}
      </div>
    </div>
  );
}
