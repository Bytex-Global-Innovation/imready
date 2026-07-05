"use client";

import { useEffect, useState } from "react";
import { PRODUCT_DETAIL_MOBILE_BREAKPOINT } from "@/constants/product-detail";

export function useMobileView(breakpoint = PRODUCT_DETAIL_MOBILE_BREAKPOINT) {
  const [isMobileView, setIsMobileView] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < breakpoint);
    };
    handleResize();
    setMounted(true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return { isMobileView, mounted };
}
