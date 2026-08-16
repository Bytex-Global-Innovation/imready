import { CheckCircle2, Pencil, RotateCcw, X } from "@/components/icons";
import type { Student, SubscriptionStatus } from "@/lib/api";

const STATUS_CONFIG = {
  VERIFIED: { dot: "bg-emerald-500", text: "text-emerald-600", label: "VERIFIED" },
  PENDING:  { dot: "bg-amber-400",   text: "text-amber-500",   label: "PENDING"  },
  FLAGGED:  { dot: "bg-red-500",     text: "text-red-500",     label: "FLAGGED"  },
} as const;

const SUBSCRIPTION_CONFIG: Record<
  SubscriptionStatus,
  { className: string; label: string }
> = {
  FREE: {
    className: "bg-gray-100 text-gray-700",
    label: "Free",
  },
  PREMIUM_PENDING: {
    className: "bg-amber-50 text-amber-700",
    label: "Premium Pending",
  },
  PREMIUM: {
    className: "bg-emerald-50 text-emerald-700",
    label: "Premium",
  },
};

function subscriptionOf(student: Student): SubscriptionStatus {
  return student.subscriptionStatus || "FREE";
}

interface StudentsTableProps {
  students: Student[];
  onApprovePremium?: (student: Student) => void;
  onUndoPremium?: (student: Student) => void;
  onRejectPremium?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  actingId?: string | null;
}

export default function StudentsTable({
  students,
  onApprovePremium,
  onUndoPremium,
  onRejectPremium,
  onEditStudent,
  actingId,
}: StudentsTableProps) {
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
          const subscription = subscriptionOf(student);
          const subCfg = SUBSCRIPTION_CONFIG[subscription];
          return (
            <div key={student.id} className="admin-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400">#{student.id}</p>
                  <p className="font-semibold text-gray-900">{student.studentName}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{student.email}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{student.college}</p>
                </div>
                <RowActions
                  student={student}
                  onApprovePremium={onApprovePremium}
                  onUndoPremium={onUndoPremium}
                  onRejectPremium={onRejectPremium}
                  onEditStudent={onEditStudent}
                  actingId={actingId}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="admin-badge bg-blue-50 text-blue-600">{student.domain}</span>
                <span className="admin-badge bg-gray-100 text-gray-700">{student.level}</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
                <span className={`admin-badge ${subCfg.className}`}>{subCfg.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 sm:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr className="admin-table-header">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">College</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Subscription</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => {
              const statusCfg = STATUS_CONFIG[student.status];
              const subscription = subscriptionOf(student);
              const subCfg = SUBSCRIPTION_CONFIG[subscription];
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
                    <span className={`admin-badge ${subCfg.className}`}>{subCfg.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <RowActions
                        student={student}
                        onApprovePremium={onApprovePremium}
                        onUndoPremium={onUndoPremium}
                        onRejectPremium={onRejectPremium}
                        onEditStudent={onEditStudent}
                        actingId={actingId}
                      />
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

function RowActions({
  student,
  onApprovePremium,
  onUndoPremium,
  onRejectPremium,
  onEditStudent,
  actingId,
}: {
  student: Student;
  onApprovePremium?: (student: Student) => void;
  onUndoPremium?: (student: Student) => void;
  onRejectPremium?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  actingId?: string | null;
}) {
  const subscription = subscriptionOf(student);
  const isActing = actingId === student.id;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {subscription === "PREMIUM_PENDING" ? (
        <button
          type="button"
          aria-label={`Approve premium for ${student.studentName}`}
          title="Approve premium subscription"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isActing}
          onClick={() => onApprovePremium?.(student)}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {isActing ? "Working…" : "Approve"}
        </button>
      ) : null}

      {subscription === "PREMIUM" ? (
        <button
          type="button"
          aria-label={`Undo premium approval for ${student.studentName}`}
          title="Undo premium approval"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 shadow-sm transition-colors hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isActing}
          onClick={() => onUndoPremium?.(student)}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Undo
        </button>
      ) : null}

      {subscription === "PREMIUM_PENDING" || subscription === "PREMIUM" ? (
        <button
          type="button"
          aria-label={`Reject premium for ${student.studentName}`}
          title="Reject premium subscription"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isActing}
          onClick={() => onRejectPremium?.(student)}
        >
          <X className="h-3.5 w-3.5" />
          Reject
        </button>
      ) : null}

      <button
        type="button"
        aria-label={`Edit ${student.studentName}`}
        title="Edit student"
        className="admin-icon-btn"
        onClick={() => onEditStudent?.(student)}
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}
