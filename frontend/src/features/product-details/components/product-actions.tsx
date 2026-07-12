"use client";

import { useEffect, useState } from "react";
import { Lock, Tag } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { COMPARE_PRICING_CTA } from "@/constants/product-comparison";
import type { ProductSubVariant } from "@/constants/product-detail";
import { cn } from "@/lib/utils";

interface ProductActionsProps {
  selectedProduct: ProductSubVariant & { name?: string };
  stickyOnly?: boolean;
  inlineOnly?: boolean;
  onUnlock?: () => void;
  onNotify?: (message: string) => void;
}

export function ProductActions({
  selectedProduct,
  stickyOnly = false,
  inlineOnly = false,
  onUnlock,
  onNotify,
}: ProductActionsProps) {
  const [isNotifiedLocal, setIsNotifiedLocal] = useState(!!selectedProduct?.isNotified);

  useEffect(() => {
    setIsNotifiedLocal(!!selectedProduct?.isNotified);
  }, [selectedProduct?.isNotified]);

  const productQty =
    selectedProduct?.inventory?.qty && selectedProduct.inventory.qty > 0
      ? selectedProduct.inventory.qty
      : 0;

  const handleUnlock = () => {
    onUnlock?.();
  };

  const handleNotifyMe = () => {
    if (isNotifiedLocal) return;
    setIsNotifiedLocal(true);
    onNotify?.("You will be notified when this product is back in stock.");
  };

  const unlockButton = (fullWidth = false) => (
    <Button
      type="button"
      onClick={handleUnlock}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 bg-[#153a75] font-medium text-white transition-colors hover:bg-[#153a75]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153a75] focus-visible:ring-offset-2",
        fullWidth
          ? "min-h-[52px] w-full rounded-none px-6 text-base font-semibold lg:rounded-full"
          : "h-11 w-full max-w-xs rounded-full px-6 shadow-sm",
      )}
      aria-label={`${COMPARE_PRICING_CTA.unlockButtonLabel} for ${selectedProduct.name ?? "product"}`}
    >
      <Lock className="h-4 w-4" aria-hidden="true" />
      {COMPARE_PRICING_CTA.unlockButtonLabel}
    </Button>
  );

  const inlineMobileActions = (
    <div className="w-full">
      {productQty > 0 ? (
        <>
          <Button
            type="button"
            onClick={handleUnlock}
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#153a75] px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#153a75]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153a75] focus-visible:ring-offset-2"
            aria-label={`${COMPARE_PRICING_CTA.unlockButtonLabel} for ${selectedProduct.name ?? "product"}`}
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            {COMPARE_PRICING_CTA.unlockButtonLabel}
          </Button>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              Get up to <span className="font-bold text-[#153a75]">20%</span> off with
              verification
            </span>
          </p>
        </>
      ) : (
        <div>
          <p className="mb-2 text-center text-sm font-semibold text-red-500">Out of stock</p>
          <button
            onClick={handleNotifyMe}
            disabled={isNotifiedLocal}
            type="button"
            aria-pressed={isNotifiedLocal}
            aria-label="Notify me when back in stock"
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              isNotifiedLocal
                ? "cursor-not-allowed border border-border bg-gray-300 text-white"
                : "bg-orange-400 text-white hover:bg-orange-600 active:bg-orange-700",
              "h-12 w-full rounded-xl px-6 text-base font-semibold",
            )}
          >
            Notify Me
          </button>
        </div>
      )}
    </div>
  );

  if (inlineOnly) return inlineMobileActions;

  const desktopActions = (
    <div className="hidden flex-col items-start gap-2 lg:flex">
      {productQty > 0 ? (
        <>
          {unlockButton()}
          <p className="text-xs text-muted">{COMPARE_PRICING_CTA.verificationHint}</p>
        </>
      ) : (
        <div>
          <p className="mb-2 text-center text-sm font-semibold text-red-500">Out of stock</p>
          <button
            onClick={handleNotifyMe}
            disabled={isNotifiedLocal}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              isNotifiedLocal
                ? "cursor-not-allowed border border-border bg-gray-300 text-white"
                : "bg-orange-400 text-white hover:bg-orange-600 active:bg-orange-700",
              "h-11 w-40 px-6",
            )}
            type="button"
            aria-pressed={isNotifiedLocal}
            aria-label="Notify me when back in stock"
          >
            Notify Me
          </button>
        </div>
      )}
    </div>
  );

  const mobileSticky = (
    <div className={cn(stickyOnly ? "w-full" : "fixed bottom-0 left-0 right-0 z-50 lg:hidden")}>
      <div className="mx-0 w-full max-w-none border-t border-border bg-white shadow-md">
        {productQty === 0 ? (
          <div className="w-full px-0">
            <p className="mb-2 pt-2 text-center text-sm font-semibold text-red-500">Out of stock</p>
            <button
              onClick={handleNotifyMe}
              disabled={isNotifiedLocal}
              type="button"
              aria-pressed={isNotifiedLocal}
              aria-label="Notify me when back in stock"
              className={cn(
                "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                isNotifiedLocal
                  ? "cursor-not-allowed border border-border bg-gray-300 text-white"
                  : "bg-orange-400 text-white hover:bg-orange-600 active:bg-orange-700",
                "min-h-[52px] w-full rounded-none border-none text-lg font-semibold shadow-none outline-none",
              )}
            >
              Notify Me
            </button>
          </div>
        ) : (
          <div className="w-full">{unlockButton(true)}</div>
        )}
      </div>
    </div>
  );

  if (stickyOnly) return mobileSticky;
  return (
    <>
      {desktopActions}
      {mobileSticky}
    </>
  );
}
