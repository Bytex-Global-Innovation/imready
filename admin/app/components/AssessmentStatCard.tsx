interface AssessmentStatCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  subtitleColor: "green" | "blue" | "gray";
}

const SUBTITLE_COLORS = {
  green: "text-emerald-500",
  blue:  "text-blue-500",
  gray:  "text-gray-400",
} as const;

export default function AssessmentStatCard({
  label,
  value,
  subtitle,
  subtitleColor,
}: AssessmentStatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className={`mb-1 text-xs font-semibold ${SUBTITLE_COLORS[subtitleColor]}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}