"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  X,
} from "@/components/icons";
import { COMPARE_PRICING_CTA } from "@/constants/product-comparison";
import { ROUTES } from "@/constants/routes";
import type {
  ProductDetailsData,
  ProductSubVariant,
  ProductVariant,
} from "@/constants/product-detail";
import {
  ACCESSORY_CATEGORY_ID,
  PRODUCT_DETAIL_MOBILE_BREAKPOINT,
  toAbsoluteProductImageUrl,
} from "@/constants/product-detail";
import { useMobileView } from "@/hooks/use-mobile-view";
import { useMagnifierDisabled } from "@/hooks/use-magnifier-disabled";
import {
  buildQuickSpecPills,
  buildQuickSpecsList,
  formatNumberWithCommas,
  getIconForPill,
  getSubVariantDisplayPrice,
} from "@/lib/product-detail-utils";
import { cn } from "@/lib/utils";
import { ImageList } from "@/features/product-details/components/image-list";
import { ProductActions } from "@/features/product-details/components/product-actions";
import { ProductImage } from "@/features/product-details/components/product-image";
import { ProductDetailsSkeleton } from "@/features/product-details/components/product-details-skeleton";
import { ProductDetailsSkeletonMobile } from "@/features/product-details/components/product-details-skeleton-mobile";
import { Specifications } from "@/features/product-details/components/specifications";
import {
  buildServices,
  getServiceOverlayStyle,
  type ServiceOverlayStyle,
} from "@/features/product-details/components/services-data";
import { ShareProductModal } from "@/features/product-details/components/share-product-modal";
import { StarRatingDisplay } from "@/features/product-details/components/star-rating-display";

interface ProductDetailsProps {
  productDetails: ProductDetailsData | null;
  onAction?: (action: "unlock" | "notify", message: string) => void;
}

function ServiceOverlayPortal({
  overlayStyle,
  overlayDomRef,
  arrowRef,
  showBelow,
  children,
}: {
  overlayStyle: ServiceOverlayStyle;
  overlayDomRef: React.RefObject<HTMLDivElement | null>;
  arrowRef: React.RefObject<HTMLDivElement | null>;
  showBelow: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const el = overlayDomRef.current;
    if (!el) return;
    el.style.left = `${overlayStyle.left}px`;
    el.style.top = `${overlayStyle.top}px`;
    el.style.width = `${overlayStyle.width}px`;
    el.style.zIndex = String(overlayStyle.zIndex);
  }, [overlayDomRef, overlayStyle]);

  useEffect(() => {
    const el = arrowRef.current;
    if (!el) return;
    el.style.left = `${overlayStyle.arrowLeft}px`;
  }, [arrowRef, overlayStyle.arrowLeft]);

  return (
    <div ref={overlayDomRef} className="pointer-events-auto absolute">
      {showBelow ? (
        <div
          ref={arrowRef}
          className="absolute top-[-8px] h-0 w-0 border-x-8 border-x-transparent border-b-8 border-b-white drop-shadow-sm"
        />
      ) : (
        <div
          ref={arrowRef}
          className="absolute -bottom-2 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-white drop-shadow-sm"
        />
      )}
      {children}
    </div>
  );
}

function QuantityStepper({
  quantity,
  maxQuantity,
  onChange,
}: {
  quantity: number;
  maxQuantity: number;
  onChange: (type: "decrease" | "increase") => void;
}) {
  const disabled = maxQuantity === 0;

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={disabled}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-border bg-white text-xl font-bold text-foreground transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onChange("decrease")}
        aria-label="Decrease quantity"
        type="button"
      >
        −
      </button>
      <span className="w-6 text-center text-lg font-medium text-foreground">{quantity}</span>
      <button
        disabled={disabled}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-border bg-white text-xl font-bold text-foreground transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onChange("increase")}
        aria-label="Increase quantity"
        type="button"
      >
        +
      </button>
      {disabled ? <span className="ml-2 text-xs text-red-500">Out of Stock</span> : null}
    </div>
  );
}

