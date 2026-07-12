"use client";

import { useEffect, useRef } from "react";
import type { LucideIcon } from "@/components/icons";

type SubtitleColor = "green" | "blue" | "gray";

const SUBTITLE_COLORS: Record<SubtitleColor, string> = {
  green: "text-emerald-500",
  blue:  "text-blue-500",
  gray:  "text-gray-400",
};

interface StatCardProps {
  label: string;
  value: number | string;
  /** Optional icon displayed in a colored badge. */
  icon?: LucideIcon;
  /** Small ID shown in the top-right corner. */
  id?: string;
  /** Text below the value. */
  footnote?: string;
  /** Progress bar percentage (0–100). Renders a bar at the bottom when provided. */
  progress?: number;
  /** Subtitle text displayed alongside value or below it. */
  subtitle?: string;
  /** Color variant for the subtitle text. */
  subtitleColor?: SubtitleColor;
  /** Whether the progress bar is flush to the card bottom (no bottom padding). */
  flushProgress?: boolean;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  id,
  footnote,
  progress,
  subtitle,
  subtitleColor = "gray",
  flushProgress = false,
}: StatCardProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current && progress != null) {
      barRef.current.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  }, [progress]);

  const formattedValue =
    typeof value === "number" ? value.toLocaleString("en-IN") : value;

  return (
    <div
      className={`admin-stat-card ${flushProgress ? "pb-0 overflow-hidden" : ""}`}
    >
      {/* Header row: label/icon or icon/id */}
      <div className="mb-3 flex items-start justify-between">
        {Icon ? (
          <>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#153a75]">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            {id ? (
              <span className="text-[10px] font-medium text-gray-400">
                ID: {id}
              </span>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {label}
            </p>
            <div className="h-8 w-8 rounded-full bg-gray-100" />
          </>
        )}
      </div>

      {/* Label shown below icon when icon is present */}
      {Icon && (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
      )}

      {/* Value row */}
      {subtitle && subtitleColor !== "gray" ? (
        <div className="mt-2 flex items-end justify-between">
          <p className="text-3xl font-bold text-gray-900">{formattedValue}</p>
          <p className={`mb-1 text-xs font-semibold ${SUBTITLE_COLORS[subtitleColor]}`}>
            {subtitle}
          </p>
        </div>
      ) : (
        <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          {formattedValue}
        </p>
      )}

      {/* Subtitle (when not inline with value) */}
      {subtitle && subtitleColor === "gray" && (
        <p className={`mt-1 text-xs ${SUBTITLE_COLORS[subtitleColor]}`}>
          {subtitle}
        </p>
      )}

      {/* Footnote */}
      {footnote && (
        <p className="mt-1 text-xs text-gray-500">{footnote}</p>
      )}

      {/* Progress bar */}
      {progress != null && (
        <div className={`h-1.5 w-full overflow-hidden rounded-full bg-gray-100 ${flushProgress ? "mt-4" : "mt-3"}`}>
          <div
            ref={barRef}
            className="h-full rounded-full bg-[#153a75] transition-all"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
    </div>
  );
}
