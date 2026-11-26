"use client";

/** Thin animated progress line for page / filter data fetches. */
export function TopLineLoader({
  show,
  className = "",
}: {
  show: boolean;
  className?: string;
}) {
  if (!show) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-30 h-0.5 overflow-hidden ${className}`}
      role="progressbar"
      aria-label="Loading"
      aria-busy="true"
    >
      <div className="h-full w-1/3 animate-[admin-nav-progress_1s_ease-in-out_infinite] rounded-full bg-[#3b6fb0]" />
    </div>
  );
}

/** Compact centered loader for initial panel loads. */
export function PanelLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 px-6 py-12">
      <div className="relative h-0.5 w-40 overflow-hidden rounded-full bg-[#e8eef6]">
        <div className="absolute inset-y-0 w-1/2 animate-[admin-nav-progress_1s_ease-in-out_infinite] rounded-full bg-[#3b6fb0]" />
      </div>
      <p className="text-sm font-medium text-[#5a7aa0]">{label}</p>
    </div>
  );
}
