import { BYTEX_IMAGE_CDN, PRODUCTS_INVENTORY, type Product } from "./product-comparison";
import { getFirstComment, parsePrice } from "@/lib/product-utils";

export const ACCESSORY_CATEGORY_ID = "5c4505ab-3860-4c59-b0fd-02342badd22d";
export const PRODUCT_DETAIL_MOBILE_BREAKPOINT = 1024;

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

export function toAbsoluteProductImageUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${BYTEX_IMAGE_CDN}/${url.replace(/^\/+/, "")}`;
}

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
  const imageUrl = toAbsoluteProductImageUrl(product.image);

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

  const images = [{ url: imageUrl }, { url: imageUrl }, { url: imageUrl }];

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
