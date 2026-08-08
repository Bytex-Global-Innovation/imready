import Link from "next/link";
import { Pencil, Eye, Trash2 } from "@/components/icons";
import type { Assessment } from "@/lib/api";

const STATUS_CONFIG = {
  ACTIVE:   { dot: "bg-emerald-500", text: "text-emerald-600", label: "ACTIVE"    },
  DRAFT:    { dot: "bg-gray-400",    text: "text-gray-500",    label: "DRAFT"     },
  ARCHIVED: { dot: "bg-blue-400",    text: "text-blue-500",    label: "ARCHIVED"  },
} as const;

interface AssessmentsTableProps {
  assessments: Assessment[];
  onDelete?: (id: string) => void;
}

export default function AssessmentsTable({ assessments, onDelete }: AssessmentsTableProps) {
  if (assessments.length === 0) {
    return (
      <div className="admin-card p-8 text-center text-sm text-gray-400">
        No assessments found.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:hidden">
        {assessments.map((a) => {
          const cfg = STATUS_CONFIG[a.status];
          return (
            <div key={a.id} className="admin-card p-4">
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
                <span className="text-xs font-semibold text-gray-700">{a.passMarks}</span>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/assessments/${a.id}/edit`}
                    aria-label={`Edit ${a.name}`}
                    className="admin-icon-btn"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/assessment-results"
                    aria-label={`View ${a.name}`}
                    className="admin-icon-btn"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    aria-label={`Delete ${a.name}`}
                    className="cursor-pointer text-gray-400 transition-colors hover:text-red-500"
                    onClick={() => onDelete?.(a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 sm:block">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr className="admin-table-header">
              <th className="px-4 py-3">Assessment Name</th>
              <th className="px-4 py-3">Pass Marks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assessments.map((a) => {
              const cfg = STATUS_CONFIG[a.status];
              return (
                <tr key={a.id} className="admin-table-row">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#153a75]">{a.name}</p>
                    <p className="text-[10px] text-gray-400">UUID: {a.uuid}</p>
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
                      <Link
                        href={`/assessments/${a.id}/edit`}
                        aria-label={`Edit ${a.name}`}
                        className="admin-icon-btn"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/assessment-results"
                        aria-label={`View ${a.name}`}
                        className="admin-icon-btn"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        aria-label={`Delete ${a.name}`}
                        className="cursor-pointer text-gray-400 transition-colors hover:text-red-500"
                        onClick={() => onDelete?.(a.id)}
                      >
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
