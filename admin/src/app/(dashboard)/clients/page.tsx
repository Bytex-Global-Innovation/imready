"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import { PanelLoader } from "@/components/ui/line-loader";
import Pagination from "@/components/ui/pagination";
import { useDataLoader } from "@/hooks/use-data-loader";
import { clientsApi, type ClientSubmission } from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Clients" },
];

const PAGE_SIZE = 10;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function ideaStageLabel(value: string) {
  if (value === "rough") return "Rough idea";
  if (value === "defined") return "Defined problem";
  return value || "—";
}

function truncate(value: string, max = 72) {
  const text = value.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { begin, end } = useDataLoader();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const loadData = useCallback(
    async (page: number) => {
      begin();
      setIsLoading(true);
      setError(null);
      try {
        const data = await clientsApi.getClients(page, {
          search,
          pageSize: PAGE_SIZE,
        });
        setClients(data.clients);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setTotalEntries(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clients.");
      } finally {
        setIsLoading(false);
        end();
      }
    },
    [begin, end, search],
  );

  useEffect(() => {
    void loadData(currentPage);
  }, [loadData, currentPage]);

  const showEmpty = !isLoading && clients.length === 0;

  return (
    <div className="space-y-5">
      <Breadcrumb items={BREADCRUMBS} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-32 w-32 rounded-full bg-[#b7d4f5]/35" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
              People & work
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
              Clients
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#5a7aa0]">
              Founders who submitted the Share your problem form after reserving
              a spot. Synced live from landing submissions.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f5] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#3b6fb0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b6fb0]" />
            {totalEntries} submission{totalEntries === 1 ? "" : "s"}
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
        <div className="flex flex-col gap-3 border-b border-[#e8eef6] bg-[#f7faff] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7a94b3]">
            Search clients
          </p>
          <div className="relative w-full min-w-0 max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#7a94b3]" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Name, company, email, phone, or UTR"
              className="admin-input w-full pl-9"
            />
          </div>
        </div>

        {error ? (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <PanelLoader label="Loading clients…" />
        ) : showEmpty ? (
          <div className="flex min-h-[280px] items-center justify-center px-6 py-12 text-center">
            <div>
              <p className="text-sm font-medium text-[#0b1c30]">
                No client submissions yet
              </p>
              <p className="mt-1 text-xs text-[#6b7280]">
                When a founder submits Share your problem on the landing page,
                it will show up here.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e8eef6] bg-[#f7faff] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-3 py-3.5">Company</th>
                    <th className="px-3 py-3.5">Email</th>
                    <th className="px-3 py-3.5">Phone / WhatsApp</th>
                    <th className="px-3 py-3.5">UTR</th>
                    <th className="px-3 py-3.5">Idea stage</th>
                    <th className="px-3 py-3.5">Problem</th>
                    <th className="px-3 py-3.5">Submitted</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-[#eef2f7] transition-colors last:border-b-0 hover:bg-[#f7faff]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-[11px] font-semibold text-white">
                            {initials(client.name)}
                          </span>
                          <p className="truncate font-semibold text-[#0b1c30]">
                            {client.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-[#334155]">{client.company}</td>
                      <td className="px-3 py-4 text-[#334155]">{client.email}</td>
                      <td className="px-3 py-4 text-[#334155]">{client.phone}</td>
                      <td className="px-3 py-4 font-mono text-xs text-[#475569]">
                        {client.paymentReference}
                      </td>
                      <td className="px-3 py-4 text-[#334155]">
                        {ideaStageLabel(client.ideaStage)}
                      </td>
                      <td className="max-w-[220px] px-3 py-4 text-[#475569]">
                        {truncate(client.problem)}
                      </td>
                      <td className="px-3 py-4 text-[#64748b]">
                        {client.submittedAtLabel}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/clients/${client.id}`}
                          className="inline-flex cursor-pointer items-center rounded-full border border-[#d7e0ef] bg-white px-3 py-1.5 text-xs font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
                        >
                          View all
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-[#eef2f7] sm:hidden">
              {clients.map((client) => (
                <li key={client.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-[11px] font-semibold text-white">
                      {initials(client.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#0b1c30]">{client.name}</p>
                      <p className="truncate text-sm text-[#475569]">
                        {client.company}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#64748b]">
                        {client.email}
                      </p>
                      <p className="truncate text-xs text-[#64748b]">
                        {client.phone}
                      </p>
                      <p className="mt-2 font-mono text-[11px] text-[#475569]">
                        UTR: {client.paymentReference}
                      </p>
                      <p className="mt-1 text-xs text-[#64748b]">
                        {ideaStageLabel(client.ideaStage)} ·{" "}
                        {truncate(client.problem, 60)}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs text-[#7a94b3]">
                          {client.submittedAtLabel}
                        </span>
                        <Link
                          href={`/clients/${client.id}`}
                          className="inline-flex cursor-pointer items-center rounded-full border border-[#d7e0ef] bg-white px-3 py-1.5 text-xs font-semibold text-[#3b6fb0]"
                        >
                          View all
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-[#e8eef6] px-4 py-3 sm:px-5">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalEntries={totalEntries}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                entryLabel="clients"
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
