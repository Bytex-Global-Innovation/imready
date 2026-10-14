import { foundationApi } from "@/lib/foundation-api";
import { getCachedStudentSession } from "@/lib/student-session";

export const TOTAL_MISSIONS = 5;

export type MissionAnswers = Record<string, string | string[] | undefined>;

export interface MissionEvidenceMeta {
  fileName: string | null;
  fileType: string | null;
  filePath: string | null;
  previewDataUrl: string | null;
}

export interface MissionRecord {
  answers: MissionAnswers;
  evidence: MissionEvidenceMeta | null;
  completed: boolean;
  completedAt: number | null;
  xpEarned: number;
  updatedAt: number;
}

export interface FoundationProgress {
  missions: Record<number, MissionRecord>;
  totalXp: number;
  completedCount?: number;
  foundationComplete?: boolean;
  foundationCompletedAt?: string | null;
  projectsUnlocked?: boolean;
}

export interface CompleteMissionResult extends FoundationProgress {
  projectsUnlocked: boolean;
  xpAwarded: number;
}

const STORAGE_PREFIX = "imready_foundation_progress";

let cachedProgress: FoundationProgress | null = null;
let loadPromise: Promise<FoundationProgress> | null = null;

function studentScope(): string {
  const id = getCachedStudentSession()?.student?.id;
  return id ? String(id) : "anon";
}

function storageKey(): string {
  return `${STORAGE_PREFIX}:${studentScope()}`;
}

function emptyRecord(): MissionRecord {
  return {
    answers: {},
    evidence: null,
    completed: false,
    completedAt: null,
    xpEarned: 0,
    updatedAt: Date.now(),
  };
}

function emptyProgress(): FoundationProgress {
  return { missions: {}, totalXp: 0, completedCount: 0, foundationComplete: false };
}

function mapApiMission(record: {
  answers?: MissionAnswers;
  evidence?: MissionEvidenceMeta | null;
  completed?: boolean;
  completedAt?: number | null;
  xpEarned?: number;
  updatedAt?: number;
}): MissionRecord {
  return {
    answers: record.answers ?? {},
    evidence: record.evidence ?? null,
    completed: Boolean(record.completed),
    completedAt: record.completedAt ?? null,
    xpEarned: Number(record.xpEarned) || 0,
    updatedAt: record.updatedAt ?? Date.now(),
  };
}

function mapApiProgress(data: {
  missions: Record<string, MissionRecord>;
  totalXp: number;
  completedCount?: number;
  foundationComplete?: boolean;
  foundationCompletedAt?: string | null;
  projectsUnlocked?: boolean;
}): FoundationProgress {
  const missions: Record<number, MissionRecord> = {};
  Object.entries(data.missions || {}).forEach(([id, record]) => {
    missions[Number(id)] = mapApiMission(record);
  });
  return {
    missions,
    totalXp: Number(data.totalXp) || 0,
    completedCount: data.completedCount,
    foundationComplete: data.foundationComplete,
    foundationCompletedAt: data.foundationCompletedAt,
    projectsUnlocked: data.projectsUnlocked,
  };
}

function persistProgress(progress: FoundationProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(progress));
  } catch {
    // quota / private mode — ignore
  }
}

export function loadProgress(): FoundationProgress {
  if (cachedProgress) return cachedProgress;
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<FoundationProgress>;
    if (!parsed || typeof parsed !== "object" || !parsed.missions) {
      return emptyProgress();
    }
    return {
      missions: parsed.missions,
      totalXp: Number(parsed.totalXp) || 0,
      completedCount: parsed.completedCount,
      foundationComplete: parsed.foundationComplete,
      foundationCompletedAt: parsed.foundationCompletedAt,
      projectsUnlocked: parsed.projectsUnlocked,
    };
  } catch {
    return emptyProgress();
  }
}

export function hydrateFoundationProgress(progress: FoundationProgress): void {
  cachedProgress = progress;
  persistProgress(progress);
}

export async function ensureFoundationProgress(): Promise<FoundationProgress> {
  if (cachedProgress) return cachedProgress;
  if (loadPromise) return loadPromise;

  loadPromise = foundationApi
    .getProgress()
    .then((data) => {
      const progress = mapApiProgress(data);
      hydrateFoundationProgress(progress);
      return progress;
    })
    .catch(() => {
      const local = loadProgress();
      cachedProgress = local;
      return local;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

export function invalidateFoundationProgressCache(): void {
  cachedProgress = null;
  loadPromise = null;
}

export function getMissionRecord(missionId: number): MissionRecord {
  const progress = loadProgress();
  return progress.missions[missionId] ?? emptyRecord();
}

export function toEvidenceMeta(
  value: { fileName: string | null; filePath: string | null },
  fileType: string | null = null,
): MissionEvidenceMeta {
  return {
    fileName: value.fileName,
    fileType,
    filePath: value.filePath,
    previewDataUrl: null,
  };
}

function serializeEvidenceForApi(evidence: MissionEvidenceMeta | null) {
  if (!evidence) return null;
  return {
    fileName: evidence.fileName,
    fileType: evidence.fileType,
    filePath: evidence.filePath,
  };
}

export async function saveMissionDraft(
  missionId: number,
  answers: MissionAnswers,
  evidence: MissionEvidenceMeta | null,
): Promise<void> {
  const progress = loadProgress();
  const existing = progress.missions[missionId] ?? emptyRecord();
  const next: FoundationProgress = {
    ...progress,
    missions: {
      ...progress.missions,
      [missionId]: {
        ...existing,
        answers,
        evidence,
        updatedAt: Date.now(),
      },
    },
  };
  hydrateFoundationProgress(next);

  try {
    const result = await foundationApi.saveDraft(missionId, {
      answers,
      evidence: serializeEvidenceForApi(evidence),
    });
    if (result.progress) {
      hydrateFoundationProgress(mapApiProgress(result.progress));
    }
  } catch {
    // Keep optimistic local draft if offline
  }
}

export async function completeMission(
  missionId: number,
  answers: MissionAnswers,
  evidence: MissionEvidenceMeta | null,
): Promise<CompleteMissionResult> {
  const result = await foundationApi.completeMission(missionId, {
    answers,
    evidence: serializeEvidenceForApi(evidence),
  });
  const progress = mapApiProgress(result.progress);
  hydrateFoundationProgress(progress);

  return {
    ...progress,
    projectsUnlocked: Boolean(result.projectsUnlocked),
    xpAwarded: Number(result.xpAwarded) || 0,
  };
}

export function isMissionUnlocked(missionId: number): boolean {
  if (missionId <= 1) return true;
  const progress = loadProgress();
  return Boolean(progress.missions[missionId - 1]?.completed);
}

export function completedMissionCount(): number {
  const progress = loadProgress();
  return Object.values(progress.missions).filter((m) => m.completed).length;
}

export function isFoundationComplete(): boolean {
  const progress = loadProgress();
  if (progress.foundationComplete) return true;
  return completedMissionCount() >= TOTAL_MISSIONS;
}

export function firstIncompleteMissionId(): number {
  const progress = loadProgress();
  for (let id = 1; id <= TOTAL_MISSIONS; id += 1) {
    if (!progress.missions[id]?.completed) return id;
  }
  return TOTAL_MISSIONS;
}

export function getTotalXp(): number {
  return loadProgress().totalXp;
}

export function resetFoundationProgress(): void {
  invalidateFoundationProgressCache();
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey());
  } catch {
    // ignore
  }
}
