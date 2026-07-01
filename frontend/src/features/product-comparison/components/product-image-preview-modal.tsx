"use client";

import { useEffect } from "react";
import { X } from "@/components/icons";
import type { Product } from "@/constants";

interface ProductImagePreviewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductImagePreviewModal({
  product,
  onClose,
}: ProductImagePreviewModalProps) {
  useEffect(() => {
    if (!product) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-foreground/60 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[1] flex w-full max-w-[850px] flex-col rounded-[var(--radius-card)] border border-border bg-background p-6 shadow-lg sm:p-8"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            Product Image Preview
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
        <div className="relative mt-6 flex min-h-[300px] flex-1 items-center justify-center sm:min-h-[450px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="max-h-[300px] w-auto max-w-full object-contain sm:max-h-[450px]"
          />
        </div>
      </div>
    </div>
  );
}
