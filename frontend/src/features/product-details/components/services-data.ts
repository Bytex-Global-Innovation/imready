import { Briefcase, Lock, RefreshCw, Shield, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  PRODUCT_DETAIL_SERVICE_COPY,
  type ProductSpecs,
} from "@/constants/product-detail";

export interface ProductService {
  name: string;
  details: string;
  icon: LucideIcon;
  nameParts?: [string, string, string];
}

function parseWarrantyYears(input: ProductSpecs | null | undefined): number {
  if (!input) return 1;
  const y = input.warrantyDurationYears;
  if (y != null && !Number.isNaN(Number(y))) {
    const n = Math.round(Number(y));
    return n > 0 ? n : 1;
  }
  if (input.warranty != null) {
    const match = String(input.warranty).match(/(\d+)/);
    if (match) return Math.max(1, Number(match[1]));
  }
  return 1;
}

function parseWarrantyType(input: ProductSpecs | null | undefined): string {
  if (!input?.warrantyType) return "Doorstep";
  const s = String(input.warrantyType).trim().toLowerCase();
  if (/^carry[- ]?in$/i.test(s) || s === "carryin" || s === "carry in") return "Carry-in";
  return "Doorstep";
}

export function buildServices(specs: ProductSpecs | null | undefined): ProductService[] {
  const years = parseWarrantyYears(specs);
  const type = parseWarrantyType(specs);
  const warrantyLabel = `${years} ${years === 1 ? "Year" : "Years"} ${type} Warranty`;

  return [
    {
      name: PRODUCT_DETAIL_SERVICE_COPY.replacement.name,
      details: PRODUCT_DETAIL_SERVICE_COPY.replacement.details,
      icon: RefreshCw,
    },
    {
      name: PRODUCT_DETAIL_SERVICE_COPY.delivery.name,
      details: PRODUCT_DETAIL_SERVICE_COPY.delivery.details,
      icon: Truck,
    },
    {
      name: warrantyLabel,
      nameParts: [`${years} ${years === 1 ? "Year" : "Years"}`, type, "Warranty"],
      details:
        type === "Carry-in"
          ? PRODUCT_DETAIL_SERVICE_COPY.warrantyCarryIn
          : PRODUCT_DETAIL_SERVICE_COPY.warrantyDoorstep,
      icon: Shield,
    },
    {
      name: PRODUCT_DETAIL_SERVICE_COPY.secureTransaction.name,
      details: PRODUCT_DETAIL_SERVICE_COPY.secureTransaction.details,
      icon: Lock,
    },
    {
      name: PRODUCT_DETAIL_SERVICE_COPY.corporateBenefits.name,
      details: PRODUCT_DETAIL_SERVICE_COPY.corporateBenefits.details,
      icon: Briefcase,
    },
  ];
}

export interface ServiceOverlayStyle {
  position: "absolute";
  left: number;
  width: number;
  top: number;
  zIndex: number;
  showBelow: boolean;
  arrowLeft: number;
}

export function getServiceOverlayStyle(
  rect: DOMRect,
  options: {
    panelMaxWidth?: number;
    panelHeight?: number;
    padding?: number;
    vMargin?: number;
    arrowW?: number;
    zIndex?: number;
  } = {},
): ServiceOverlayStyle {
  const {
    panelMaxWidth = 340,
    panelHeight = 160,
    padding = 12,
    vMargin = 12,
    arrowW = 12,
    zIndex = 10,
  } = options;

  const innerWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  const innerHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const pageScrollY =
    typeof window !== "undefined" ? window.scrollY || window.pageYOffset || 0 : 0;

  const width = Math.min(panelMaxWidth, innerWidth - padding * 2);
  let left = rect.left;
  if (left + width > innerWidth - padding) left = innerWidth - width - padding;
  if (left < padding) left = padding;

  let arrowLeft = Math.round(rect.left + rect.width / 2 - left - arrowW / 2);
  if (arrowLeft < 8) arrowLeft = 8;
  if (arrowLeft > width - arrowW - 8) arrowLeft = Math.max(8, width - arrowW - 8);

  const spaceBelow = innerHeight - rect.bottom;
  const preferredBelow = spaceBelow >= panelHeight + vMargin;

  if (preferredBelow) {
    return {
      position: "absolute",
      left: Math.round(left),
      width: Math.round(width),
      zIndex,
      top: Math.round(pageScrollY + rect.bottom + vMargin),
      showBelow: true,
      arrowLeft,
    };
  }

  return {
    position: "absolute",
    left: Math.round(left),
    width: Math.round(width),
    zIndex,
    top: Math.round(pageScrollY + rect.top - panelHeight - vMargin),
    showBelow: false,
    arrowLeft,
  };
}
