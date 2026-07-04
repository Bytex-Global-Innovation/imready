"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MAGNIFIER_SIZE = 240;
const ZOOM_BOX_WIDTH = 735;
const ZOOM_BOX_HEIGHT = 580;

const classes = {
  empty:
    "flex h-[250px] w-full items-center justify-center bg-gray-50 sm:h-[400px] md:h-[472px] lg:h-[472px] lg:w-96 xl:w-[30rem]",
  emptyLabel: "text-sm text-gray-400",
  viewport:
    "relative h-[250px] w-full border-gray-300 sm:h-[400px] md:h-[472px] lg:h-[472px] lg:w-96 xl:w-[30rem]",
  viewportCrosshair: "cursor-crosshair",
  viewportDefault: "cursor-default",
  productImg: "h-full w-full object-contain select-none pointer-events-auto",
  zoomPane:
    "absolute left-[107%] top-[-40px] z-10 hidden h-[580px] w-[735px] overflow-hidden bg-white shadow-[0_8px_24px_rgba(66,133,244,0.25)] lg:block",
  magnifierLens:
    "pointer-events-none absolute z-10 h-[240px] w-[240px] rounded bg-[rgba(66,133,244,0.15)] shadow-[0_4px_12px_rgba(66,133,244,0.4)]",
  zoomPreview: "h-full w-full bg-white bg-no-repeat",
} as const;

interface ProductImageProps {
  image: string | undefined;
  disableMagnifier?: boolean;
}

export function ProductImage({ image, disableMagnifier = false }: ProductImageProps) {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const zoomRatioX = ZOOM_BOX_WIDTH / MAGNIFIER_SIZE;
  const zoomRatioY = ZOOM_BOX_HEIGHT / MAGNIFIER_SIZE;

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
    x = Math.max(MAGNIFIER_SIZE / 2, Math.min(x, rect.width - MAGNIFIER_SIZE / 2));
    y = Math.max(MAGNIFIER_SIZE / 2, Math.min(y, rect.height - MAGNIFIER_SIZE / 2));
    setZoomPos({ x, y });
  }

  const magnifierActive = showZoom && !disableMagnifier && !isTouchDevice;
  const hasImg =
    Boolean(imgRef.current?.offsetWidth) && Boolean(imgRef.current?.offsetHeight);
  const bgWidth = hasImg ? (imgRef.current?.offsetWidth ?? 0) * zoomRatioX : null;
  const bgHeight = hasImg ? (imgRef.current?.offsetHeight ?? 0) * zoomRatioY : null;
  const bgPositionX = hasImg
    ? `-${Math.round(zoomPos.x * zoomRatioX - ZOOM_BOX_WIDTH / 2)}px`
    : "center";
  const bgPositionY = hasImg
    ? `-${Math.round(zoomPos.y * zoomRatioY - ZOOM_BOX_HEIGHT / 2)}px`
    : "center";

  if (!image) {
    return (
      <div className={classes.empty}>
        <span className={classes.emptyLabel}>No image available</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-start">
      <div
        className={cn(
          classes.viewport,
          disableMagnifier || isTouchDevice
            ? classes.viewportDefault
            : classes.viewportCrosshair,
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
          alt="Selected product"
          className={classes.productImg}
          draggable={false}
        />

        {magnifierActive ? (
          <div
            className={classes.magnifierLens}
            style={{
              left: zoomPos.x - MAGNIFIER_SIZE / 2,
              top: zoomPos.y - MAGNIFIER_SIZE / 2,
            }}
          />
        ) : null}
      </div>

      {magnifierActive ? (
        <div className={classes.zoomPane}>
          <div
            className={classes.zoomPreview}
            style={{
              backgroundImage: `url(${image})`,
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
