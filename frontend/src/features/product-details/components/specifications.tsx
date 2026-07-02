"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ProductSpecs, ProductSubVariant } from "@/constants/product-detail";
import {
  PRODUCT_DETAIL_COPY,
  PRODUCT_DETAIL_SPEC_CLASSES,
} from "@/constants";
import { cn } from "@/lib/utils";

interface SpecItem {
  sub: string;
  head: string;
}

interface SpecGroup {
  label: string;
  content: SpecItem[];
  mobileContent: SpecItem[];
}

function getSpecificationTabs(
  specifications: ProductSpecs | null | undefined,
  selectedSubVariant: ProductSubVariant | null | undefined,
): SpecGroup[] {
  if (!specifications) return [];

  const val = (v: unknown) =>
    v === undefined || v === null || v === "" ? "-" : String(v);
  const appendUnit = (v: unknown, unit: string) => {
    const s = val(v);
    if (s === "-") return s;
    if (s.toLowerCase().includes(unit.toLowerCase())) return s;
    return `${s} ${unit}`;
  };

  const getWarrantyDisplay = (specs: ProductSpecs) => {
    if (specs.warrantyDurationYears != null) {
      const type = specs.warrantyType ? String(specs.warrantyType).toLowerCase() : "doorstep";
      const yrs = Number(specs.warrantyDurationYears);
      const yearLabel = Number.isNaN(yrs) ? "year" : yrs === 1 ? "year" : "years";
      return `${specs.warrantyDurationYears} ${yearLabel} ${type} warranty`;
    }
    return specs.warranty ? String(specs.warranty) : "-";
  };

  let orderIndex = 0;
  const itemsByKey: Record<
    string,
    { sub: string; head: string; group: string; idx: number }
  > = {};

  const isEmpty = (v: unknown) => {
    if (v === undefined || v === null) return true;
    const str = String(v).trim().toLowerCase();
    return str === "" || str === "-" || str === "na" || str === "n/a";
  };

  const add = (key: string, group: string, sub: string, head: unknown) => {
    if (isEmpty(head)) return;
    itemsByKey[key] = { sub, head: val(head), group, idx: orderIndex++ };
  };

  add("weight", "General", "Weight", specifications.weight);
  add("warranty", "Performance", "Warranty", getWarrantyDisplay(specifications));
  add(
    "ai",
    "General",
    "AI PC",
    specifications.aiSupport ? String(specifications.aiSupport).toUpperCase() : "-",
  );
  add(
    "screenSize",
    "Display",
    "Screen Size",
    specifications.screen?.screenSizeCM
      ? `${specifications.screen.screenSizeCM} cm (${specifications.screen.screenSizeInch || "-"})`
      : "-",
  );
  add("displayType", "Display", "Display Type", specifications.screen?.screenType);
  add(
    "screenResolution",
    "Display",
    "Screen Resolution",
    specifications.screen?.screenResolution,
  );
  add("processor", "Performance", "Processor", specifications.processor);
  add("ram", "Performance", "Memory", appendUnit(selectedSubVariant?.ram, "GB"));
  const storageUnit =
    (selectedSubVariant && selectedSubVariant.storageType) ||
    specifications.storageType ||
    "GB";
  add(
    "storage",
    "Performance",
    "Storage",
    appendUnit(selectedSubVariant?.storage, storageUnit),
  );
  add("battery", "Performance", "Battery", specifications.battery?.batteryCapacity);
  add("speakers", "Performance", "Speakers", specifications.speaker);
  add("microphones", "Performance", "Microphones", specifications.microphone);
  add("connectivity", "Performance", "Connectivity", specifications.connectivity);
  add(
    "operatingSystem",
    "Performance",
    "Operating System",
    specifications.operatingSystem || specifications.os,
  );
  add("graphics", "Performance", "Graphics", specifications.graphics || specifications.gpu);
  add(
    "camera",
    "Camera",
    "Camera",
    `Rear: ${val(specifications.camera?.rearCameraMp)} | Front: ${val(specifications.camera?.frontCameraMp)}`,
  );

  const allKeys = Object.keys(itemsByKey).sort(
    (a, b) => itemsByKey[a].idx - itemsByKey[b].idx,
  );

  const priority = [
    "processor",
    "ram",
    "storage",
    "operatingSystem",
    "graphics",
    "warranty",
    "camera",
    "battery",
    "speakers",
    "screenSize",
    "displayType",
    "screenResolution",
    "connectivity",
  ];
  const groupOrder = ["Performance", "Camera", "Display", "General"];
  const desktopContents: Record<string, SpecItem[]> = groupOrder.reduce(
    (acc, g) => ({ ...acc, [g]: [] }),
    {} as Record<string, SpecItem[]>,
  );
  const used = new Set<string>();
  for (const key of priority) {
    if (itemsByKey[key]) {
      const it = itemsByKey[key];
      desktopContents[it.group].push({ sub: it.sub, head: it.head });
      used.add(key);
    }
  }
  for (const key of allKeys) {
    if (used.has(key)) continue;
    const it = itemsByKey[key];
    if (!it) continue;
    desktopContents[it.group].push({ sub: it.sub, head: it.head });
    used.add(key);
  }

  const mobileContents: Record<string, SpecItem[]> = groupOrder.reduce(
    (acc, g) => ({ ...acc, [g]: [] }),
    {} as Record<string, SpecItem[]>,
  );
  for (const key of allKeys) {
    const it = itemsByKey[key];
    if (!it) continue;
    mobileContents[it.group].push({ sub: it.sub, head: it.head });
  }

  return [
    {
      label: "Performance & Warranty",
      content: desktopContents.Performance,
      mobileContent: mobileContents.Performance,
    },
    {
      label: "Camera",
      content: desktopContents.Camera,
      mobileContent: mobileContents.Camera,
    },
    {
      label: "Display",
      content: desktopContents.Display,
      mobileContent: mobileContents.Display,
    },
    {
      label: "General",
      content: desktopContents.General,
      mobileContent: mobileContents.General,
    },
  ];
}

