"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";
import {
  notificationsApi,
  type TeamInviteNotification,
} from "@/lib/api";

export default function NotificationsPage() {
  const [items, setItems] = useState<TeamInviteNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationsApi.list();
      setItems(result.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function respond(id: string, accept: boolean) {
    setBusyId(id);
    setError(null);
    setMessage(null);
    try {
      if (accept) {
        await notificationsApi.accept(id);
        setMessage("Invite accepted. You are now on the team.");
      } else {
        await notificationsApi.reject(id);
        setMessage("Invite declined.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update invite");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30]">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Team invites and requests from other students on ImReady.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="mb-4 rounded-lg border border-[#d3e4ff] bg-[#eff4ff] px-4 py-3 text-sm text-[#153a75]">
          {message}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm animate-pulse">
          Loading notifications…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-gray-500">No pending team invites right now.</p>
          <Link
            href={ROUTES.freeProjects}
            className="mt-3 inline-block text-sm font-semibold text-[#153a75] hover:underline"
          >
            Browse unpaid projects
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#153a75]">
                    Team invite
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[#0b1c30]">
                    {item.fromStudentName} invited you to join{" "}
                    <span className="text-[#153a75]">
                      {item.teamName || "their team"}
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Project: {item.projectTitle}
                    {item.projectCompanyName ? ` · ${item.projectCompanyName}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {item.createdAtLabel || "Recently"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void respond(item.id, true)}
                    className="rounded-lg bg-[#153a75] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {busyId === item.id ? "…" : "Accept"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void respond(item.id, false)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 disabled:opacity-50"
                  >
                    Decline
                  </button>
                  {item.projectSlug ? (
                    <Link
                      href={ROUTES.stage2ProjectTeam(item.projectSlug)}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-[#153a75] hover:underline"
                    >
                      View team
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
