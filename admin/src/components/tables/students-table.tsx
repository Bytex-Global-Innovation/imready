import { CheckCircle2, Eye, Pencil, X } from "@/components/icons";
import type { Student, SubscriptionStatus } from "@/lib/api";

const STATUS_CONFIG = {
  VERIFIED: { dot: "bg-emerald-500", text: "text-emerald-700", label: "Verified" },
  PENDING: { dot: "bg-amber-400", text: "text-amber-700", label: "Pending" },
  FLAGGED: { dot: "bg-red-500", text: "text-red-600", label: "Flagged" },
} as const;

const SUBSCRIPTION_CONFIG: Record<
  SubscriptionStatus,
  { className: string; label: string }
> = {
  FREE: {
    className: "bg-[#eef3f9] text-[#475569]",
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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

interface StudentsTableProps {
  students: Student[];
  onViewPremiumRequest?: (student: Student) => void;
  onApprovePremium?: (student: Student) => void;
  onRejectPremium?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  actingId?: string | null;
}

export default function StudentsTable({
  students,
  onViewPremiumRequest,
  onApprovePremium,
  onRejectPremium,
  onEditStudent,
  actingId,
}: StudentsTableProps) {
  if (students.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm font-medium text-[#0b1c30]">No students found</p>
        <p className="mt-1 text-xs text-[#6b7280]">
          Try adjusting search or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="flex flex-col gap-3 p-4 sm:hidden">
        {students.map((student) => {
          const statusCfg = STATUS_CONFIG[student.status];
          const subscription = subscriptionOf(student);
          const subCfg = SUBSCRIPTION_CONFIG[subscription];
          return (
            <div
              key={student.id}
              className="rounded-2xl border border-[#d7e0ef] bg-[linear-gradient(160deg,#ffffff_0%,#f7faff_100%)] p-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-xs font-semibold text-white">
                  {initials(student.studentName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#0b1c30]">
                    {student.studentName}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-[#5b6575]">
                    {student.email}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#7a94b3]">
                    {student.college}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eaf3ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#3b6fb0]">
                  {student.domain}
                </span>
                <span className="rounded-full bg-[#eef3f9] px-2.5 py-0.5 text-[11px] font-semibold text-[#475569]">
                  {student.level}
                </span>
                <span
                  className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${subCfg.className}`}
                >
                  {subCfg.label}
                </span>
              </div>
              <div className="mt-3 flex justify-end border-t border-[#e8eef6] pt-3">
                <RowActions
                  student={student}
                  onViewPremiumRequest={onViewPremiumRequest}
                  onApprovePremium={onApprovePremium}
                  onRejectPremium={onRejectPremium}
                  onEditStudent={onEditStudent}
                  actingId={actingId}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#e8eef6] bg-[#f7faff] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
              <th className="px-5 py-3.5">Student</th>
              <th className="px-3 py-3.5">College</th>
              <th className="px-3 py-3.5">Domain</th>
              <th className="px-3 py-3.5">Level</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-3 py-3.5">Subscription</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const statusCfg = STATUS_CONFIG[student.status];
              const subscription = subscriptionOf(student);
              const subCfg = SUBSCRIPTION_CONFIG[subscription];
              return (
                <tr
                  key={student.id}
                  className="border-b border-[#eef2f7] transition-colors last:border-b-0 hover:bg-[#f7faff]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-[11px] font-semibold text-white">
                        {initials(student.studentName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#0b1c30]">
                          {student.studentName}
                        </p>
                        <p className="truncate text-xs text-[#6b7280]">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[#475569]">{student.college}</td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-[#eaf3ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#3b6fb0]">
                      {student.domain}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-[#475569]">{student.level}</td>
                  <td className="px-3 py-4">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`}
                      />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${subCfg.className}`}
                    >
                      {subCfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end">
                      <RowActions
                        student={student}
                        onViewPremiumRequest={onViewPremiumRequest}
                        onApprovePremium={onApprovePremium}
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
  onViewPremiumRequest,
  onApprovePremium,
  onRejectPremium,
  onEditStudent,
  actingId,
}: {
  student: Student;
  onViewPremiumRequest?: (student: Student) => void;
  onApprovePremium?: (student: Student) => void;
  onRejectPremium?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  actingId?: string | null;
}) {
  const subscription = subscriptionOf(student);
  const isActing = actingId === student.id;
  const isEmailVerified = student.status === "VERIFIED";
  const canManagePremium = isEmailVerified;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {canManagePremium && subscription === "PREMIUM_PENDING" ? (
        <button
          type="button"
          aria-label={`View premium request for ${student.studentName}`}
          title="View premium plan request"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#cfe0f5] bg-[#eaf3ff] px-2.5 py-1.5 text-xs font-semibold text-[#1e4f8c] transition-colors hover:bg-[#dcecff] focus:outline-none focus:ring-2 focus:ring-[#3b6fb0]/30 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isActing}
          onClick={() => onViewPremiumRequest?.(student)}
        >
          <Eye className="h-3.5 w-3.5" />
          View Request
        </button>
      ) : null}

      {canManagePremium && subscription === "PREMIUM_PENDING" ? (
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

      {canManagePremium && subscription === "PREMIUM_PENDING" ? (
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
        className="inline-flex cursor-pointer rounded-md border border-[#d7e0ef] p-1.5 text-[#3b6fb0] transition-colors hover:bg-[#eaf3ff]"
        onClick={() => onEditStudent?.(student)}
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}
