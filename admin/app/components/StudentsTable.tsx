import { Eye, Pencil } from "lucide-react";
import { Student } from "../lib/api";

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
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
        No students found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Student Name</th>
            <th className="px-4 py-3">College</th>
            <th className="px-4 py-3">Domain</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {students.map((student) => {
            const statusCfg = STATUS_CONFIG[student.status];
            return (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-400">{student.id}</td>

                <td className="px-4 py-3 font-semibold text-gray-900">
                  {student.studentName}
                </td>

                <td className="px-4 py-3 text-gray-500">{student.college}</td>

                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                    {student.domain}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      aria-label={`View ${student.studentName}`}
                      className="text-gray-400 hover:text-[#153a75] transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Edit ${student.studentName}`}
                      className="text-gray-400 hover:text-[#153a75] transition-colors"
                    >
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
  );
}