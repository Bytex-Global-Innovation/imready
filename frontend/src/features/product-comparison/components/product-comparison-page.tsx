"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Cpu,
  Database,
  Gpu,
  HardDrive,
  Home,
  Lock,
  Maximize2,
  Truck,
} from "@/components/icons";
import { Button } from "@/components/ui";
import {
  BYTEX_PAGE_CTA_CLASSES,
  COMPARE_BREADCRUMBS,
  COMPARE_MOBILE_SCROLL_HINT,
  COMPARE_PRICING_CTA,
  COMPARE_SPEC_ROWS,
  KEY_SPEC_FIELDS,
  PRODUCTS_INVENTORY,
  getProcessorLogoUrl,
  type Product,
} from "@/constants";
import {
  getDisplayPrice,
  getSpecValue,
  splitCommentPoints,
} from "@/lib/product-utils";
import { cn } from "@/lib/utils";
import { ProductImagePreviewModal } from "./product-image-preview-modal";

const KEY_SPEC_ICONS = {
  processor: Cpu,
  memory: Database,
  storage: HardDrive,
  graphics: Gpu,
} as const;

interface CompareProductColumnProps {
  product: Product;
  commentPoints: string[];
  showDiffOnly: boolean;
  differingKeys: Set<string>;
  visibleRows: typeof COMPARE_SPEC_ROWS;
  onPreviewImage: (product: Product) => void;
}

