import type { ProductSpecs, ProductSubVariant } from "@/constants/product-detail";
import type { LucideIcon } from "@/components/icons";
import { BadgeCheck, Cpu, Gpu, MemoryStick, Monitor, RefreshCw } from "@/components/icons";

export function formatNumberWithCommas(value: number | string | undefined | null): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^\d.]/g, ""));
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("en-IN");
}

export function shouldShowDiscountedPrice(
  subVariant: ProductSubVariant | null | undefined,
  unlocked: boolean,
): boolean {
  if (!unlocked || !subVariant?.discounted_price) return false;
  return subVariant.discounted_price < subVariant.price;
}

export function getSubVariantDisplayPrice(subVariant: ProductSubVariant | null | undefined): number {
  if (!subVariant) return 0;
  if (
    subVariant.discounted_price &&
    subVariant.discounted_price > 0 &&
    subVariant.discounted_price < subVariant.price
  ) {
    return subVariant.discounted_price;
  }
  return subVariant.price;
}

export function formatSpecValue(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === "string" || typeof val === "number") return String(val).trim();
  if (Array.isArray(val)) return val.filter(Boolean).map(String).join(", ");
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    const parts: string[] = [];
    if (obj.batteryCapacity) parts.push(String(obj.batteryCapacity));
    if (obj.capacity) parts.push(String(obj.capacity));
    if (obj.type) parts.push(String(obj.type));
    if (parts.length > 0) return parts.join(" • ");
    return Object.values(obj)
      .filter((v) => v != null && v !== "")
      .map(String)
      .join(" / ");
  }
  return String(val);
}

function isLikelyCpuModel(s: string): boolean {
  const str = s.toLowerCase();
  const keywords =
    /(core|ryzen|snapdragon|helio|exynos|kirin|athlon|m\d|apple|qualcomm|intel|amd|xenon|pentium|celeron|atom|ryzen)/i;
  const modelNumberPattern = /\b([a-zA-Z]*\d{2,}[a-zA-Z0-9-]*)\b/;
  const isMarketing = /(platform|soc|series|platforms|family)/i.test(str);
  if (keywords.test(str) && !isMarketing) return true;
  if (modelNumberPattern.test(str) && !isMarketing) return true;
  return false;
}

export function buildQuickSpecPills(
  qs: ProductSpecs,
  selectedSubVariant: ProductSubVariant | null | undefined,
): string[] {
  const pills: string[] = [];
  const pushIf = (val: string | null | undefined) => {
    if (val) pills.push(String(val).trim());
  };

  const procFromProcessorField = qs.processor || qs.processorName || null;
  const procFromChipSetField = qs.chipSet || null;
  let processorValue: string | null = null;
  if (procFromProcessorField && isLikelyCpuModel(procFromProcessorField)) {
    processorValue = procFromProcessorField;
  } else if (procFromChipSetField && isLikelyCpuModel(procFromChipSetField)) {
    processorValue = procFromChipSetField;
  } else {
    processorValue = procFromProcessorField || procFromChipSetField || qs.processorName || null;
  }
  pushIf(processorValue);

  const ramVal = selectedSubVariant?.ram || qs.ram;
  if (ramVal) pushIf(`${ramVal}GB RAM`);

  const storageVal = selectedSubVariant?.storage || qs.storage;
  const storageUnit =
    (selectedSubVariant && selectedSubVariant.storageType) || qs.storageType || "GB";
  if (storageVal) pushIf(`${storageVal} ${storageUnit} Storage`);

  const os = qs.os || qs.operatingSystem;
  pushIf(os);
  pushIf(qs.graphics);

  if (qs.warrantyDurationYears != null) {
    const type = qs.warrantyType ? String(qs.warrantyType).trim() : "Doorstep";
    pushIf(
      `${qs.warrantyDurationYears} ${qs.warrantyDurationYears === 1 ? "Year" : "Years"} ${type} Warranty`,
    );
  } else if (qs.warranty) {
    pushIf(`${qs.warranty} Year Doorstep Warranty`);
  }

  return pills.reduce<string[]>((acc, item) => {
    if (item && !acc.includes(item)) acc.push(item);
    return acc;
  }, []);
}

export function buildQuickSpecsList(
  qs: ProductSpecs,
  selectedSubVariant: ProductSubVariant | null | undefined,
): string[] {
  const list: string[] = [];
  const pushIf = (v: unknown) => {
    const s = formatSpecValue(v);
    if (s) list.push(s);
  };
  pushIf(qs.processor || qs.processorName || qs.chipSet);
  pushIf(selectedSubVariant?.ram ? `${selectedSubVariant.ram}GB RAM` : null);
  const storageUnit =
    (selectedSubVariant && selectedSubVariant.storageType) || qs.storageType || "GB";
  pushIf(
    selectedSubVariant?.storage
      ? `${selectedSubVariant.storage} ${storageUnit} Storage`
      : null,
  );
  pushIf(qs.os || qs.operatingSystem);
  pushIf(qs.graphics);
  if (qs.warrantyDurationYears != null) {
    const type = qs.warrantyType ? String(qs.warrantyType).trim() : "Doorstep";
    pushIf(
      `${qs.warrantyDurationYears} ${qs.warrantyDurationYears === 1 ? "Year" : "Years"} ${type} Warranty`,
    );
  } else if (qs.warranty) {
    pushIf(`${qs.warranty} Year Doorstep Warranty`);
  }
  return Array.from(new Set(list.filter(Boolean))).slice(0, 9);
}

export function getIconForPill(pill: string): LucideIcon | null {
  const lower = String(pill).toLowerCase();
  if (/\bram\b|gb ram|memory/i.test(lower)) return MemoryStick;
  if (/storage|gb storage|ssd|hdd|nvme/i.test(lower)) return MemoryStick;
  if (/(graphics|gpu|nvidia|geforce|gtx|rtx|radeon|vega|intel uhd|iris|uhd|mx\d+|gt|tesla)/i.test(lower))
    return Gpu;
  if (/(processor|cpu|\bcore\b|ryzen|intel|amd|celeron|pentium|atom|apple|m\d+|i\d+)/i.test(lower))
    return Cpu;
  if (/refresh rate|hz/i.test(lower)) return RefreshCw;
  if (/warrant|\d+ *y|year|onsite/i.test(lower)) return BadgeCheck;
  if (/\bos\b|windows|linux|mac|operating system/i.test(lower)) return Monitor;
  return null;
}
