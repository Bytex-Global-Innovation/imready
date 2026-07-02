import { LucideIcon } from "lucide-react";

interface StatCardProps {
  id: string;
  label: string;
  value: number | string;
  icon: LucideIcon;
  footnote?: string;
}

export default function StatCard({ id, label, value, icon: Icon, footnote }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-violet-50 text-violet-600">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-medium text-gray-400">ID: {id}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      {footnote && (
        <p className="mt-1 border-t border-gray-100 pt-1 text-[11px] text-emerald-600">
          {footnote}
        </p>
      )}
    </div>
  );
}