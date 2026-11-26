"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/breadcrumb";
import {
  BLOCKERS,
  EFFORT_OPTIONS,
  INVOLVEMENT_OPTIONS,
  PROJECT_TYPE_GROUPS,
  PROJECT_TYPE_OTHER,
  READY_PHASES,
} from "@/constants/share-problem";
import { clientsApi, type ClientSubmission } from "@/lib/api";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function projectTypeLabel(id: string) {
  if (id === PROJECT_TYPE_OTHER) return "Other";
  for (const group of PROJECT_TYPE_GROUPS) {
    const found = group.options.find((option) => option.id === id);
    if (found) return found.label;
  }
  return id;
}

function blockerLabel(id: string, other: string) {
  const base = BLOCKERS.find((item) => item.id === id)?.label ?? id;
  if (id === "other" && other.trim()) return `${base} — ${other.trim()}`;
  return base;
}

function involvementLabel(id: string) {
  return INVOLVEMENT_OPTIONS.find((item) => item.id === id)?.label ?? id;
}

function effortLabel(id: string | null | undefined) {
  if (!id) return "—";
  return EFFORT_OPTIONS.find((item) => item.id === id)?.label ?? id;
}

function ideaStageLabel(value: string) {
  if (value === "rough") return "Rough idea";
  if (value === "defined") return "Defined problem";
  return value || "—";
}

function Field({
  label,
  value,
  helper,
}: {
  label: string;
  value: React.ReactNode;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-[#e8eef6] bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
        {label}
      </p>
      <div className="mt-1.5 text-sm font-medium whitespace-pre-wrap text-[#0b1c30]">
        {value || "—"}
      </div>
      {helper ? (
        <p className="mt-1 text-xs leading-5 text-[#7a94b3]">{helper}</p>
      ) : null}
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = params.id;

  const [detail, setDetail] = useState<ClientSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await clientsApi.getClient(clientId);
      setDetail(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load client.");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Clients", href: "/clients" },
    { label: detail?.name || "Client" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Breadcrumb items={breadcrumbs} />
        <div className="admin-skeleton h-36 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="admin-skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="admin-skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-5">
        <Breadcrumb items={breadcrumbs} />
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error || "Client submission not found."}
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center rounded-full border border-[#d7e0ef] bg-white px-4 py-2 text-sm font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
          onClick={() => router.push("/clients")}
        >
          ← Back to clients
        </button>
      </div>
    );
  }

  const projectTypeLabels = detail.projectTypes.map((id) =>
    id === PROJECT_TYPE_OTHER && detail.projectTypeOther.trim()
      ? `Other — ${detail.projectTypeOther.trim()}`
      : projectTypeLabel(id),
  );

  const readyByPhase = new Map(
    detail.readyPlan.map((item) => [item.phase, item]),
  );

  return (
    <div className="space-y-5">
      <Breadcrumb items={breadcrumbs} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-sm font-semibold text-white">
              {initials(detail.name)}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
                Share your problem
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c]">
                {detail.name}
              </h1>
              <p className="mt-1 text-sm text-[#5a7aa0]">
                Submitted {detail.submittedAtLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center rounded-full border border-[#d7e0ef] bg-white px-4 py-2 text-sm font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
            onClick={() => router.push("/clients")}
          >
            ← Back to clients
          </button>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
          Contact details
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Name"
            value={detail.name}
            helper="The person we should write to."
          />
          <Field
            label="Company"
            value={detail.company}
            helper="Company, studio, or the name you trade under."
          />
          <Field label="Email" value={detail.email} />
          <Field
            label="Phone / WhatsApp"
            value={detail.phone}
            helper="A number we can reach you on. WhatsApp is fine."
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
          Payment & problem
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="UPI transaction ID (UTR)"
            value={
              <span className="font-mono text-sm">{detail.paymentReference}</span>
            }
            helper="Find it in your UPI app's payment details. We match it manually."
          />
          <Field
            label="Rough idea or a defined problem?"
            value={ideaStageLabel(detail.ideaStage)}
            helper="Either is fine. With a rough idea, teams start by talking to users to sharpen it."
          />
          <div className="sm:col-span-2">
            <Field
              label="Problem description"
              value={detail.problem}
              helper="What's the problem, who has it, and what would a good demo show?"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
          Project type
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Tick every type that fits"
            value={
              projectTypeLabels.length > 0 ? (
                <ul className="list-disc space-y-1 pl-4">
                  {projectTypeLabels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              ) : (
                "—"
              )
            }
          />
          <Field
            label="Biggest blocker today"
            value={blockerLabel(detail.blocker, detail.blockerOther)}
            helper="What is most in the way of doing this yourself?"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
            How should the teams work?
          </h2>
          <p className="mt-1 text-sm text-[#5a7aa0]">
            Say how much they want to do themselves. Each phase stores
            involvement and effort.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white">
          <ul className="divide-y divide-[#eef2f7]">
            {READY_PHASES.map((phase) => {
              const saved = readyByPhase.get(phase.id);
              const involvement = saved?.involvement ?? "—";
              const effort =
                saved?.involvement === "skip"
                  ? null
                  : effortLabel(saved?.effort);
              return (
                <li key={phase.id} className="px-4 py-4 sm:px-5">
                  <p className="text-sm font-semibold text-[#0b1c30]">
                    {phase.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#7a94b3]">{phase.detail}</p>
                  <p className="mt-2 text-sm text-[#475569]">
                    {involvementLabel(involvement)}
                    {effort ? ` · Effort: ${effort}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
