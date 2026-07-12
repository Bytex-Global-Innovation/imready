import { Briefcase, Lock, RefreshCw, Shield, Truck } from "@/components/icons";
import type { LucideIcon } from "@/components/icons";
import type { ProductSpecs } from "@/constants/product-detail";

const WARRANTY_CARRY_IN =
  "Bring-in service at an authorized service center. Required to deliver the device to the service location for diagnosis and repair. Service timelines, parts replacement and any shipping reimbursements are governed by the OEM policy.";

const WARRANTY_DOORSTEP =
  "Provides in-home or at-work repair services where a technician is dispatched to your location to fix the device";

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
      name: "10 Days Replacement by Brand",
      details: `Defective Item:
- Eligible for replacement within 10 days of delivery.
- OEM provides on-call support followed by technician inspection at your location.
- Expert may repair, replace, or issue a service letter as per Lenovo policy.`,
      icon: RefreshCw,
    },
    {
      name: "Free Delivery",
      details: `- Enjoy free doorstep delivery across the country.
- No hidden delivery charges during checkout.
- Delivery timelines may vary based on location and availability.`,
      icon: Truck,
    },
    {
      name: warrantyLabel,
      nameParts: [`${years} ${years === 1 ? "Year" : "Years"}`, type, "Warranty"],
      details: type === "Carry-in" ? WARRANTY_CARRY_IN : WARRANTY_DOORSTEP,
      icon: Shield,
    },
    {
      name: "Secure Transaction",
      details: `- All transactions are processed through PCI DSS-compliant gateways.
- Ensures safety of personal and financial data.
- Supports secure options: UPI, credit/debit cards, net banking, and more.`,
      icon: Lock,
    },
    {
      name: "Corporate Benefits",
      details: `Exclusive discounts for professional businesses and professionals.
- Flexible payment options including EMI and bulk purchase plans.
- Priority customer support and dedicated account managers`,
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
