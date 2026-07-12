interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Label for entries, e.g. "entries", "projects", "mentors". Defaults to "entries". */
  entryLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalEntries,
  pageSize,
  onPageChange,
  entryLabel = "entries",
}: PaginationProps) {
  const from = (currentPage - 1) * pageSize + 1;
  const to   = Math.min(currentPage * pageSize, totalEntries);

  return (
    <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-3 sm:flex-row sm:items-center">
      <p className="text-xs text-gray-500">
        Showing{" "}
        <span className="font-medium text-[#153a75]">{from}-{to}</span>{" "}
        of{" "}
        <span className="font-medium text-[#153a75]">{totalEntries.toLocaleString()}</span>{" "}
        {entryLabel}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 transition-colors hover:border-[#153a75] hover:text-[#153a75] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ‹
        </button>
        <span className="rounded border border-[#153a75] px-3 py-1 text-xs font-medium text-[#153a75]">
          Page {String(currentPage).padStart(2, "0")} of {String(totalPages).padStart(3, "0")}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 transition-colors hover:border-[#153a75] hover:text-[#153a75] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </div>
  );
}
