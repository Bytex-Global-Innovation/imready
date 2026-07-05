"use client";

import { useEffect, useState } from "react";
import { PRODUCT_DETAIL_MOBILE_BREAKPOINT } from "@/constants/product-detail";

export function useMagnifierDisabled() {
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    const check = () => {
      const narrow = window.innerWidth < PRODUCT_DETAIL_MOBILE_BREAKPOINT;
      const touch =
        "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;
      setDisabled(narrow || touch);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return disabled;
}
