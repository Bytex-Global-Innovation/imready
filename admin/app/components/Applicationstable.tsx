import Link from "next/link";
import { DashboardSummary } from "../lib/api";

const STATUS_STYLES: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-600",
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
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Recent Applications</h2>
        <Link href="/applications" className="text-xs font-medium text-[#153a75] hover:underline">
          View all applications
        </Link>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="px-4 py-2 font-medium">Student Name</th>
              <th className="px-4 py-2 font-medium">Project ID</th>
              <th className="px-4 py-2 font-medium">Submitted</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-semibold text-white">
                      {app.studentName.charAt(0)}
                    </span>
                    <span className="text-gray-800 whitespace-nowrap">{app.studentName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{app.projectId}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{app.submittedAt}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${STATUS_STYLES[app.status]}`}>
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