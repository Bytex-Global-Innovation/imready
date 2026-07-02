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
} from "lucide-react";
import {
  COMPARE_PRICING_CTA,
  PRODUCT_DETAIL_CLASSES,
  PRODUCT_DETAIL_COPY,
  PRODUCT_DETAIL_UI,
} from "@/constants";
import type {
  ProductDetailsData,
  ProductSubVariant,
  ProductVariant,
} from "@/constants/product-detail";
import { ACCESSORY_CATEGORY_ID } from "@/constants/product-detail";
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
import { ImageList } from "./image-list";
import { ProductActions } from "./product-actions";
import { ProductImage } from "./product-image";
import { ProductDetailsSkeleton } from "./product-details-skeleton";
import { ProductDetailsSkeletonMobile } from "./product-details-skeleton-mobile";
import { Specifications } from "./specifications";
import {
  buildServices,
  getServiceOverlayStyle,
  type ServiceOverlayStyle,
} from "./services-data";
import { ShareProductModal } from "./share-product-modal";
import { StarRatingDisplay } from "./star-rating-display";

interface ProductDetailsProps {
  productDetails: ProductDetailsData | null;
  onAction?: (action: "unlock" | "notify", message: string) => void;
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
        className={PRODUCT_DETAIL_CLASSES.quantityBtn}
        onClick={() => onChange("decrease")}
        aria-label={PRODUCT_DETAIL_COPY.decreaseQuantity}
        type="button"
      >
        −
      </button>
      <span className={PRODUCT_DETAIL_CLASSES.quantityValue}>{quantity}</span>
      <button
        disabled={disabled}
        className={PRODUCT_DETAIL_CLASSES.quantityBtn}
        onClick={() => onChange("increase")}
        aria-label={PRODUCT_DETAIL_COPY.increaseQuantity}
        type="button"
      >
        +
      </button>
      {disabled ? (
        <span className={PRODUCT_DETAIL_CLASSES.outOfStock}>{PRODUCT_DETAIL_COPY.outOfStock}</span>
      ) : null}
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
          const urls = variantWithSub.images.map((i) => i.url);
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
      const urls = v.images.map((i) => i.url);
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
    const isDesktop = window.innerWidth >= PRODUCT_DETAIL_UI.mobileBreakpoint;
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
      <p className={PRODUCT_DETAIL_CLASSES.priceDesktop}>
        ₹{formatNumberWithCommas(displayPrice)}
        <span className={PRODUCT_DETAIL_CLASSES.priceGstDesktop}>+ GST</span>
      </p>
      <p className={PRODUCT_DETAIL_CLASSES.priceSubDesktop}>
        {COMPARE_PRICING_CTA.firstCutLabel}
      </p>
    </div>
  );

  const servicesRow = (mobile = false) => (
    <div className={mobile ? "relative" : ""}>
      {mobile ? (
        <button
          type="button"
          onClick={() => scrollServices("prev")}
          aria-label={PRODUCT_DETAIL_COPY.previousServices}
          disabled={!canScrollLeftServices}
          className="absolute -ml-4 left-0 top-1/2 z-20 -translate-y-1/2 cursor-pointer p-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
        >
          <ChevronLeft className={PRODUCT_DETAIL_CLASSES.serviceChevron} />
        </button>
      ) : null}
      <div
        ref={mobile ? servicesRef : undefined}
        className={cn(
          mobile
            ? PRODUCT_DETAIL_CLASSES.serviceScrollMobile
            : PRODUCT_DETAIL_CLASSES.serviceScrollDesktop,
        )}
        role={mobile ? "list" : undefined}
        aria-label={mobile ? PRODUCT_DETAIL_COPY.productServices : undefined}
      >
        {services.map((service, index) => {
          const Icon = service.icon;
          const expanded = activeServiceIndex === index;
          return (
            <button
              key={service.name}
              type="button"
              onClick={(e) => handleServiceClick(e, index)}
              aria-label={`${PRODUCT_DETAIL_COPY.productServices}: ${service.name}`}
              title={service.name}
              role={mobile ? "listitem" : undefined}
              aria-expanded={mobile ? expanded : undefined}
              className={cn(
                PRODUCT_DETAIL_CLASSES.serviceBtnBase,
                mobile ? PRODUCT_DETAIL_CLASSES.serviceBtnMobile : PRODUCT_DETAIL_CLASSES.serviceBtnDesktop,
                mobile && expanded && PRODUCT_DETAIL_CLASSES.navyRing,
              )}
            >
              <div
                className={cn(
                  "mb-1 flex items-center justify-center rounded-full border",
                  mobile ? PRODUCT_DETAIL_CLASSES.serviceIconWrapMobile : PRODUCT_DETAIL_CLASSES.serviceIconWrapDesktop,
                  expanded && mobile
                    ? cn(PRODUCT_DETAIL_CLASSES.navyBorder, PRODUCT_DETAIL_CLASSES.navyBgMuted)
                    : cn(PRODUCT_DETAIL_CLASSES.navyBorderMuted, PRODUCT_DETAIL_CLASSES.navyBorderHover),
                )}
              >
                <Icon
                  className={cn(
                    PRODUCT_DETAIL_CLASSES.navyText,
                    mobile ? PRODUCT_DETAIL_CLASSES.serviceIconMobile : PRODUCT_DETAIL_CLASSES.serviceIconDesktop,
                  )}
                />
              </div>
              <div
                className={cn(
                  "max-w-[75px] text-center font-semibold leading-snug",
                  PRODUCT_DETAIL_CLASSES.navyText,
                  mobile ? PRODUCT_DETAIL_CLASSES.serviceLabelMobile : PRODUCT_DETAIL_CLASSES.serviceLabelDesktop,
                )}
              >
                {service.nameParts ? (
                  <div className="flex flex-col items-center gap-0">
                    {service.nameParts.map((part, i) => (
                      <span
                        key={i}
                        className={
                          mobile
                            ? PRODUCT_DETAIL_CLASSES.serviceLabelPartMobile
                            : PRODUCT_DETAIL_CLASSES.serviceLabelPartDesktop
                        }
                      >
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
          aria-label={PRODUCT_DETAIL_COPY.nextServices}
          disabled={!canScrollRightServices}
          className="absolute -mr-4 right-0 top-1/2 z-20 -translate-y-1/2 cursor-pointer p-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
        >
          <ChevronRight className={cn("ml-6", PRODUCT_DETAIL_CLASSES.serviceChevron)} />
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      {toastMessage ? (
        <div className={PRODUCT_DETAIL_CLASSES.toast}>{toastMessage}</div>
      ) : null}

      {/* Desktop */}
      <div className={PRODUCT_DETAIL_CLASSES.desktopShell}>
        <div className={PRODUCT_DETAIL_CLASSES.desktopCard}>
          <div className={PRODUCT_DETAIL_CLASSES.galleryColumn}>
            <div className="absolute right-4 top-4 z-10 me-3 mt-3 flex items-center gap-2">
              <button
                className={PRODUCT_DETAIL_CLASSES.shareBtnDesktop}
                onClick={() => setIsShareModalOpen(true)}
                aria-label={PRODUCT_DETAIL_COPY.share}
                type="button"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                className={PRODUCT_DETAIL_CLASSES.favBtnDesktop}
                onClick={() => setIsFavourite((f) => !f)}
                aria-label={PRODUCT_DETAIL_COPY.addToFavourites}
                type="button"
              >
                <Heart
                  className={cn(
                    "h-7 w-7",
                    isFavourite ? PRODUCT_DETAIL_CLASSES.favActive : PRODUCT_DETAIL_CLASSES.favIdle,
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
              <div className={PRODUCT_DETAIL_CLASSES.mainImageFrame}>
                <ProductImage image={selectedImage} disableMagnifier={magnifierDisabled} />
              </div>
            </div>
          </div>

          <div className={PRODUCT_DETAIL_CLASSES.infoColumn}>
            <div>
              <p className={PRODUCT_DETAIL_CLASSES.titleDesktop}>{productDetails.name}</p>
              <div className="mb-4 flex flex-wrap gap-4">
                {isAccessoryCategory ? (
                  <p className={PRODUCT_DETAIL_CLASSES.accessoryDesc}>
                    {productDetails.description || productDetails.shortDescription}
                  </p>
                ) : (
                  quickSpecPills.map((pill, idx) => {
                    const Icon = getIconForPill(pill);
                    return (
                      <span key={`${pill}-${idx}`} className={PRODUCT_DETAIL_CLASSES.specPill}>
                        {Icon ? <Icon className={PRODUCT_DETAIL_CLASSES.specPillIcon} /> : null}
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
                  <h3 className={PRODUCT_DETAIL_CLASSES.quantityLabel}>
                    {PRODUCT_DETAIL_COPY.quantityLabel}
                  </h3>
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
                <div className="mt-8">{servicesRow(false)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className={PRODUCT_DETAIL_CLASSES.mobileShell}>
        <div className="relative h-64 w-full bg-white">
          <div className="absolute right-3 top-3 z-20 flex flex-col items-center gap-2">
            <button
              className={PRODUCT_DETAIL_CLASSES.mobileFavBtn}
              onClick={() => setIsFavourite((f) => !f)}
              type="button"
              aria-label={PRODUCT_DETAIL_COPY.addToFavourites}
            >
              <Heart
                className={cn(
                  "h-7 w-7",
                  isFavourite ? PRODUCT_DETAIL_CLASSES.favActive : PRODUCT_DETAIL_CLASSES.favIdle,
                )}
              />
            </button>
            <button
              className={PRODUCT_DETAIL_CLASSES.mobileShareBtn}
              onClick={() => setIsShareModalOpen(true)}
              type="button"
              aria-label={PRODUCT_DETAIL_COPY.shareProduct}
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          <div
            ref={trackRef}
            onScroll={onCarouselScroll}
            className={PRODUCT_DETAIL_CLASSES.carouselTrack}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex h-full">
              {productImagesByVariant.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  type="button"
                  aria-label={PRODUCT_DETAIL_COPY.openImage(idx + 1)}
                  className="h-full w-full shrink-0 snap-start"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
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
                  PRODUCT_DETAIL_CLASSES.carouselDot,
                  carouselStartIdx === i
                    ? PRODUCT_DETAIL_CLASSES.dotActive
                    : PRODUCT_DETAIL_CLASSES.dotIdle,
                )}
                aria-label={PRODUCT_DETAIL_COPY.goToImage(i + 1)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 px-4 pt-3">
          <h1 className={PRODUCT_DETAIL_CLASSES.mobileTitle}>{productDetails.name}</h1>
        </div>

        <div className="gap-2 px-4">
          <p className={PRODUCT_DETAIL_CLASSES.mobileSpecs}>
            {isAccessoryCategory
              ? productDetails.description || productDetails.shortDescription
              : quickSpecsList.length > 0
                ? quickSpecsList
                    .map((s) => String(s).replace(/^[*•\-\s]+/, "").trim())
                    .map((s, i) => (i === 0 ? s : "\u00A0/\u00A0" + s))
                    .join("")
                : PRODUCT_DETAIL_COPY.specsUnavailable}
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
              <div className={PRODUCT_DETAIL_CLASSES.priceMobile}>
                ₹ {formatNumberWithCommas(displayPrice)}
                <span className={PRODUCT_DETAIL_CLASSES.priceGstMobile}>+ GST</span>
              </div>
              <p className={PRODUCT_DETAIL_CLASSES.priceSubMobile}>
                {COMPARE_PRICING_CTA.firstCutLabel}
              </p>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <h2 className={PRODUCT_DETAIL_CLASSES.mobileQuantityLabel}>
                {PRODUCT_DETAIL_COPY.quantityLabel}
              </h2>
              <QuantityStepper
                quantity={quantity}
                maxQuantity={selectedSubVariants.inventory?.qty ?? 0}
                onChange={handleQuantityChange}
              />
            </div>
          </div>
        </div>

        <div className="mt-2 px-4 pb-0 pt-2">
          <h3 className={PRODUCT_DETAIL_CLASSES.mobileServicesTitle}>
            {PRODUCT_DETAIL_COPY.servicesHeading}
          </h3>
          {servicesRow(true)}
        </div>

        <div className="gap-2 px-4 pt-3">
          <div ref={specsRef} className="gap-2 px-4 pt-3">
            <Specifications
              specifications={qs}
              selectedSubVariant={selectedSubVariants}
              description={productDetails.description || productDetails.shortDescription}
            />
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className={PRODUCT_DETAIL_CLASSES.stickyBar}>
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
            <div ref={overlayDomRef} style={overlayStyle} className="pointer-events-auto">
              {overlayStyle.showBelow ? (
                <div
                  style={{
                    position: "absolute",
                    left: overlayStyle.arrowLeft,
                    top: -8,
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderBottom: "8px solid white",
                    filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.06))",
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    left: overlayStyle.arrowLeft,
                    bottom: -8,
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "8px solid white",
                    filter: "drop-shadow(0 -1px 1px rgba(0,0,0,0.06))",
                  }}
                />
              )}
              <div className={PRODUCT_DETAIL_CLASSES.overlayPanel}>
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 rounded-t-xl",
                    PRODUCT_DETAIL_CLASSES.overlayGradient,
                  )}
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {ActiveServiceIcon ? (
                      <ActiveServiceIcon className={PRODUCT_DETAIL_CLASSES.overlayServiceIcon} />
                    ) : null}
                    <h3 className={PRODUCT_DETAIL_CLASSES.overlayTitle}>
                      {services[activeServiceIndex].name}
                    </h3>
                  </div>
                  <button
                    onClick={closeServiceModal}
                    type="button"
                    aria-label={PRODUCT_DETAIL_COPY.closeServiceDetails}
                    className={PRODUCT_DETAIL_CLASSES.overlayClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className={PRODUCT_DETAIL_CLASSES.overlayDivider} />
                <div className={PRODUCT_DETAIL_CLASSES.overlayBody}>
                  <p className={PRODUCT_DETAIL_CLASSES.overlayText}>
                    {services[activeServiceIndex].details}
                  </p>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <ShareProductModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={typeof window !== "undefined" ? window.location.href : ""}
        onCopy={() => setToastMessage(PRODUCT_DETAIL_COPY.urlCopiedToast)}
      />
    </>
  );
}
