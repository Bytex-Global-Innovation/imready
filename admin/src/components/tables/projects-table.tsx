import Link from "next/link";
import { Pencil, Trash2 } from "@/components/icons";
import type { Project } from "@/lib/api";

const STATUS_CONFIG = {
  ACTIVE: { className: "bg-[#3b6fb0] text-white" },
  PENDING: { className: "bg-[#eef3f9] text-[#64748b]" },
  REVIEW: { className: "bg-amber-50 text-amber-700" },
  ARCHIVED: { className: "bg-slate-100 text-slate-500" },
} as const;

const DOMAIN_COLORS: Record<string, string> = {
  "artificial-intelligence": "bg-[#eaf3ff] text-[#1e4f8c]",
  "machine-learning": "bg-[#eef2ff] text-[#4338ca]",
  electronics: "bg-[#ecfdf5] text-[#047857]",
  product: "bg-[#eef3f9] text-[#475569]",
  AI_ML: "bg-[#eaf3ff] text-[#1e4f8c]",
  BLOCKCHAIN: "bg-[#fff7ed] text-[#c2410c]",
  CYBER_SEC: "bg-[#fef2f2] text-[#b91c1c]",
  CLOUD_COMP: "bg-[#ecfdf5] text-[#047857]",
  CRYPTOGRAPHY: "bg-[#eef2ff] text-[#4338ca]",
};

interface ProjectsTableProps {
  projects: Project[];
  onDelete?: (id: string) => void;
}

export default function ProjectsTable({ projects, onDelete }: ProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm font-medium text-[#0b1c30]">No projects found</p>
        <p className="mt-1 text-xs text-[#6b7280]">
          Create a new project to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="flex flex-col gap-3 p-4 sm:hidden">
        {projects.map((p) => {
          const statusCfg = STATUS_CONFIG[p.status];
          const domainClass =
            DOMAIN_COLORS[p.domain] ?? "bg-[#eef3f9] text-[#475569]";
          return (
            <div
              key={p.id}
              className="rounded-2xl border border-[#d7e0ef] bg-[linear-gradient(160deg,#ffffff_0%,#f7faff_100%)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[#0b1c30]">{p.name}</p>
                  <p className="mt-0.5 text-xs text-[#7a94b3]">
                    {p.companyName || "No company listed"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusCfg.className}`}
                >
                  {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${domainClass}`}
                >
                  {p.domain}
                </span>
                <span className="rounded-full bg-[#eef3f9] px-2.5 py-0.5 text-[11px] font-semibold text-[#475569]">
                  {p.isFree ? "Unpaid" : "Premium"}
                </span>
                <span className="text-xs text-[#5a7aa0]">
                  Team size {p.teamSize}
                </span>
              </div>

              <div className="mt-3 flex justify-end gap-2 border-t border-[#e8eef6] pt-3">
                <Link
                  href={`/projects/${p.id}/edit`}
                  aria-label={`Edit ${p.name}`}
                  className="inline-flex cursor-pointer rounded-md border border-[#d7e0ef] p-1.5 text-[#3b6fb0] transition-colors hover:bg-[#eaf3ff]"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  aria-label={`Delete ${p.name}`}
                  className="inline-flex cursor-pointer rounded-md border border-red-100 p-1.5 text-red-500 transition-colors hover:bg-red-50"
                  onClick={() => onDelete?.(p.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
              <th className="px-5 py-3.5">Project</th>
              <th className="px-3 py-3.5">Company</th>
              <th className="px-3 py-3.5">Domain</th>
              <th className="px-3 py-3.5">Access</th>
              <th className="px-3 py-3.5">Team Size</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const statusCfg = STATUS_CONFIG[p.status];
              const domainClass =
                DOMAIN_COLORS[p.domain] ?? "bg-[#eef3f9] text-[#475569]";
              return (
                <tr
                  key={p.id}
                  className="border-b border-[#eef2f7] transition-colors last:border-b-0 hover:bg-[#f7faff]"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#0b1c30]">{p.name}</p>
                  </td>
                  <td className="px-3 py-4 text-[#475569]">
                    {p.companyName || "—"}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${domainClass}`}
                    >
                      {p.domain}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-[#eef3f9] px-2.5 py-0.5 text-[11px] font-semibold text-[#475569]">
                      {p.isFree ? "Unpaid" : "Premium"}
                    </span>
                  </td>
                  <td className="px-3 py-4 font-medium text-[#334155]">
                    {p.teamSize}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusCfg.className}`}
                    >
                      {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/projects/${p.id}/edit`}
                        aria-label={`Edit ${p.name}`}
                        className="inline-flex cursor-pointer rounded-md border border-[#d7e0ef] p-1.5 text-[#3b6fb0] transition-colors hover:bg-[#eaf3ff]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        aria-label={`Delete ${p.name}`}
                        className="inline-flex cursor-pointer rounded-md border border-red-100 p-1.5 text-red-500 transition-colors hover:bg-red-50"
                        onClick={() => onDelete?.(p.id)}
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
