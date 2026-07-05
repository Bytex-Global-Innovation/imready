import Image from "next/image";
import Link from "next/link";
import {
  BYTEX_DEVICES,
  PRODUCTS_INVENTORY,
  ROUTES,
  getProcessorLogoUrl,
} from "@/constants";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui";
import { getDisplayPrice, getFirstComment } from "@/lib/product-utils";

export function EligibleDevicesSection() {
  return (
    <section id="eligible-devices" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-hero-heading sm:text-[2rem] sm:leading-10 sm:tracking-[-0.01em]">
            {BYTEX_DEVICES.title}
          </h2>
          <p className="text-base leading-6 text-foreground/80">{BYTEX_DEVICES.subtitle}</p>
        </div>
        <Link
          href={BYTEX_DEVICES.viewAllLink.href}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-sm font-medium text-[#153a75] transition-colors hover:text-[#153a75]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#153a75] focus-visible:ring-offset-2"
        >
          {BYTEX_DEVICES.viewAllLink.label}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS_INVENTORY.map((product) => (
          <article
            key={product.id}
            className="relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-hero shadow-sm"
          >
            <div className="relative flex h-[199px] items-center justify-center border-b border-border bg-background px-4 py-4">
              <span className="absolute left-4 top-4 z-10 rounded-[var(--radius-badge)] bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                Eligible
              </span>
              <div className="relative h-full w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-contain object-center"
                  unoptimized
                />
                {product.processorcompany ? (
                  <div className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10">
                    <Image
                      src={getProcessorLogoUrl(product.processorcompany)}
                      alt={`${product.processorcompany} logo`}
                      width={40}
                      height={40}
                      className="h-full w-full object-contain drop-shadow-sm"
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-xl font-semibold leading-8 text-hero-heading sm:text-2xl">
                  {product.name}
                </h3>
                {product.tagLabel ? (
                  <span className="shrink-0 rounded bg-brand-100 px-1 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    {product.tagLabel}
                  </span>
                ) : null}
              </div>
              <p className="text-sm leading-5 text-foreground/80">
                {getFirstComment(product.comments)}
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3">
                <span className="font-display text-xl font-bold text-hero-heading">
                  {getDisplayPrice(product.price, product.specialPrice)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  href={ROUTES.product(product.id)}
                  className="text-[#153a75] hover:bg-surface-alt focus-visible:ring-[#153a75]"
                  aria-label={`View details for ${product.name}`}
                >
                  Details
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