function CompareProductColumn({
  product,
  commentPoints,
  showDiffOnly,
  differingKeys,
  visibleRows,
  onPreviewImage,
}: CompareProductColumnProps) {
  return (
    <div
      className={cn(
        "flex w-[min(88vw,360px)] shrink-0 snap-start flex-col border-r border-border",
        "text-center last:border-r-0",
        "lg:w-auto lg:shrink",
      )}
    >
      <div className="flex h-full flex-col px-5 pb-8 pt-4 sm:px-8 sm:pb-10 sm:pt-5 xl:px-10 xl:pb-12 xl:pt-6">
        {product.tagLabel ? (
          <div className="relative z-10 mb-2 flex justify-center px-1">
            <div className="inline-flex max-w-full items-center justify-center rounded-[var(--radius-badge)] bg-brand-100 px-4 py-1.5 text-center text-xs font-medium leading-snug text-brand-700 sm:px-5 sm:py-2">
              {product.tagLabel}
            </div>
          </div>
        ) : null}

        <div className="mb-4 flex w-full flex-col items-center">
          <div className="relative mx-auto aspect-[5/4] w-full max-h-[340px] min-h-[230px] max-w-[min(100%,340px)] sm:aspect-[16/10] sm:max-w-[min(100%,380px)]">
            <button
              type="button"
              className="relative h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              onClick={() => onPreviewImage(product)}
              aria-label={`Preview ${product.name} image`}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 88vw, 33vw"
                className="object-contain object-center p-2 sm:p-4"
                unoptimized
              />
            </button>
            <button
              type="button"
              onClick={() => onPreviewImage(product)}
              className="absolute right-2 top-2 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--radius-button)] border border-border bg-background text-brand-700 shadow-sm transition-all hover:scale-105 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              aria-label="Preview image fullscreen"
            >
              <Maximize2 className="h-5 w-5 text-muted" aria-hidden="true" />
            </button>
            {product.processorcompany ? (
              <div className="absolute bottom-2 right-2 z-10 flex h-10 w-10 items-center justify-center sm:bottom-3 sm:right-3 sm:h-11 sm:w-11">
                <Image
                  src={getProcessorLogoUrl(product.processorcompany)}
                  alt={`${product.processorcompany} logo`}
                  width={44}
                  height={44}
                  className="h-full w-full object-contain drop-shadow-sm"
                  unoptimized
                />
              </div>
            ) : null}
          </div>
        </div>

        <h3 className="mx-auto mb-2 max-w-[95%] text-center text-base font-bold leading-snug text-foreground sm:text-lg lg:text-xl">
          {product.name}
        </h3>

        <div className="mb-5 flex w-full max-w-lg flex-col items-center self-center px-0.5 sm:max-w-xl">
          <div className="flex w-full flex-col gap-y-1">
            {KEY_SPEC_FIELDS.map(({ key, field }) => {
              const Icon = KEY_SPEC_ICONS[key];
              const hi = showDiffOnly && differingKeys.has(field);
              return (
                <div
                  key={key}
                  className="flex min-h-[20px] w-full items-center justify-center gap-1.5 text-xs text-foreground/80 sm:min-h-[22px] sm:text-sm"
                >
                  <span
                    className={cn(
                      "inline-flex max-w-full items-center gap-1.5",
                      hi && "rounded-sm bg-brand-50 px-1 py-px",
                    )}
                    title={product[field]}
                  >
                    <Icon
                      className="h-[18px] w-[18px] shrink-0 text-brand-700 sm:h-5 sm:w-5"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="truncate">{product[field]}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6 flex w-full max-w-sm flex-1 flex-col items-center self-center px-1">
          <ul className="w-full space-y-4">
            {commentPoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-left text-sm leading-relaxed text-foreground"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                  <Check className="h-3 w-3 text-background" strokeWidth={3} aria-hidden="true" />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-auto w-full max-w-md pt-2">
          <div className="flex flex-col items-center gap-1">
            <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {getDisplayPrice(product.price, product.specialPrice)}
              <span className="ml-1 text-sm font-semibold text-muted sm:text-base">
                + GST
              </span>
            </p>
            <p className="text-xs font-medium text-muted">
              {COMPARE_PRICING_CTA.firstCutLabel}
            </p>
            <Button
              className={cn(
                "mt-3 w-full max-w-xs cursor-pointer rounded-full px-6",
                BYTEX_PAGE_CTA_CLASSES.primaryButton,
              )}
              aria-label={`${COMPARE_PRICING_CTA.unlockButtonLabel} for ${product.name}`}
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              {COMPARE_PRICING_CTA.unlockButtonLabel}
            </Button>
            <p className="mt-2 text-center text-xs text-muted">
              {COMPARE_PRICING_CTA.verificationHint}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-700">
            <Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Estimated delivery in 5–7 days</span>
          </div>
        </div>
      </div>

      {visibleRows.map((row) => (
        <div
          key={row.key}
          className={cn(
            "border-t border-border px-4 py-7 text-center sm:px-6 sm:py-9",
          )}
        >
          <div className="break-words text-sm font-bold leading-snug tracking-tight text-foreground sm:text-base">
            {getSpecValue(product[row.key])}
          </div>
          <div className="mt-3 text-xs font-normal uppercase tracking-widest text-muted">
            {row.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductComparisonPage() {
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const products = PRODUCTS_INVENTORY;

  const differingKeys = useMemo(() => {
    const diffs = new Set<string>();
    for (const row of COMPARE_SPEC_ROWS) {
      const values = new Set(
        products.map((p) => getSpecValue(p[row.key]).replace(/\s+/g, " ").trim()),
      );
      if (values.size > 1) diffs.add(row.key);
    }
    return diffs;
  }, [products]);

  const visibleRows = showDiffOnly
    ? COMPARE_SPEC_ROWS.filter((row) => differingKeys.has(row.key))
    : COMPARE_SPEC_ROWS;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <nav
        aria-label="Breadcrumb"
        className="flex w-full flex-wrap items-center gap-x-1.5 gap-y-1 border-b border-border bg-surface px-3 py-2.5 text-sm font-medium leading-snug sm:px-4"
      >
        {COMPARE_BREADCRUMBS.map((item, idx) => (
          <Fragment key={item.key}>
            {idx > 0 ? (
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-muted"
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : null}
            {!item.href || item.isCurrent ? (
              <span
                className={cn(
                  item.isCurrent
                    ? "font-semibold text-hero-heading"
                    : "inline-flex items-center gap-1.5 text-foreground/80",
                )}
              >
                {item.showHomeIcon ? (
                  <>
                    <Home className="h-3.5 w-3.5 shrink-0" strokeWidth={1.85} aria-hidden="true" />
                    <span>{item.label}</span>
                  </>
                ) : (
                  item.label
                )}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "cursor-pointer",
                  item.showHomeIcon
                    ? "inline-flex items-center gap-1.5 text-foreground/80 transition-colors hover:text-hero-heading"
                    : "text-foreground/80 transition-colors hover:text-hero-heading",
                )}
              >
                {item.showHomeIcon ? (
                  <>
                    <Home className="h-3.5 w-3.5 shrink-0" strokeWidth={1.85} aria-hidden="true" />
                    <span>{item.label}</span>
                  </>
                ) : (
                  item.label
                )}
              </Link>
            )}
          </Fragment>
        ))}
      </nav>

      <div className="flex w-full items-center justify-between gap-3 px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            className="cursor-pointer rounded border-border text-brand-700 focus-visible:ring-brand-600"
            checked={showDiffOnly}
            onChange={(e) => setShowDiffOnly(e.target.checked)}
          />
          <span>Help Me Compare</span>
        </label>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:hidden",
            BYTEX_PAGE_CTA_CLASSES.outlineButton,
          )}
          onClick={() => {
            scrollContainerRef.current?.scrollBy({ left: 280, behavior: "smooth" });
          }}
          aria-label={COMPARE_MOBILE_SCROLL_HINT}
        >
          <span>{COMPARE_MOBILE_SCROLL_HINT}</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        className={cn(
          "border-t border-border bg-background",
          "overflow-x-auto overscroll-x-contain scroll-smooth",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          "snap-x snap-mandatory",
          "lg:overflow-x-visible lg:snap-none",
        )}
        aria-label="Product comparison columns"
      >
        <div className="flex w-max lg:grid lg:w-full lg:grid-cols-3">
          {products.map((product) => {
            const commentPoints = splitCommentPoints(product.comments);

            return (
              <CompareProductColumn
                key={product.id}
                product={product}
                commentPoints={commentPoints}
                showDiffOnly={showDiffOnly}
                differingKeys={differingKeys}
                visibleRows={visibleRows}
                onPreviewImage={setPreviewProduct}
              />
            );
          })}
        </div>
      </div>

      <ProductImagePreviewModal
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />
    </div>
  );
}
