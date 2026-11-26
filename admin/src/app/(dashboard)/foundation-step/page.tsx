"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import ConfirmModal from "@/components/ui/confirm-modal";
import MissionEditor from "@/components/foundation-step/mission-editor";
import {
  foundationStepApi,
  type FoundationStepMissionConfig,
  type FoundationStepProblem,
} from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Foundation Step" },
];

const fieldControl =
  "w-full rounded-xl border border-[#cfe0f5] bg-white px-3 py-2.5 text-sm text-[#0b1c30] shadow-sm outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:ring-2 focus:ring-[#3b6fb0]/15";

function cloneMissionConfig(config: FoundationStepMissionConfig): FoundationStepMissionConfig {
  return {
    ...config,
    questions: config.questions.map((q) => ({ ...q })),
    patternTagOptions: config.patternTagOptions
      ? [...config.patternTagOptions]
      : config.patternTagOptions,
    whyLayerLabels: config.whyLayerLabels
      ? config.whyLayerLabels.map((w) => ({ ...w }))
      : config.whyLayerLabels,
    evidenceConfig: config.evidenceConfig ? { ...config.evidenceConfig } : config.evidenceConfig,
  };
}

export default function FoundationStepPage() {
  const [problems, setProblems] = useState<FoundationStepProblem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [missions, setMissions] = useState<FoundationStepMissionConfig[]>([]);
  const [activeMission, setActiveMission] = useState(1);
  const [missionDraft, setMissionDraft] = useState<FoundationStepMissionConfig | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [newStatement, setNewStatement] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const initialSelectDone = useRef(false);
  const syncTokenRef = useRef(0);

  const loadProblems = useCallback(async () => {
    setError(null);
    try {
      const data = await foundationStepApi.listProblems();
      setProblems(data.problemStatements);
      if (!initialSelectDone.current && data.problemStatements[0]) {
        initialSelectDone.current = true;
        setSelectedId(data.problemStatements[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load problems.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProblems();
  }, [loadProblems]);

  useEffect(() => {
    if (!selectedId) {
      setMissions([]);
      setMissionDraft(null);
      return;
    }

    setDetailLoading(true);
    setError(null);
    const token = ++syncTokenRef.current;

    foundationStepApi
      .getProblem(selectedId)
      .then((data) => {
        if (token !== syncTokenRef.current) return;
        setMissions(data.missions);
        const config =
          data.missions.find((m) => m.missionId === activeMission) ??
          data.missions[0] ??
          null;
        setMissionDraft(config ? cloneMissionConfig(config) : null);
      })
      .catch((err) => {
        if (token !== syncTokenRef.current) return;
        setError(
          err instanceof Error ? err.message : "Failed to load mission config.",
        );
      })
      .finally(() => {
        if (token === syncTokenRef.current) {
          setDetailLoading(false);
        }
      });
    // Only refetch when the selected problem changes — not when switching mission tabs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selectedProblem = problems.find((p) => p.id === selectedId) ?? null;
  const activeCount = problems.filter((p) => p.isActive).length;

  function handleMissionTabChange(missionId: number) {
    setActiveMission(missionId);
    const config = missions.find((m) => m.missionId === missionId);
    if (config) {
      setMissionDraft(cloneMissionConfig(config));
    }
  }

  async function handleCreateProblem(event: FormEvent) {
    event.preventDefault();
    const text = newStatement.trim();
    if (!text) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await foundationStepApi.createProblem({ statementText: text });
      setNewStatement("");
      await loadProblems();
      setSelectedId(result.problem.id);
      setMessage("Problem statement added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create problem.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(problem: FoundationStepProblem) {
    setError(null);
    setMessage(null);
    try {
      await foundationStepApi.updateProblem(problem.id, {
        isActive: !problem.isActive,
      });
      await loadProblems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update problem.");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      await foundationStepApi.deleteProblem(deleteId);
      if (selectedId === deleteId) {
        setSelectedId(null);
        setMissions([]);
        setMissionDraft(null);
      }
      setDeleteId(null);
      await loadProblems();
      setMessage("Problem statement deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete problem.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveMissionConfig() {
    if (!selectedId || !missionDraft) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const { mission } = await foundationStepApi.updateMission(
        selectedId,
        missionDraft.missionId,
        {
          tipAdvisorLabel: missionDraft.tipAdvisorLabel,
          tipQuote: missionDraft.tipQuote,
          analyzeContextText: missionDraft.analyzeContextText,
          patternTagOptions: missionDraft.patternTagOptions,
          whyLayerLabels: missionDraft.whyLayerLabels,
          questions: missionDraft.questions,
          evidenceConfig: missionDraft.evidenceConfig,
        },
      );
      setMissions((prev) =>
        prev.map((m) => (m.missionId === mission.missionId ? mission : m)),
      );
      setMissionDraft(cloneMissionConfig(mission));
      setMessage(`Mission ${mission.missionId} saved.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save mission config.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const deleteTarget = problems.find((p) => p.id === deleteId);

  return (
    <div className="space-y-5">
      <Breadcrumb items={BREADCRUMBS} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-32 w-32 rounded-full bg-[#b7d4f5]/35" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
              Stage 0 config
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
              Foundation Step
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5a7aa0]">
              Configure campus problem statements and the tips, tags, and answer
              fields students see in Missions 1–5.
            </p>
          </div>
          {!listLoading ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f5] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#3b6fb0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b6fb0]" />
              {problems.length} problem{problems.length === 1 ? "" : "s"} ·{" "}
              {activeCount} active
            </div>
          ) : null}
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <aside className="space-y-4">
          <form
            onSubmit={handleCreateProblem}
            className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]"
          >
            <div className="border-b border-[#e8eef6] bg-[#f7faff] px-4 py-3.5">
              <p className="text-sm font-semibold text-[#1e4f8c]">
                New problem statement
              </p>
              <p className="mt-0.5 text-xs text-[#7a94b3]">
                Shown to students at the start of Foundation.
              </p>
            </div>
            <div className="space-y-3 p-4">
              <textarea
                className={`${fieldControl} min-h-[96px] resize-y`}
                value={newStatement}
                onChange={(e) => setNewStatement(e.target.value)}
                placeholder="Describe the campus challenge students will investigate…"
                required
              />
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#3b6fb0] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e4f8c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add statement
              </button>
            </div>
          </form>

          <div className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
            <div className="border-b border-[#e8eef6] bg-[#f7faff] px-4 py-3.5">
              <p className="text-sm font-semibold text-[#1e4f8c]">Problem library</p>
              <p className="mt-0.5 text-xs text-[#7a94b3]">
                Select one to edit its missions
              </p>
            </div>
            {listLoading ? (
              <div className="space-y-2 p-4">
                <div className="admin-skeleton h-16 rounded-xl" />
                <div className="admin-skeleton h-16 rounded-xl" />
              </div>
            ) : problems.length === 0 ? (
              <p className="p-5 text-sm text-[#6b7280]">No problem statements yet.</p>
            ) : (
              <ul className="max-h-[min(60vh,520px)] divide-y divide-[#eef2f7] overflow-y-auto">
                {problems.map((problem) => {
                  const selected = selectedId === problem.id;
                  return (
                    <li
                      key={problem.id}
                      className={`border-l-4 transition-colors ${
                        selected
                          ? "border-l-[#3b6fb0] bg-[#f7faff]"
                          : "border-l-transparent hover:bg-[#f7faff]"
                      }`}
                    >
                      <div className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(problem.id)}
                          className="w-full cursor-pointer text-left"
                        >
                          <p className="text-sm leading-relaxed text-[#0b1c30]">
                            {problem.statementText}
                          </p>
                        </button>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              problem.isActive
                                ? "bg-[#ecfdf5] text-[#047857]"
                                : "bg-[#f1f5f9] text-[#64748b]"
                            }`}
                          >
                            {problem.isActive ? "Active" : "Inactive"}
                          </span>
                          <button
                            type="button"
                            className="cursor-pointer text-xs font-semibold text-[#3b6fb0] hover:underline"
                            onClick={() => void toggleActive(problem)}
                          >
                            Toggle status
                          </button>
                          <button
                            type="button"
                            className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                            onClick={() => setDeleteId(problem.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          {!selectedId || !selectedProblem ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-[#cfe0f5] bg-white p-8 text-center">
              <p className="max-w-sm text-sm text-[#6b7280]">
                Select a problem statement from the library to edit mission
                content, tips, and student fields.
              </p>
            </div>
          ) : detailLoading || !missionDraft ? (
            <div className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white p-5 shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
              <div className="space-y-3">
                <div className="admin-skeleton h-16 rounded-xl" />
                <div className="admin-skeleton h-10 rounded-xl" />
                <div className="admin-skeleton h-40 rounded-xl" />
              </div>
            </div>
          ) : (
            <MissionEditor
              problemTitle={selectedProblem.statementText}
              activeMission={activeMission}
              onMissionChange={handleMissionTabChange}
              draft={missionDraft}
              onDraftChange={setMissionDraft}
              onSave={saveMissionConfig}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete problem statement?"
        message={
          deleteTarget
            ? `Remove "${deleteTarget.statementText.slice(0, 80)}…" and all mission configs?`
            : ""
        }
        confirmLabel="Delete"
        isLoading={isSaving}
        onConfirm={confirmDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
