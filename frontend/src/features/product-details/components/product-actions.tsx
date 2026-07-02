"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui";
import {
  BYTEX_PAGE_CTA_CLASSES,
  COMPARE_PRICING_CTA,
  PRODUCT_DETAIL_CLASSES,
  PRODUCT_DETAIL_COPY,
} from "@/constants";
import type { ProductSubVariant } from "@/constants/product-detail";
import { cn } from "@/lib/utils";

interface ProductActionsProps {
  selectedProduct: ProductSubVariant & { name?: string };
  stickyOnly?: boolean;
  onUnlock?: () => void;
  onNotify?: (message: string) => void;
}

export function ProductActions({
  selectedProduct,
  stickyOnly = false,
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

  const unlockCls = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-colors focus:outline-none",
    BYTEX_PAGE_CTA_CLASSES.primaryButton,
  );

  const notifyCls = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition duration-150 focus:outline-none",
    isNotifiedLocal ? PRODUCT_DETAIL_CLASSES.notifyDisabled : PRODUCT_DETAIL_CLASSES.notifyActive,
  );

  const handleUnlock = () => {
    onUnlock?.();
  };

  const handleNotifyMe = () => {
    if (isNotifiedLocal) return;
    setIsNotifiedLocal(true);
    onNotify?.(PRODUCT_DETAIL_COPY.notifySuccessMessage);
  };

  const unlockButton = (fullWidth = false) => (
    <Button
      type="button"
      onClick={handleUnlock}
      className={cn(
        unlockCls,
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

  const desktopActions = (
    <div className="hidden flex-col items-start gap-2 lg:flex">
      {productQty > 0 ? (
        <>
          {unlockButton()}
          <p className="text-xs text-muted">{COMPARE_PRICING_CTA.verificationHint}</p>
        </>
      ) : (
        <div>
          <p className={PRODUCT_DETAIL_CLASSES.outOfStockBanner}>
            {PRODUCT_DETAIL_COPY.outOfStockLower}
          </p>
          <button
            onClick={handleNotifyMe}
            disabled={isNotifiedLocal}
            className={cn(notifyCls, "h-11 w-40 px-6")}
            type="button"
            aria-pressed={isNotifiedLocal}
          >
            {PRODUCT_DETAIL_COPY.notifyMe}
          </button>
        </div>
      )}
    </div>
  );

  const mobileSticky = (
    <div className={cn(stickyOnly ? "w-full" : "fixed bottom-0 left-0 right-0 z-50 lg:hidden")}>
      <div className={PRODUCT_DETAIL_CLASSES.stickyBarInner}>
        {productQty === 0 ? (
          <div className="w-full px-0">
            <p className={cn(PRODUCT_DETAIL_CLASSES.outOfStockBanner, "pt-2")}>
              {PRODUCT_DETAIL_COPY.outOfStockLower}
            </p>
            <button
              onClick={handleNotifyMe}
              disabled={isNotifiedLocal}
              type="button"
              aria-pressed={isNotifiedLocal}
              className={cn(
                notifyCls,
                "min-h-[52px] w-full rounded-none border-none text-lg font-semibold shadow-none outline-none",
              )}
            >
              {PRODUCT_DETAIL_COPY.notifyMe}
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
