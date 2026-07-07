interface MentorStatCardProps {
  label: string;
  value: number | string;
  subtitle: string;
  progress: number; // 0-100
}

export default function MentorStatCard({
  label,
  value,
  subtitle,
  progress,
}: MentorStatCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white px-5 pt-4 pb-0 overflow-hidden">
      <div>
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {label}
          </p>
          <div className="h-8 w-8 rounded-full bg-gray-100" />
        </div>
        <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 mb-4 text-xs text-gray-400">{subtitle}</p>
      </div>
      {/* progress bar flush to card bottom */}
      <div className="h-1.5 w-full bg-gray-100">
        <div
          className="h-full rounded-full bg-[#153a75] transition-all"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}