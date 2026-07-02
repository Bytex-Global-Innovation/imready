import { PRODUCTS_INVENTORY, type Product } from "./product-comparison";
import { getFirstComment, parsePrice } from "@/lib/product-utils";

/** UI tokens — match ByteX product details reference */
export const PRODUCT_DETAIL_UI = {
  primaryBlue: "#2874f0",
  primaryBlueHover: "#0b62e0",
  navy: "#213c73",
  mobileBreakpoint: 1024,
} as const;

export const ACCESSORY_CATEGORY_ID = "5c4505ab-3860-4c59-b0fd-02342badd22d";

export interface ProductSubVariant {
  id: string;
  price: number;
  discounted_price?: number;
  mrp?: number;
  ram?: string | number;
  storage?: string | number;
  storageType?: string;
  inventory: { qty: number };
  favourite?: boolean;
  isNotified?: boolean;
  productId: string;
}

export interface ProductVariant {
  images: { url: string }[];
  subVariants: ProductSubVariant[];
}

export interface ProductScreenSpecs {
  screenSizeCM?: string;
  screenSizeInch?: string;
  screenResolution?: string;
  screenType?: string;
}

export interface ProductCameraSpecs {
  rearCameraMp?: string;
  frontCameraMp?: string;
  mainCamera?: string;
}

export interface ProductSpecs {
  processor?: string;
  processorName?: string;
  chipSet?: string;
  ram?: string;
  storage?: string;
  storageType?: string;
  operatingSystem?: string;
  os?: string;
  graphics?: string;
  gpu?: string;
  warranty?: string;
  warrantyDurationYears?: number;
  warrantyType?: string;
  weight?: string;
  screen?: ProductScreenSpecs;
  camera?: ProductCameraSpecs;
  battery?: { batteryCapacity?: string };
  speaker?: string;
  microphone?: string;
  connectivity?: string;
  port?: string;
  refreshRate?: string;
  aiSupport?: string;
  accessoryType?: string;
  productCategory?: string;
  [key: string]: unknown;
}

export interface ProductDetailsData {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  categoryId?: string;
  rating: number;
  noOfRating: number;
  isRefurbished?: boolean;
  favourite?: boolean;
  specs: ProductSpecs;
  variants: ProductVariant[];
}

const OUT_OF_STOCK_IDS = new Set(["2"]);

function buildSpecsFromProduct(product: Product): ProductSpecs {
  const screenMatch = product.screen.match(/(\d+(?:\.\d+)?)\s*cms?\s*\(([^)]+)\)/i);
  return {
    processor: product.processor,
    ram: product.memory,
    storage: product.storage,
    storageType: "GB",
    operatingSystem: product.operatingSystem,
    graphics: product.graphics,
    warranty: product.warranty,
    warrantyDurationYears: 1,
    warrantyType: "Doorstep",
    weight: product.weight,
    screen: {
      screenSizeCM: screenMatch?.[1] ?? "35.56",
      screenSizeInch: screenMatch?.[2] ?? '14"',
      screenResolution: product.screen,
      screenType: "FHD",
    },
    camera: {
      rearCameraMp: "-",
      frontCameraMp: product.camera,
      mainCamera: product.camera,
    },
    battery: { batteryCapacity: product.battery },
    connectivity: "Wi-Fi, Bluetooth",
    productCategory: product.category,
  };
}

export function buildProductDetailsFromInventory(product: Product): ProductDetailsData {
  const priceNum = parsePrice(product.price);
  const specialNum = parsePrice(product.specialPrice);
  const hasDiscount = specialNum > 0 && specialNum < priceNum;

  const subVariant: ProductSubVariant = {
    id: `${product.id}-default`,
    price: priceNum,
    discounted_price: hasDiscount ? specialNum : undefined,
    mrp: Math.round(priceNum * 1.12),
    ram: product.memory.replace(/\D/g, "") || product.memory,
    storage: product.storage.replace(/\D/g, "") || product.storage,
    storageType: "GB",
    inventory: { qty: OUT_OF_STOCK_IDS.has(product.id) ? 0 : 12 },
    productId: product.id,
  };

  const images = [
    { url: product.image },
    { url: product.image },
    { url: product.image },
  ];

  return {
    id: product.id,
    name: product.name,
    description: product.comments
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" "),
    shortDescription: getFirstComment(product.comments),
    categoryId: product.category === "commercial" ? "commercial-laptop" : "consumer-laptop",
    rating: 4.3,
    noOfRating: 247,
    isRefurbished: product.id === "1",
    specs: buildSpecsFromProduct(product),
    variants: [{ images, subVariants: [subVariant] }],
  };
}

export function getProductDetailsById(productId: string): ProductDetailsData | null {
  const product = PRODUCTS_INVENTORY.find((p) => p.id === productId);
  if (!product) return null;
  return buildProductDetailsFromInventory(product);
}

export const PRODUCT_DETAIL_COPY = {
  detailsHeading: "Details",
  quantityLabel: "Quantity:",
  outOfStock: "Out of stock",
  outOfStockLower: "out of stock",
  servicesHeading: "Services",
  shareTitle: "Share with Your Friends",
  notifyMe: "Notify Me",
  allDetails: "All Details",
  showMore: "Show more",
  showLess: "Show less",
  specsUnavailable: "Specifications not available",
  noImage: "No image",
  selectedProductAlt: "Selected Product",
  urlCopiedToast: "URL copied to clipboard!",
  notifySuccessMessage: "You will be notified when this product is back in stock.",
  noSpecsAvailable: "No specifications available.",
  noSpecData: "No data available.",
  specificationColumn: "Specification",
  detailsColumn: "Details",
  shareFacebook: "Facebook",
  shareX: "X",
  shareWhatsapp: "WhatsApp",
  shareEmail: "E-Mail",
  shareCopyLink: "Copy Link",
  close: "Close",
  decreaseQuantity: "Decrease quantity",
  increaseQuantity: "Increase quantity",
  previousServices: "Previous services",
  nextServices: "Next services",
  productServices: "Product services",
  share: "Share",
  shareProduct: "Share product",
  addToFavourites: "Add to favourites",
  closeServiceDetails: "Close service details",
  thumbnails: "Product image thumbnails",
  openImage: (index: number) => `Open image ${index}`,
  goToImage: (index: number) => `Go to image ${index}`,
} as const;

export const PRODUCT_DETAIL_SERVICE_COPY = {
  replacement: {
    name: "10 Days Replacement by Brand",
    details: `Defective Item:
- Eligible for replacement within 10 days of delivery.
- OEM provides on-call support followed by technician inspection at your location.
- Expert may repair, replace, or issue a service letter as per Lenovo policy.`,
  },
  delivery: {
    name: "Free Delivery",
    details: `- Enjoy free doorstep delivery across the country.
- No hidden delivery charges during checkout.
- Delivery timelines may vary based on location and availability.`,
  },
  secureTransaction: {
    name: "Secure Transaction",
    details: `- All transactions are processed through PCI DSS-compliant gateways.
- Ensures safety of personal and financial data.
- Supports secure options: UPI, credit/debit cards, net banking, and more.`,
  },
  warrantyCarryIn:
    "Bring-in service at an authorized service center. Required to deliver the device to the service location for diagnosis and repair. Service timelines, parts replacement and any shipping reimbursements are governed by the OEM policy.",
  warrantyDoorstep:
    "Provides in-home or at-work repair services where a technician is dispatched to your location to fix the device",
} as const;
