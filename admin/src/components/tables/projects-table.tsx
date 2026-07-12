import { Eye, Pencil, Trash2 } from "@/components/icons";
import type { Project } from "@/lib/api";

const STATUS_CONFIG = {
  ACTIVE:   { className: "bg-[#153a75] text-white border-transparent"          },
  PENDING:  { className: "border border-gray-300 text-gray-500 bg-transparent" },
  REVIEW:   { className: "border border-gray-300 text-gray-500 bg-transparent" },
  ARCHIVED: { className: "bg-gray-200 text-gray-500 border-transparent"        },
} as const;

const DOMAIN_COLORS: Record<string, string> = {
  AI_ML:        "text-blue-600",
  BLOCKCHAIN:   "text-orange-500",
  CYBER_SEC:    "text-rose-500",
  CLOUD_COMP:   "text-teal-600",
  CRYPTOGRAPHY: "text-violet-600",
};

interface ProjectsTableProps {
  projects: Project[];
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        No projects found.
      </div>
    );
  }

  return (
    <>
      {/* Mobile card view — below sm */}
      <div className="flex flex-col divide-y divide-gray-100 sm:hidden">
        {projects.map((p) => {
          const statusCfg = STATUS_CONFIG[p.status];
          const domainColor = DOMAIN_COLORS[p.domain] ?? "text-gray-600";
          return (
            <div key={p.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-sm font-semibold text-gray-900">{p.name}</p>
                <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${statusCfg.className}`}>
                  {p.status}
                </span>
              </div>

              <p className={`mt-1 text-xs font-semibold ${domainColor}`}>{p.domain}</p>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${p.mentorInitialsColor}`}>
                    {p.mentorInitials}
                  </div>
                  <p className="text-xs text-gray-700">{p.mentorName}</p>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">
                    {String(p.teamSize).padStart(2, "0")}
                  </span>
                  <span>members</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-3">
                <button aria-label={`View ${p.name}`} className="admin-icon-btn">
                  <Eye className="h-4 w-4" />
                </button>
                <button aria-label={`Edit ${p.name}`} className="admin-icon-btn">
                  <Pencil className="h-4 w-4" />
                </button>
                <button aria-label={`Delete ${p.name}`} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table — sm and above */}
      <div className="hidden sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 admin-table-header">
              <th className="px-4 py-3">Project Name</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Mentor</th>
              <th className="px-4 py-3">Team Size</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map((p) => {
              const statusCfg = STATUS_CONFIG[p.status];
              const domainColor = DOMAIN_COLORS[p.domain] ?? "text-gray-600";
              return (
                <tr key={p.id} className="admin-table-row">
                  <td className="px-4 py-4">
                    <p className="font-mono font-semibold text-gray-900">{p.name}</p>
                  </td>

                  <td className="px-4 py-4">
                    <p className={`text-xs font-semibold tracking-wide ${domainColor}`}>
                      {p.domain}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${p.mentorInitialsColor}`}
                      >
                        {p.mentorInitials}
                      </div>
                      <p className="text-sm text-gray-700">{p.mentorName}</p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-800">
                      {String(p.teamSize).padStart(2, "0")}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <span className={`rounded px-2.5 py-1 text-[11px] font-semibold ${statusCfg.className}`}>
                      {p.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button aria-label={`View ${p.name}`} className="admin-icon-btn">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button aria-label={`Edit ${p.name}`} className="admin-icon-btn">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button aria-label={`Delete ${p.name}`} className="text-gray-400 hover:text-red-500 transition-colors">
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
