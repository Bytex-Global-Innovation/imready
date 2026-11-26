import { ChevronLeft, ChevronRight } from "@/components/icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Label for entries, e.g. "entries", "projects". Defaults to "entries". */
  entryLabel?: string;
}

function buildPageList(currentPage: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "…"> = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const page = sorted[i];
    const prev = sorted[i - 1];
    if (prev != null && page - prev > 1) result.push("…");
    result.push(page);
  }

  return result;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalEntries,
  pageSize,
  onPageChange,
  entryLabel = "entries",
}: PaginationProps) {
  if (totalEntries <= 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalEntries);
  const pages = buildPageList(currentPage, Math.max(1, totalPages));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#5a7aa0]">
        Showing{" "}
        <span className="font-semibold text-[#1e4f8c]">
          {from}–{to}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[#1e4f8c]">
          {totalEntries.toLocaleString()}
        </span>{" "}
        {entryLabel}
      </p>

      <div className="inline-flex items-center gap-1 rounded-full border border-[#cfe0f5] bg-white/90 p-1 shadow-sm">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#3b6fb0] transition-colors hover:bg-[#eaf3ff] disabled:cursor-not-allowed disabled:text-[#b7c6da] disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page, index) =>
          page === "…" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-xs font-medium text-[#7a94b3]"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              className={
                page === currentPage
                  ? "inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-full bg-[#3b6fb0] px-2.5 text-xs font-semibold text-white"
                  : "inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-full px-2.5 text-xs font-semibold text-[#3b6fb0] transition-colors hover:bg-[#eaf3ff]"
              }
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#3b6fb0] transition-colors hover:bg-[#eaf3ff] disabled:cursor-not-allowed disabled:text-[#b7c6da] disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
