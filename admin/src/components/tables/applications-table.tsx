import Link from "next/link";
import type { DashboardSummary } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-[#fff7ed] text-[#c2410c]",
  APPROVED: "bg-[#ecfdf5] text-[#047857]",
  REJECTED: "bg-[#fef2f2] text-[#b91c1c]",
};

interface ApplicationsTableProps {
  applications: DashboardSummary["recentApplications"];
  /** When true, omit the internal title row (parent already shows one). */
  hideHeader?: boolean;
}

export default function ApplicationsTable({
  applications,
  hideHeader = false,
}: ApplicationsTableProps) {
  if (!applications) return null;

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d7e0ef] bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-[#0b1c30]">No recent applications</p>
        <p className="mt-1 text-xs text-[#6b7280]">
          New submissions will show up here as students apply.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
      {!hideHeader ? (
        <div className="flex items-center justify-between border-b border-[#e8eef6] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#0b1c30]">Recent Applications</h2>
          <Link
            href="/applications"
            className="cursor-pointer text-xs font-semibold text-[#153a75] hover:underline"
          >
            View all
          </Link>
        </div>
      ) : null}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="bg-[#f8fafc] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8494]">
              <th className="px-5 py-3">Student Name</th>
              <th className="px-3 py-3">Project</th>
              <th className="px-3 py-3">Submitted</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, index) => (
              <tr
                key={app.id}
                className={`border-t border-[#eef2f7] transition-colors hover:bg-[#f8fafc] ${
                  index === 0 ? "border-t-0" : ""
                }`}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#153a75] text-xs font-semibold text-white">
                      {app.studentName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#0b1c30]">
                        {app.studentName}
                      </p>
                      {app.studentEmail ? (
                        <p className="truncate text-xs text-[#6b7280]">
                          {app.studentEmail}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 font-medium text-[#334155]">
                  {app.projectTitle || app.projectId}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-[#64748b]">
                  {app.submittedAt}
                </td>
                <td className="px-3 py-4">
                  <span
                    className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${
                      STATUS_STYLES[app.status] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/applications/${app.id}`}
                    className="inline-flex cursor-pointer items-center rounded-md border border-[#d7e0ef] px-2.5 py-1.5 text-xs font-semibold text-[#153a75] transition-colors hover:border-[#153a75] hover:bg-[#eff4ff]"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <ul className="divide-y divide-[#eef2f7] md:hidden">
        {applications.map((app) => (
          <li key={app.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#153a75] text-xs font-semibold text-white">
                  {app.studentName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#0b1c30]">
                    {app.studentName}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-[#334155]">
                    {app.projectTitle || app.projectId}
                  </p>
                  <p className="mt-1 text-xs text-[#64748b]">{app.submittedAt}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${
                    STATUS_STYLES[app.status] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                </span>
                <Link
                  href={`/applications/${app.id}`}
                  className="cursor-pointer text-xs font-semibold text-[#153a75] hover:underline"
                >
                  View
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {hideHeader ? (
        <div className="border-t border-[#eef2f7] px-4 py-3 sm:hidden">
          <Link
            href="/applications"
            className="flex cursor-pointer justify-center text-xs font-semibold text-[#153a75] hover:underline"
          >
            View all applications
          </Link>
        </div>
      ) : null}
    </div>
  );
}
