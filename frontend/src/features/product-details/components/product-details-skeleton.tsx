export function ProductDetailsSkeleton() {
  return (
    <div className="mx-auto hidden min-h-[70vh] max-w-[1700px] animate-pulse bg-gray-50 p-4 lg:block">
      <div className="flex flex-col gap-8 border border-gray-200 bg-white p-4 lg:flex-row">
        <div className="flex min-w-[420px] gap-4 border-r border-gray-100 p-5">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-16 rounded-lg bg-gray-200" />
            ))}
          </div>
          <div className="h-[472px] flex-1 rounded-lg bg-gray-200" />
        </div>
        <div className="flex flex-1 flex-col gap-4 py-8 pl-6 pr-2">
          <div className="h-8 w-3/4 rounded bg-gray-200" />
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-36 rounded-lg bg-gray-100" />
            ))}
          </div>
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-10 w-48 rounded bg-gray-200" />
          <div className="h-8 w-28 rounded bg-gray-200" />
          <div className="flex gap-4">
            <div className="h-8 w-40 rounded-full bg-gray-200" />
            <div className="h-8 w-40 rounded-full bg-gray-200" />
          </div>
          <div className="mt-4 flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="h-3 w-14 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
