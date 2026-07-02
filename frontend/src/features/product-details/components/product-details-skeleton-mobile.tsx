export function ProductDetailsSkeletonMobile() {
  return (
    <div className="block w-full animate-pulse bg-white pb-28 lg:hidden">
      <div className="h-64 w-full bg-gray-200" />
      <div className="mt-6 flex justify-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-2 w-2 rounded-full bg-gray-300" />
        ))}
      </div>
      <div className="space-y-4 px-4 pt-6">
        <div className="h-7 w-4/5 rounded bg-gray-200" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-3 w-full rounded bg-gray-100" />
          ))}
        </div>
        <div className="h-5 w-28 rounded bg-gray-200" />
        <div className="h-9 w-40 rounded bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded border border-gray-200 bg-gray-100" />
          <div className="h-6 w-6 rounded bg-gray-200" />
          <div className="h-8 w-8 rounded border border-gray-200 bg-gray-100" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex w-24 shrink-0 flex-col items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gray-200" />
              <div className="h-3 w-16 rounded bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="h-24 rounded-xl bg-gray-100" />
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex border-t border-gray-200 bg-white">
        <div className="h-[52px] flex-1 bg-gray-200" />
      </div>
    </div>
  );
}
