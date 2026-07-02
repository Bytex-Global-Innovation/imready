"use client";

import { useEffect, useRef, useState } from "react";
import {
  PRODUCT_DETAIL_COPY,
  PRODUCT_DETAIL_IMAGE_CLASSES,
  PRODUCT_DETAIL_MAGNIFIER,
} from "@/constants";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  image: string | undefined;
  disableMagnifier?: boolean;
}

export function ProductImage({ image, disableMagnifier = false }: ProductImageProps) {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const { zoomBoxWidth, zoomBoxHeight, magnifierSize, lensBackground, lensShadow, previewBackground, previewShadow } =
    PRODUCT_DETAIL_MAGNIFIER;
  const zoomRatioX = zoomBoxWidth / magnifierSize;
  const zoomRatioY = zoomBoxHeight / magnifierSize;

  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0,
    );
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    if (disableMagnifier || isTouchDevice || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x = Math.max(magnifierSize / 2, Math.min(x, rect.width - magnifierSize / 2));
    y = Math.max(magnifierSize / 2, Math.min(y, rect.height - magnifierSize / 2));
    setZoomPos({ x, y });
  }

  const magnifierActive = showZoom && !disableMagnifier && !isTouchDevice;
  const hasImg =
    Boolean(imgRef.current?.offsetWidth) && Boolean(imgRef.current?.offsetHeight);
  const bgWidth = hasImg ? (imgRef.current?.offsetWidth ?? 0) * zoomRatioX : null;
  const bgHeight = hasImg ? (imgRef.current?.offsetHeight ?? 0) * zoomRatioY : null;
  const bgPositionX = hasImg
    ? `-${Math.round(zoomPos.x * zoomRatioX - zoomBoxWidth / 2)}px`
    : "center";
  const bgPositionY = hasImg
    ? `-${Math.round(zoomPos.y * zoomRatioY - zoomBoxHeight / 2)}px`
    : "center";

  if (!image) {
    return (
      <div className={PRODUCT_DETAIL_IMAGE_CLASSES.empty}>
        <span className={PRODUCT_DETAIL_IMAGE_CLASSES.emptyLabel}>{PRODUCT_DETAIL_COPY.noImage}</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-start">
      <div
        className={cn(
          PRODUCT_DETAIL_IMAGE_CLASSES.viewport,
          disableMagnifier || isTouchDevice
            ? PRODUCT_DETAIL_IMAGE_CLASSES.viewportDefault
            : PRODUCT_DETAIL_IMAGE_CLASSES.viewportCrosshair,
        )}
        onMouseEnter={() => {
          if (!disableMagnifier && !isTouchDevice) setShowZoom(true);
        }}
        onMouseLeave={() => {
          if (!disableMagnifier && !isTouchDevice) setShowZoom(false);
        }}
        onMouseMove={handleMouseMove}
        ref={imgRef}
        aria-hidden={disableMagnifier || isTouchDevice}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={PRODUCT_DETAIL_COPY.selectedProductAlt}
          className={PRODUCT_DETAIL_IMAGE_CLASSES.productImg}
          draggable={false}
        />

        {magnifierActive ? (
          <div
            className="pointer-events-none absolute z-10 rounded"
            style={{
              left: `${zoomPos.x - magnifierSize / 2}px`,
              top: `${zoomPos.y - magnifierSize / 2}px`,
              width: `${magnifierSize}px`,
              height: `${magnifierSize}px`,
              background: lensBackground,
              boxShadow: lensShadow,
            }}
          />
        ) : null}
      </div>

      {magnifierActive ? (
        <div
          className={PRODUCT_DETAIL_IMAGE_CLASSES.zoomPane}
          style={{ width: `${zoomBoxWidth}px`, height: `${zoomBoxHeight}px`, boxShadow: previewShadow }}
        >
          <div
            className="h-full w-full"
            style={{
              backgroundColor: previewBackground,
              backgroundImage: `url(${image})`,
              backgroundRepeat: "no-repeat",
              backgroundSize:
                bgWidth && bgHeight
                  ? `${Math.round(bgWidth)}px ${Math.round(bgHeight)}px`
                  : "cover",
              backgroundPosition: `${bgPositionX} ${bgPositionY}`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
