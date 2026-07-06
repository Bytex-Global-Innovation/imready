"use client";

import { useEffect, useRef, useState } from "react";
import { toAbsoluteProductImageUrl } from "@/constants/product-detail";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  image: string | undefined;
  disableMagnifier?: boolean;
}

function MagnifierLens({
  active,
  x,
  y,
}: {
  active: boolean;
  x: number;
  y: number;
}) {
  const lensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lens = lensRef.current;
    if (!lens || !active) return;
    lens.style.left = `${x - 120}px`;
    lens.style.top = `${y - 120}px`;
  }, [active, x, y]);

  if (!active) return null;

  return (
    <div
      ref={lensRef}
      className="pointer-events-none absolute z-10 h-60 w-60 rounded bg-brand-500/15 shadow-md"
    />
  );
}

function ZoomPreview({
  active,
  imageUrl,
  zoomPos,
  viewportRef,
}: {
  active: boolean;
  imageUrl: string;
  zoomPos: { x: number; y: number };
  viewportRef: React.RefObject<HTMLDivElement | null>;
}) {
  const zoomImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const zoomImg = zoomImgRef.current;
    const viewport = viewportRef.current;
    if (!zoomImg || !viewport || !active) return;

    const viewportWidth = viewport.offsetWidth;
    const viewportHeight = viewport.offsetHeight;
    if (!viewportWidth || !viewportHeight) return;

    const zoomRatioX = 735 / 240;
    const zoomRatioY = 580 / 240;
    const scaledWidth = viewportWidth * zoomRatioX;
    const scaledHeight = viewportHeight * zoomRatioY;

    zoomImg.style.width = `${Math.round(scaledWidth)}px`;
    zoomImg.style.height = `${Math.round(scaledHeight)}px`;
    zoomImg.style.left = `${Math.round(-zoomPos.x * zoomRatioX + 367.5)}px`;
    zoomImg.style.top = `${Math.round(-zoomPos.y * zoomRatioY + 290)}px`;
  }, [active, zoomPos, viewportRef]);

  if (!active) return null;

  return (
    <div className="absolute left-full top-0 z-10 ml-8 hidden h-[580px] w-[735px] -translate-y-10 overflow-hidden bg-white shadow-lg lg:block">
      <div className="relative h-full w-full overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={zoomImgRef}
          src={imageUrl}
          alt=""
          className="absolute max-w-none select-none pointer-events-none"
          draggable={false}
        />
      </div>
    </div>
  );
}

export function ProductImage({ image, disableMagnifier = false }: ProductImageProps) {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const imageUrl = image ? toAbsoluteProductImageUrl(image) : undefined;
  const magnifierActive = showZoom && !disableMagnifier && !isTouchDevice;

  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0,
    );
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    if (disableMagnifier || isTouchDevice || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x = Math.max(120, Math.min(x, rect.width - 120));
    y = Math.max(120, Math.min(y, rect.height - 120));
    setZoomPos({ x, y });
  }

  if (!imageUrl) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center bg-gray-50 sm:h-[400px] md:h-[472px] lg:h-[472px] lg:w-96 xl:w-[30rem]">
        <span className="text-sm text-muted">No image available</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-start">
      <div
        ref={viewportRef}
        className={cn(
          "relative h-[250px] w-full sm:h-[400px] md:h-[472px] lg:h-[472px] lg:w-96 xl:w-[30rem]",
          disableMagnifier || isTouchDevice ? "cursor-default" : "cursor-crosshair",
        )}
        onMouseEnter={() => {
          if (!disableMagnifier && !isTouchDevice) setShowZoom(true);
        }}
        onMouseLeave={() => {
          if (!disableMagnifier && !isTouchDevice) setShowZoom(false);
        }}
        onMouseMove={handleMouseMove}
        aria-hidden={disableMagnifier || isTouchDevice}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Selected product"
          className="h-full w-full object-contain select-none pointer-events-auto"
          draggable={false}
        />
        <MagnifierLens active={magnifierActive} x={zoomPos.x} y={zoomPos.y} />
      </div>

      <ZoomPreview
        active={magnifierActive}
        imageUrl={imageUrl}
        zoomPos={zoomPos}
        viewportRef={viewportRef}
      />
    </div>
  );
}
