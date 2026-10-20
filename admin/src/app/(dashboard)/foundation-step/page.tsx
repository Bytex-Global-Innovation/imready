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
    loadProblems();
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
          data.missions.find((m) => m.missionId === activeMission) ?? data.missions[0] ?? null;
        setMissionDraft(config ? cloneMissionConfig(config) : null);
      })
      .catch((err) => {
        if (token !== syncTokenRef.current) return;
        setError(err instanceof Error ? err.message : "Failed to load mission config.");
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
    try {
      const result = await foundationStepApi.createProblem({ statementText: text });
      setNewStatement("");
      await loadProblems();
      setSelectedId(result.problem.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create problem.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(problem: FoundationStepProblem) {
    setError(null);
    try {
      await foundationStepApi.updateProblem(problem.id, { isActive: !problem.isActive });
      await loadProblems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update problem.");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setIsSaving(true);
    setError(null);
    try {
      await foundationStepApi.deleteProblem(deleteId);
      if (selectedId === deleteId) {
        setSelectedId(null);
        setMissions([]);
        setMissionDraft(null);
      }
      setDeleteId(null);
      await loadProblems();
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
    try {
      const { mission } = await foundationStepApi.updateMission(selectedId, missionDraft.missionId, {
        tipAdvisorLabel: missionDraft.tipAdvisorLabel,
        tipQuote: missionDraft.tipQuote,
        analyzeContextText: missionDraft.analyzeContextText,
        patternTagOptions: missionDraft.patternTagOptions,
        questions: missionDraft.questions,
        evidenceConfig: missionDraft.evidenceConfig,
      });
      setMissions((prev) =>
        prev.map((m) => (m.missionId === mission.missionId ? mission : m)),
      );
      setMissionDraft(cloneMissionConfig(mission));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save mission config.");
    } finally {
      setIsSaving(false);
    }
  }

  const deleteTarget = problems.find((p) => p.id === deleteId);

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-page-title">Foundation Step</h1>
          <p className="admin-page-subtitle max-w-2xl">
            Configure campus problem statements and the questions, tips, and placeholders students
            see in Missions 1–5.
          </p>
        </div>
        {problems.length > 0 ? (
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{problems.length}</span> problem
            {problems.length === 1 ? "" : "s"}
            {" · "}
            <span className="font-semibold text-emerald-700">
              {problems.filter((p) => p.isActive).length}
            </span>{" "}
            active
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <aside className="space-y-4">
          <form
            onSubmit={handleCreateProblem}
            className="admin-card overflow-hidden"
          >
            <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">New problem statement</p>
              <p className="text-xs text-gray-500">Shown to students at the start of Foundation.</p>
            </div>
            <div className="space-y-3 p-4">
              <textarea
                className="admin-input min-h-[96px] w-full resize-y"
                value={newStatement}
                onChange={(e) => setNewStatement(e.target.value)}
                placeholder="Describe the campus challenge students will investigate..."
                required
              />
              <button type="submit" className="admin-btn-primary w-full gap-2" disabled={isSaving}>
                <Plus className="h-4 w-4" />
                Add statement
              </button>
            </div>
          </form>

          <div className="admin-card overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">Problem library</p>
            </div>
            {listLoading ? (
              <div className="space-y-2 p-4">
                <div className="admin-skeleton h-16 rounded-lg" />
                <div className="admin-skeleton h-16 rounded-lg" />
              </div>
            ) : problems.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No problem statements yet.</p>
            ) : (
              <ul className="max-h-[min(60vh,520px)] divide-y divide-gray-100 overflow-y-auto">
                {problems.map((problem) => {
                  const selected = selectedId === problem.id;
                  return (
                    <li
                      key={problem.id}
                      className={`border-l-4 transition-colors ${
                        selected
                          ? "border-l-[#153a75] bg-blue-50/70"
                          : "border-l-transparent hover:bg-gray-50"
                      }`}
                    >
                      <div className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(problem.id)}
                          className="w-full text-left"
                        >
                          <p className="text-sm leading-relaxed text-gray-800">
                            {problem.statementText}
                          </p>
                        </button>
                        <div className="mt-2 flex flex-wrap items-center gap-2 pl-0">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              problem.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {problem.isActive ? "Active" : "Inactive"}
                          </span>
                          <button
                            type="button"
                            className="text-xs font-medium text-[#153a75] hover:underline"
                            onClick={() => toggleActive(problem)}
                          >
                            Toggle status
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
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
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="max-w-sm text-sm text-gray-500">
                Select a problem statement from the library to edit mission content, tips, and
                student placeholders.
              </p>
            </div>
          ) : detailLoading || !missionDraft ? (
            <div className="admin-card flex min-h-[320px] items-center justify-center p-8">
              <p className="text-sm text-gray-500">Loading mission configuration…</p>
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
    </>
  );
}
