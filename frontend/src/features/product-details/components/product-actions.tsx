"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui";
import {
  BYTEX_PAGE_CTA_CLASSES,
  COMPARE_PRICING_CTA,
} from "@/constants";
import type { ProductSubVariant } from "@/constants/product-detail";
import { cn } from "@/lib/utils";

const classes = {
  notifyDisabled: "cursor-not-allowed border border-[#cfcfcf] bg-[#d6d9dd] text-white",
  notifyActive: "bg-orange-400 text-white hover:bg-orange-600 active:bg-[#c0463d]",
  outOfStockBanner: "mb-2 text-center text-[14px] font-semibold text-red-500",
  stickyBarInner: "mx-0 w-full max-w-none border-t border-gray-200 bg-white shadow-md",
} as const;

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

  const unlockCls = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-colors focus:outline-none",
    BYTEX_PAGE_CTA_CLASSES.primaryButton,
  );

  const notifyCls = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition duration-150 focus:outline-none",
    isNotifiedLocal ? classes.notifyDisabled : classes.notifyActive,
  );

  const handleUnlock = () => {
    onUnlock?.();
  };

  const handleNotifyMe = () => {
    if (isNotifiedLocal) return;
    setIsNotifiedLocal(true);
    onNotify?.("You will be notified when this product is back in stock.");
  };

  const unlockButton = (fullWidth = false, compact = false) => (
    <Button
      type="button"
      onClick={handleUnlock}
      className={cn(
        unlockCls,
        compact
          ? "h-10 w-full rounded-full px-4 text-sm font-semibold shadow-sm"
          : fullWidth
            ? "min-h-[52px] w-full rounded-none px-6 text-base font-semibold lg:rounded-full"
            : "h-11 w-full max-w-xs rounded-full px-6 shadow-sm",
      )}
      aria-label={`${COMPARE_PRICING_CTA.unlockButtonLabel} for ${selectedProduct.name ?? "product"}`}
    >
      <Lock className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} aria-hidden="true" />
      {COMPARE_PRICING_CTA.unlockButtonLabel}
    </Button>
  );

  const inlineMobileActions = (
    <div className="w-full">
      {productQty > 0 ? (
        <>
          {unlockButton(true, true)}
          <p className="mt-1 text-center text-xs text-muted">
            {COMPARE_PRICING_CTA.verificationHint}
          </p>
        </>
      ) : (
        <div>
          <p className={cn(classes.outOfStockBanner, "text-[13px]")}>Out of stock</p>
          <button
            onClick={handleNotifyMe}
            disabled={isNotifiedLocal}
            type="button"
            aria-pressed={isNotifiedLocal}
            className={cn(notifyCls, "h-10 w-full rounded-full px-4 text-sm font-semibold")}
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
          <p className={classes.outOfStockBanner}>
            Out of stock
          </p>
          <button
            onClick={handleNotifyMe}
            disabled={isNotifiedLocal}
            className={cn(notifyCls, "h-11 w-40 px-6")}
            type="button"
            aria-pressed={isNotifiedLocal}
          >
            Notify Me
          </button>
        </div>
      )}
    </div>
  );

  const mobileSticky = (
    <div className={cn(stickyOnly ? "w-full" : "fixed bottom-0 left-0 right-0 z-50 lg:hidden")}>
      <div className={classes.stickyBarInner}>
        {productQty === 0 ? (
          <div className="w-full px-0">
            <p className={cn(classes.outOfStockBanner, "pt-2")}>
              Out of stock
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
