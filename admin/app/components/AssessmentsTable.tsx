import { Pencil, Eye, Trash2, RotateCcw } from "lucide-react";
import { Assessment } from "@/app/lib/api";

const STATUS_CONFIG = {
  ACTIVE:   { dot: "bg-emerald-500", text: "text-emerald-600", label: "ACTIVE"    },
  DRAFT:    { dot: "bg-gray-400",    text: "text-gray-500",    label: "DRAFT"     },
  ARCHIVED: { dot: "bg-blue-400",    text: "text-blue-500",    label: "ARCHIVED"  },
} as const;

interface AssessmentsTableProps {
  assessments: Assessment[];
}

export default function AssessmentsTable({ assessments }: AssessmentsTableProps) {
  if (assessments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
        No assessments found.
      </div>
    );
  }

  return (
    <>
      {/* Mobile card view — below sm */}
      <div className="flex flex-col gap-3 sm:hidden">
        {assessments.map((a) => {
          const cfg = STATUS_CONFIG[a.status];
          return (
            <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#153a75]">{a.name}</p>
                  <p className="mt-0.5 truncate text-[10px] text-gray-400">UUID: {a.uuid}</p>
                </div>
                <span className={`flex shrink-0 items-center gap-1 text-[11px] font-semibold ${cfg.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                    {a.domain}
                  </span>
                  <span className="text-xs font-semibold text-gray-700">{a.passMarks}</span>
                </div>

                <div className="flex items-center gap-3">
                  {a.status === "ARCHIVED" ? (
                    <button aria-label={`Restore ${a.name}`} className="text-gray-400 hover:text-[#153a75] transition-colors">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  ) : (
                    <button aria-label={`Edit ${a.name}`} className="text-gray-400 hover:text-[#153a75] transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <button aria-label={`View ${a.name}`} className="text-gray-400 hover:text-[#153a75] transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button aria-label={`Delete ${a.name}`} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table — sm and above */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 sm:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Assessment Name</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Pass Marks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assessments.map((a) => {
              const cfg = STATUS_CONFIG[a.status];
              return (
                <tr key={a.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#153a75]">{a.name}</p>
                    <p className="text-[10px] text-gray-400">UUID: {a.uuid}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                      {a.domain}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                    {a.passMarks}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {a.status === "ARCHIVED" ? (
                        <button aria-label={`Restore ${a.name}`} className="text-gray-400 hover:text-[#153a75] transition-colors">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      ) : (
                        <button aria-label={`Edit ${a.name}`} className="text-gray-400 hover:text-[#153a75] transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      <button aria-label={`View ${a.name}`} className="text-gray-400 hover:text-[#153a75] transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button aria-label={`Delete ${a.name}`} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}