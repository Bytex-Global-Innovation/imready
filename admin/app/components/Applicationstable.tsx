import Link from "next/link";
import { DashboardSummary } from "../lib/api";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600",
  APPROVED: "bg-emerald-50 text-emerald-600",
  REJECTED: "bg-red-50 text-red-500",
};

interface ApplicationsTableProps {
  applications: DashboardSummary["recentApplications"];
}

export default function ApplicationsTable({ applications }: ApplicationsTableProps) {
  if (!applications) return null;

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
        No recent applications.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Recent Applications</h2>
        <Link href="/applications" className="text-xs font-medium text-violet-600 hover:underline">
          View all applications
        </Link>
      </div>

      {/* horizontal scroll wrapper keeps the table mobile-friendly, per Rule 5 */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-gray-400">
              <th className="pb-2 font-medium">Student Name</th>
              <th className="pb-2 font-medium">Project ID</th>
              <th className="pb-2 font-medium">Submitted</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="flex items-center gap-2 py-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[10px] font-semibold text-white">
                    {app.studentName.charAt(0)}
                  </span>
                  <span className="text-gray-800">{app.studentName}</span>
                </td>
                <td className="text-gray-500">{app.projectId}</td>
                <td className="text-gray-500">{app.submittedAt}</td>
                <td>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[app.status]}`}
                  >
                    {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}