export function ProductDetails({ productDetails, onAction }: ProductDetailsProps) {
  const searchParams = useSearchParams();
  const selectedSubVId = searchParams.get("id");
  const { isMobileView, mounted } = useMobileView();
  const magnifierDisabled = useMagnifierDisabled();

  const [selectedSubVariants, setSelectedSubVariants] = useState<ProductSubVariant>(
    {} as ProductSubVariant,
  );
  const [, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [productImagesByVariant, setProductImagesByVariant] = useState<string[]>([]);
  const [carouselStartIdx, setCarouselStartIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<ServiceOverlayStyle | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const lastClickedServiceEl = useRef<HTMLElement | null>(null);
  const overlayDomRef = useRef<HTMLDivElement>(null);
  const overlayArrowRef = useRef<HTMLDivElement>(null);
  const openedOnMobileRef = useRef(false);
  const openedOnDesktopRef = useRef(false);

  const [canScrollLeftServices, setCanScrollLeftServices] = useState(false);
  const [canScrollRightServices, setCanScrollRightServices] = useState(false);

  const categoryId = productDetails?.categoryId ?? null;
  const isAccessoryCategory = categoryId === ACCESSORY_CATEGORY_ID;
  const qs = productDetails?.specs ?? {};
  const services = useMemo(() => buildServices(qs), [qs]);

  const quickSpecPills = useMemo(
    () => buildQuickSpecPills(qs, selectedSubVariants),
    [qs, selectedSubVariants],
  );
  const quickSpecsList = useMemo(
    () => buildQuickSpecsList(qs, selectedSubVariants),
    [qs, selectedSubVariants],
  );

  const displayPrice = getSubVariantDisplayPrice(selectedSubVariants);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !productDetails) return "";
    const url = new URL(ROUTES.product(productDetails.id), window.location.origin);
    if (selectedSubVId) url.searchParams.set("id", selectedSubVId);
    return url.toString();
  }, [productDetails, selectedSubVId]);
  const ActiveServiceIcon =
    activeServiceIndex !== null ? services[activeServiceIndex]?.icon : null;

  useEffect(() => {
    if (!productDetails?.variants?.length) return;

    if (selectedSubVId) {
      const variantWithSub = productDetails.variants.find((v) =>
        v.subVariants.some((sv) => sv.id === selectedSubVId),
      );
      if (variantWithSub) {
        const sv = variantWithSub.subVariants.find((s) => s.id === selectedSubVId);
        if (sv) {
          setSelectedVariant(variantWithSub);
          setSelectedSubVariants(sv);
          const urls = variantWithSub.images.map((i) => toAbsoluteProductImageUrl(i.url));
          setProductImagesByVariant(urls);
          setSelectedImage(urls[0]);
          return;
        }
      }
    }

    const v = productDetails.variants[0];
    const sv = v.subVariants[0];
    if (v && sv) {
      setSelectedVariant(v);
      setSelectedSubVariants(sv);
      const urls = v.images.map((i) => toAbsoluteProductImageUrl(i.url));
      setProductImagesByVariant(urls);
      setSelectedImage(urls[0]);
    }
  }, [productDetails, selectedSubVId]);

  useEffect(() => {
    setIsFavourite(Boolean(productDetails?.favourite || selectedSubVariants?.favourite));
  }, [productDetails, selectedSubVariants]);

  useEffect(() => {
    const el = servicesRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeftServices(el.scrollLeft > 5);
      setCanScrollRightServices(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [productImagesByVariant.length]);

  const closeServiceModal = useCallback(() => {
    setActiveServiceIndex(null);
    setOverlayStyle(null);
    lastClickedServiceEl.current = null;
    openedOnMobileRef.current = false;
    openedOnDesktopRef.current = false;
  }, []);

  useEffect(() => {
    if (activeServiceIndex === null || !lastClickedServiceEl.current) return;
    let rafId = 0;
    const recompute = () => {
      const el = lastClickedServiceEl.current;
      if (!el) return;
      setOverlayStyle(getServiceOverlayStyle(el.getBoundingClientRect()));
    };
    const onScrollOrResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(recompute);
    };
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    recompute();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [activeServiceIndex]);

  useEffect(() => {
    if (!overlayDomRef.current || !overlayStyle || !lastClickedServiceEl.current) return;
    if (overlayStyle.showBelow) return;
    const rect = lastClickedServiceEl.current.getBoundingClientRect();
    const pageScrollY = window.scrollY || window.pageYOffset || 0;
    const measuredHeight = overlayDomRef.current.clientHeight || 0;
    const desiredTop = Math.round(pageScrollY + rect.top - measuredHeight - 12);
    if (Math.abs(desiredTop - overlayStyle.top) > 1) {
      setOverlayStyle((s) => (s ? { ...s, top: desiredTop } : s));
    }
  }, [overlayStyle, activeServiceIndex]);

  const handleServiceClick = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (activeServiceIndex === index) {
      closeServiceModal();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const isDesktop = window.innerWidth >= PRODUCT_DETAIL_MOBILE_BREAKPOINT;
    openedOnMobileRef.current = !isDesktop;
    openedOnDesktopRef.current = isDesktop;
    lastClickedServiceEl.current = e.currentTarget;
    setOverlayStyle(getServiceOverlayStyle(rect));
    setActiveServiceIndex(index);
  };

  const scrollServices = (dir: "prev" | "next") => {
    const el = servicesRef.current;
    if (!el) return;
    const offset = dir === "next" ? el.clientWidth * 0.8 : -el.clientWidth * 0.8;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleQuantityChange = (type: "decrease" | "increase") => {
    const maxQuantity = selectedSubVariants?.inventory?.qty || 0;
    if (type === "decrease" && quantity > 1) setQuantity(quantity - 1);
    else if (type === "increase" && quantity < maxQuantity) setQuantity(quantity + 1);
  };

  const scrollToIndex = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollTo({ left: index * width, behavior: "smooth" });
    setCarouselStartIdx(index);
    const img = productImagesByVariant[index];
    if (img) setSelectedImage(img);
  };

  let scrollRaf = 0;
  const onCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    cancelAnimationFrame(scrollRaf);
    const el = e.currentTarget;
    scrollRaf = requestAnimationFrame(() => {
      const width = el.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / width);
      if (idx !== carouselStartIdx) {
        setCarouselStartIdx(idx);
        const img = productImagesByVariant[idx];
        if (img) setSelectedImage(img);
      }
    });
  };

  const handleUnlock = () => {
    const message = COMPARE_PRICING_CTA.verificationHint;
    setToastMessage(message);
    onAction?.("unlock", message);
  };

  const handleNotify = (message: string) => {
    setToastMessage(message);
    onAction?.("notify", message);
  };

  const isDataReady =
    !!productDetails && Object.keys(selectedSubVariants || {}).length > 0;

  if (!isDataReady) {
    if (!mounted) return <ProductDetailsSkeleton />;
    return isMobileView ? <ProductDetailsSkeletonMobile /> : <ProductDetailsSkeleton />;
  }

  const priceBlockDesktop = (
    <div className="mb-2 mt-3">
      <p className="text-3xl font-bold tracking-tight text-foreground">
        ₹{formatNumberWithCommas(displayPrice)}
        <span className="ml-1 text-base font-semibold text-muted">+ GST</span>
      </p>
    </div>
  );

  const servicesRow = (mobile = false) => (
    <div className={mobile ? "relative" : ""}>
      {mobile ? (
        <button
          type="button"
          onClick={() => scrollServices("prev")}
          aria-label="Previous services"
          disabled={!canScrollLeftServices}
          className="absolute -ml-4 left-0 top-1/2 z-20 -translate-y-1/2 cursor-pointer p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      ) : null}
      <div
        ref={mobile ? servicesRef : undefined}
        className={cn(
          mobile
            ? "mobile-services-scroll flex snap-x snap-mandatory gap-0 overflow-x-auto py-1 pl-12 pr-2"
            : "flex flex-nowrap space-x-2 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        role={mobile ? "list" : undefined}
        aria-label={mobile ? "Product services" : undefined}
      >
        {services.map((service, index) => {
          const Icon = service.icon;
          const expanded = activeServiceIndex === index;
          return (
            <button
              key={service.name}
              type="button"
              onClick={(e) => handleServiceClick(e, index)}
              aria-label={`Product services: ${service.name}`}
              title={service.name}
              role={mobile ? "listitem" : undefined}
              aria-expanded={mobile ? expanded : undefined}
              className={cn(
                "flex shrink-0 cursor-pointer flex-col items-center justify-start text-center transition duration-300",
                mobile ? "w-28 min-w-[110px] snap-start rounded-lg p-2.5" : "w-20 min-w-[80px] p-2",
                mobile && expanded && "lg:ring-2 lg:ring-[#153a75]/60",
              )}
            >
              <div
                className={cn(
                  "mb-1 flex items-center justify-center rounded-full border",
                  mobile ? "h-7 w-7" : "h-10 w-10",
                  expanded && mobile
                    ? "border-[#153a75] lg:bg-[#153a75]/60"
                    : "border-[#153a75]/50 hover:border-[#153a75]",
                )}
              >
                <Icon
                  className={cn(
                    "text-[#153a75]",
                    mobile ? "h-3 w-3" : "h-5 w-5",
                  )}
                />
              </div>
              <div
                className={cn(
                  "max-w-[75px] text-center font-semibold leading-snug text-[#153a75]",
                  mobile ? "min-h-0 text-xs leading-tight" : "min-h-7 text-[10px]",
                )}
              >
                {service.nameParts ? (
                  <div className="flex flex-col items-center gap-0">
                    {service.nameParts.map((part, i) => (
                      <span key={i} className={mobile ? "text-[11px]" : "text-[10px]"}>
                        {part}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span>{service.name}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {mobile ? (
        <button
          type="button"
          onClick={() => scrollServices("next")}
          aria-label="Next services"
          disabled={!canScrollRightServices}
          className="absolute -mr-4 right-0 top-1/2 z-20 -translate-y-1/2 cursor-pointer p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
        >
          <ChevronRight className="ml-6 h-5 w-5 text-foreground" />
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      {toastMessage ? (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg lg:bottom-6">
          {toastMessage}
        </div>
      ) : null}

      {/* Desktop */}
      <div className="mx-auto hidden max-w-[1700px] bg-gray-50 px-2 md:px-0 lg:block">
        <div className="flex flex-col gap-8 overflow-visible border border-border bg-white p-4 lg:flex-row lg:items-start">
          <div className="relative flex min-w-[340px] flex-col border-r border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 md:min-w-[390px] lg:min-w-[420px]">
            <div className="absolute right-4 top-4 z-10 me-3 mt-3 flex items-center gap-2">
              <button
                className="cursor-pointer rounded-full bg-white p-2 backdrop-blur-md transition-all duration-200 ease-in-out hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={() => setIsShareModalOpen(true)}
                aria-label="Share"
                type="button"
              >
                <Share2 className="h-5 w-5 text-gray-400" />
              </button>
              <button
                className="mb-1 flex cursor-pointer items-center justify-center rounded-full bg-white p-2 backdrop-blur-md transition-all hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={() => setIsFavourite((f) => !f)}
                aria-label="Add to favourites"
                type="button"
              >
                <Heart
                  className={cn(
                    "h-7 w-7",
                    isFavourite ? "fill-red-500 text-red-500" : "text-gray-400",
                  )}
                />
              </button>
            </div>

            <div className="flex gap-4">
              <ImageList
                images={productImagesByVariant}
                selectedImage={selectedImage}
                onSelect={(img, idx) => {
                  setSelectedImage(img);
                  scrollToIndex(idx);
                }}
              />
              <div className="relative rounded-lg border border-border bg-white/70 p-3 shadow-sm">
                <ProductImage image={selectedImage} disableMagnifier={magnifierDisabled} />
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col py-8 pl-6 pr-2 lg:self-start">
            <div>
              <p className="mb-2 text-2xl font-semibold capitalize text-foreground lg:text-3xl">
                {productDetails.name}
              </p>
              <div className="mb-4 flex flex-wrap gap-4">
                {isAccessoryCategory ? (
                  <p className="w-full text-sm font-semibold text-gray-700">
                    {productDetails.description || productDetails.shortDescription}
                  </p>
                ) : (
                  quickSpecPills.map((pill, idx) => {
                    const Icon = getIconForPill(pill);
                    return (
                      <span
                        key={`${pill}-${idx}`}
                        className="inline-flex items-center gap-3 rounded-lg border border-border bg-gray-50 px-4 py-2 text-sm text-foreground shadow-sm transition-all duration-200"
                      >
                        {Icon ? (
                          <Icon className="h-5 w-5 text-[#153a75]" />
                        ) : null}
                        <span>{pill}</span>
                      </span>
                    );
                  })
                )}
              </div>
              <StarRatingDisplay
                value={productDetails.rating}
                count={productDetails.noOfRating}
                size={20}
              />
              {priceBlockDesktop}
              <div className="mb-4">
                <div className="mb-6">
                  <h3 className="mb-1 text-base font-medium text-foreground">Quantity</h3>
                  <QuantityStepper
                    quantity={quantity}
                    maxQuantity={selectedSubVariants.inventory?.qty ?? 0}
                    onChange={handleQuantityChange}
                  />
                </div>
                <ProductActions
                  selectedProduct={{
                    ...selectedSubVariants,
                    name: productDetails.name,
                  }}
                  onUnlock={handleUnlock}
                  onNotify={handleNotify}
                />
                <div className="mt-6">{servicesRow(false)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet */}
      <div className="mt-4 block w-full bg-white pb-4 md:pb-28 lg:hidden">
        <div className="relative h-64 w-full bg-white">
          <div className="absolute right-3 top-3 z-20 flex flex-col items-center gap-2">
            <button
              className="flex cursor-pointer items-center justify-center rounded-full p-2 shadow-sm backdrop-blur-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={() => setIsFavourite((f) => !f)}
              type="button"
              aria-label="Add to favourites"
            >
              <Heart
                className={cn(
                  "h-7 w-7",
                  isFavourite ? "fill-red-500 text-red-500" : "text-gray-400",
                )}
              />
            </button>
            <button
              className="cursor-pointer rounded-full bg-white p-2 shadow-sm backdrop-blur-md transition-all ease-in-out hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={() => setIsShareModalOpen(true)}
              type="button"
              aria-label="Share product"
            >
              <Share2 className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div
            ref={trackRef}
            onScroll={onCarouselScroll}
            className="scrollbar-hide h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex h-full">
              {productImagesByVariant.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  type="button"
                  aria-label={`Open image ${idx + 1}`}
                  className="h-full w-full shrink-0 snap-start"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={toAbsoluteProductImageUrl(img)}
                    alt={`product-${idx + 1}`}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 gap-4">
            {productImagesByVariant.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                type="button"
                className={cn(
                  "h-2 w-2 cursor-pointer rounded-full",
                  carouselStartIdx === i ? "bg-gray-800" : "bg-gray-300",
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 px-4 pt-3">
          <h1 className="text-2xl font-normal leading-tight text-foreground">{productDetails.name}</h1>
        </div>

        <div className="gap-2 px-4">
          <p className="break-words text-sm font-normal leading-5 text-gray-800">
            {isAccessoryCategory
              ? productDetails.description || productDetails.shortDescription
              : quickSpecsList.length > 0
                ? quickSpecsList
                    .map((s) => String(s).replace(/^[*•\-\s]+/, "").trim())
                    .map((s, i) => (i === 0 ? s : "\u00A0/\u00A0" + s))
                    .join("")
                : "Specifications unavailable"}
          </p>
        </div>

        <div className="ml-3 mt-2">
          <StarRatingDisplay
            value={productDetails.rating}
            count={productDetails.noOfRating}
            size={20}
          />
        </div>

        <div className="mt-2 px-4 pt-2">
          <div className="flex flex-col gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[28px] font-bold tracking-tight text-foreground">
                ₹ {formatNumberWithCommas(displayPrice)}
                <span className="ml-1 text-sm font-semibold text-muted">+ GST</span>
              </div>
              <div className="mt-2 md:hidden">
                <ProductActions
                  inlineOnly
                  selectedProduct={{
                    ...selectedSubVariants,
                    name: productDetails.name,
                  }}
                  onUnlock={handleUnlock}
                  onNotify={handleNotify}
                />
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <h2 className="text-foreground">Quantity</h2>
              <QuantityStepper
                quantity={quantity}
                maxQuantity={selectedSubVariants.inventory?.qty ?? 0}
                onChange={handleQuantityChange}
              />
            </div>
          </div>
        </div>

        <div className="mt-2 px-4 pb-0 pt-2">
          <h3 className="mb-1 text-base font-semibold text-foreground">Services</h3>
          {servicesRow(true)}
        </div>

        <div ref={specsRef} className="px-4 pt-2">
          <Specifications
            specifications={qs}
            selectedSubVariant={selectedSubVariants}
            description={productDetails.description || productDetails.shortDescription}
          />
        </div>
      </div>

      {/* Sticky CTA — tablet only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white shadow-md max-md:hidden lg:hidden">
        <div className="mx-auto max-w-[1700px] px-0">
          <ProductActions
            stickyOnly
            selectedProduct={{ ...selectedSubVariants, name: productDetails.name }}
            onUnlock={handleUnlock}
            onNotify={handleNotify}
          />
        </div>
      </div>

      {activeServiceIndex !== null && overlayStyle && typeof document !== "undefined"
        ? createPortal(
            <ServiceOverlayPortal
              overlayStyle={overlayStyle}
              overlayDomRef={overlayDomRef}
              arrowRef={overlayArrowRef}
              showBelow={overlayStyle.showBelow}
            >
              <div className="relative rounded-xl border border-border bg-white p-4 shadow-xl sm:p-5">
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-[#153a75] via-blue-400 to-cyan-400" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {ActiveServiceIcon ? (
                      <ActiveServiceIcon className="hidden h-5 w-5 text-[#153a75] sm:inline" />
                    ) : null}
                    <h3 className="text-base font-semibold text-foreground">
                      {services[activeServiceIndex].name}
                    </h3>
                  </div>
                  <button
                    onClick={closeServiceModal}
                    type="button"
                    aria-label="Close service details"
                    className="cursor-pointer rounded-md p-1.5 text-muted hover:bg-gray-100 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#153a75]/30"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-3 h-px bg-gray-100" />
                <div className="mt-3 max-h-60 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                    {services[activeServiceIndex].details}
                  </p>
                </div>
              </div>
            </ServiceOverlayPortal>,
            document.body,
          )
        : null}

      <ShareProductModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={shareUrl}
        onCopy={() => setToastMessage("URL copied to clipboard")}
      />
    </>
  );
}
