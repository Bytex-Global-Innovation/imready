import { Eye, Pencil } from "@/components/icons";
import type { Student } from "@/lib/api";

const STATUS_CONFIG = {
  VERIFIED: { dot: "bg-emerald-500", text: "text-emerald-600", label: "VERIFIED" },
  PENDING:  { dot: "bg-amber-400",   text: "text-amber-500",   label: "PENDING"  },
  FLAGGED:  { dot: "bg-red-500",     text: "text-red-500",     label: "FLAGGED"  },
} as const;

interface StudentsTableProps {
  students: Student[];
}

export default function StudentsTable({ students }: StudentsTableProps) {
  if (students.length === 0) {
    return (
      <div className="admin-card p-8 text-center text-sm text-gray-400">
        No students found.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:hidden">
        {students.map((student) => {
          const statusCfg = STATUS_CONFIG[student.status];
          return (
            <div key={student.id} className="admin-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400">#{student.id}</p>
                  <p className="font-semibold text-gray-900">{student.studentName}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{student.email}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{student.college}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button aria-label={`View ${student.studentName}`} className="admin-icon-btn">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button aria-label={`Edit ${student.studentName}`} className="admin-icon-btn">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="admin-badge bg-blue-50 text-blue-600">{student.domain}</span>
                <span className="admin-badge bg-gray-100 text-gray-700">{student.level}</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 sm:block">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr className="admin-table-header">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">College</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => {
              const statusCfg = STATUS_CONFIG[student.status];
              return (
                <tr key={student.id} className="admin-table-row">
                  <td className="px-4 py-3 text-xs text-gray-400">{student.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{student.studentName}</td>
                  <td className="px-4 py-3 text-gray-500">{student.email}</td>
                  <td className="px-4 py-3 text-gray-500">{student.college}</td>
                  <td className="px-4 py-3">
                    <span className="admin-badge bg-blue-50 text-blue-600">{student.domain}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{student.level}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button aria-label={`View ${student.studentName}`} className="admin-icon-btn">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button aria-label={`Edit ${student.studentName}`} className="admin-icon-btn">
                        <Pencil className="h-4 w-4" />
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
