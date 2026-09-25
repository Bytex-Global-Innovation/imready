import { getCachedStudentSession } from "@/lib/student-session";

export const TOTAL_MISSIONS = 5;

export type MissionAnswers = Record<string, string | string[] | undefined>;

export interface MissionEvidenceMeta {
  fileName: string | null;
  fileType: string | null;
  /** Not persisted across reloads — kept null; images live only in the live session. */
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
}

const STORAGE_PREFIX = "imready_foundation_progress";

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
  return { missions: {}, totalXp: 0 };
}

export function loadProgress(): FoundationProgress {
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
    };
  } catch {
    return emptyProgress();
  }
}

function persistProgress(progress: FoundationProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(progress));
  } catch {
    // quota / private mode — ignore, live session state still works
  }
}

export function getMissionRecord(missionId: number): MissionRecord {
  const progress = loadProgress();
  return progress.missions[missionId] ?? emptyRecord();
}

export function saveMissionDraft(
  missionId: number,
  answers: MissionAnswers,
  evidence: MissionEvidenceMeta | null,
): void {
  const progress = loadProgress();
  const existing = progress.missions[missionId] ?? emptyRecord();
  progress.missions[missionId] = {
    ...existing,
    answers,
    evidence,
    updatedAt: Date.now(),
  };
  persistProgress(progress);
}

export function completeMission(missionId: number, xpEarned: number): FoundationProgress {
  const progress = loadProgress();
  const existing = progress.missions[missionId] ?? emptyRecord();
  const wasAlreadyComplete = existing.completed;
  progress.missions[missionId] = {
    ...existing,
    completed: true,
    completedAt: existing.completedAt ?? Date.now(),
    xpEarned,
  };
  if (!wasAlreadyComplete) {
    progress.totalXp += xpEarned;
  }
  persistProgress(progress);
  return progress;
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
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey());
  } catch {
    // ignore
  }
}