interface SpecificationsProps {
  specifications: ProductSpecs;
  selectedSubVariant: ProductSubVariant | null | undefined;
  description?: string;
}

export function Specifications({
  specifications,
  selectedSubVariant,
  description,
}: SpecificationsProps) {
  const specificationGroups = useMemo(
    () => getSpecificationTabs(specifications, selectedSubVariant),
    [specifications, selectedSubVariant],
  );
  const [expanded, setExpanded] = useState(false);

  const performanceGroup = specificationGroups.find((g) =>
    String(g.label).toLowerCase().includes("performance"),
  );
  const groupsToRender = expanded
    ? specificationGroups
    : performanceGroup
      ? [performanceGroup]
      : specificationGroups.length
        ? [specificationGroups[0]]
        : [];

  const hasExtraGroups = (() => {
    if (!performanceGroup) return specificationGroups.length > 1;
    return specificationGroups.some(
      (g) =>
        g !== performanceGroup &&
        ((g.content || []).length > 0 || (g.mobileContent || []).length > 0),
    );
  })();

  if (!specifications) return null;

  return (
    <div className="mx-auto my-[-4px] max-w-7xl md:my-8">
      <h2 className="mb-1 ml-[-17px] mr-[-17px] text-left text-md font-semibold text-foreground md:hidden">
        {PRODUCT_DETAIL_COPY.allDetails}
      </h2>

      {description ? (
        <p className={PRODUCT_DETAIL_SPEC_CLASSES.mobileDescription}>{description}</p>
      ) : null}

      <div className={PRODUCT_DETAIL_SPEC_CLASSES.tableWrap}>
        <table className="hidden min-w-full table-fixed border-collapse text-base md:table">
          <thead>
            <tr>
              <th className={cn("w-1/3 min-w-[130px]", PRODUCT_DETAIL_SPEC_CLASSES.th)}>
                {PRODUCT_DETAIL_COPY.specificationColumn}
              </th>
              <th className={cn("min-w-[140px]", PRODUCT_DETAIL_SPEC_CLASSES.th)}>
                {PRODUCT_DETAIL_COPY.detailsColumn}
              </th>
            </tr>
          </thead>
          <tbody>
            {groupsToRender.length === 0 ? (
              <tr>
                <td className={PRODUCT_DETAIL_SPEC_CLASSES.emptyCell} colSpan={2}>
                  {PRODUCT_DETAIL_COPY.noSpecsAvailable}
                </td>
              </tr>
            ) : (
              groupsToRender.map(({ label, content }) => (
                <Fragment key={label}>
                  <tr className={PRODUCT_DETAIL_SPEC_CLASSES.groupRow}>
                    <td className={PRODUCT_DETAIL_SPEC_CLASSES.groupCell}>{label}</td>
                    <td className={PRODUCT_DETAIL_SPEC_CLASSES.groupSpacer} />
                  </tr>
                  {content.map((item, idx) => (
                    <tr key={`${label}-${idx}`} className={PRODUCT_DETAIL_SPEC_CLASSES.row}>
                      <td className={PRODUCT_DETAIL_SPEC_CLASSES.labelCell}>{item.sub}</td>
                      <td className={PRODUCT_DETAIL_SPEC_CLASSES.valueCell}>{item.head}</td>
                    </tr>
                  ))}
                </Fragment>
              ))
            )}
          </tbody>
        </table>

        <div className="px-4 py-4 md:hidden">
          {specificationGroups.every((g) => (g.mobileContent || []).length === 0) ? (
            <div className={PRODUCT_DETAIL_SPEC_CLASSES.mobileEmpty}>
              {PRODUCT_DETAIL_COPY.noSpecsAvailable}
            </div>
          ) : (
            <>
              <div className="overflow-hidden transition-all duration-300">
                {groupsToRender.map(({ label, mobileContent }) => {
                  let items = mobileContent || [];
                  if (label.toLowerCase().includes("performance")) {
                    const desiredOrder = [
                      "Processor",
                      "Memory",
                      "Storage",
                      "Operating System",
                      "Graphics",
                      "Warranty",
                    ];
                    items = [...items].sort((a, b) => {
                      const aIndex = desiredOrder.findIndex((key) =>
                        a.sub?.toLowerCase().includes(key.toLowerCase()),
                      );
                      const bIndex = desiredOrder.findIndex((key) =>
                        b.sub?.toLowerCase().includes(key.toLowerCase()),
                      );
                      if (aIndex === -1 && bIndex === -1) return 0;
                      if (aIndex === -1) return 1;
                      if (bIndex === -1) return -1;
                      return aIndex - bIndex;
                    });
                  }

                  const rows: SpecItem[][] = [];
                  items.forEach((item, idx) => {
                    if (idx % 2 === 0) rows.push([item]);
                    else rows[rows.length - 1].push(item);
                  });

                  return (
                    <div key={label} className="mb-2">
                      <div className={PRODUCT_DETAIL_SPEC_CLASSES.groupTitle}>{label}</div>
                      {rows.length === 0 ? (
                        <div className={cn("px-3 py-4", PRODUCT_DETAIL_SPEC_CLASSES.mobileEmpty)}>
                          {PRODUCT_DETAIL_COPY.noSpecData}
                        </div>
                      ) : (
                        rows.map((pair, ridx) => (
                          <div key={ridx} className="border-b py-4 last:border-b-0">
                            <div className="flex gap-4">
                              <div className="w-1/2 pr-2">
                                <div className={PRODUCT_DETAIL_SPEC_CLASSES.mobileLabel}>
                                  {pair[0]?.sub}
                                </div>
                                <div className={PRODUCT_DETAIL_SPEC_CLASSES.mobileValue}>
                                  {pair[0]?.head}
                                </div>
                              </div>
                              <div className="w-1/2 pl-2">
                                {pair[1] ? (
                                  <>
                                    <div className={PRODUCT_DETAIL_SPEC_CLASSES.mobileLabel}>
                                      {pair[1].sub}
                                    </div>
                                    <div className={PRODUCT_DETAIL_SPEC_CLASSES.mobileValue}>
                                      {pair[1].head}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>

              {hasExtraGroups ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setExpanded((s) => !s)}
                    aria-expanded={expanded}
                    className={PRODUCT_DETAIL_SPEC_CLASSES.showMoreBtn}
                  >
                    <span className={PRODUCT_DETAIL_SPEC_CLASSES.showMoreText}>
                      {expanded ? PRODUCT_DETAIL_COPY.showLess : PRODUCT_DETAIL_COPY.showMore}
                    </span>
                    <ChevronDown
                      className={cn(
                        PRODUCT_DETAIL_SPEC_CLASSES.showMoreIcon,
                        expanded && "rotate-180",
                      )}
                    />
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {hasExtraGroups ? (
        <div className="mt-6 hidden justify-center md:flex">
          <button
            type="button"
            onClick={() => setExpanded((s) => !s)}
            aria-expanded={expanded}
            className={PRODUCT_DETAIL_SPEC_CLASSES.showMoreDesktop}
          >
            <span className={PRODUCT_DETAIL_SPEC_CLASSES.showMoreText}>
              {expanded ? PRODUCT_DETAIL_COPY.showLess : PRODUCT_DETAIL_COPY.showMore}
            </span>
            <ChevronDown
              className={cn(
                PRODUCT_DETAIL_SPEC_CLASSES.showMoreIcon,
                "font-semibold",
                expanded && "rotate-180",
              )}
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
