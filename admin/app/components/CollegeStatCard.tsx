"use client";

import { useEffect, useRef } from "react";
import { LucideIcon } from "lucide-react";

interface CollegeStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  footnote?: string;
  progressPercent?: number;
}

export default function CollegeStatCard({
  label,
  value,
  icon: Icon,
  footnote,
  progressPercent,
}: CollegeStatCardProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current && progressPercent != null) {
      barRef.current.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
    }
  }, [progressPercent]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#153a75]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>
      {footnote ? <p className="mt-1 text-xs text-gray-500">{footnote}</p> : null}
      {progressPercent != null ? (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div ref={barRef} className="h-full rounded-full bg-[#153a75]" />
        </div>
      ) : null}
    </div>
  );
}
