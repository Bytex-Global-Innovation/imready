import { getCachedStudentSession } from "@/lib/student-session";

export type AssessmentDraft = {
  assessmentId: string;
  questionIds: number[];
  questionIndex: number;
  answers: Record<string, string>;
  optionOrders: Record<string, string[]>;
  /** Epoch ms when the student first opened this assessment attempt. */
  startedAt: number;
  /** Question IDs locked after their per-question timer expired. */
  lockedQuestionIds: number[];
  /** Epoch ms when the student first entered each question. */
  questionEnteredAt: Record<string, number>;
  updatedAt: number;
};

const DRAFT_PREFIX = "imready_assessment_draft";

function studentScope(): string {
  const id = getCachedStudentSession()?.student?.id;
  return id ? String(id) : "anon";
}

function draftKey(assessmentId: string): string {
  return `${DRAFT_PREFIX}:${studentScope()}:${assessmentId}`;
}

function toStringKeyed(
  record: Record<number, string> | Record<number, string[]> | Record<number, number>,
): Record<string, string | string[] | number> {
  const out: Record<string, string | string[] | number> = {};
  for (const [key, value] of Object.entries(record)) {
    out[String(key)] = value;
  }
  return out;
}

function parseAnswers(raw: Record<string, unknown> | undefined): Record<number, string> {
  const out: Record<number, string> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, value] of Object.entries(raw)) {
    const id = Number(key);
    if (!Number.isFinite(id) || typeof value !== "string") continue;
    out[id] = value;
  }
  return out;
}

function parseOptionOrders(
  raw: Record<string, unknown> | undefined,
): Record<number, string[]> {
  const out: Record<number, string[]> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, value] of Object.entries(raw)) {
    const id = Number(key);
    if (!Number.isFinite(id) || !Array.isArray(value)) continue;
    if (!value.every((item) => typeof item === "string")) continue;
    out[id] = value;
  }
  return out;
}

function parseNumberMap(
  raw: Record<string, unknown> | undefined,
): Record<number, number> {
  const out: Record<number, number> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, value] of Object.entries(raw)) {
    const id = Number(key);
    const num = Number(value);
    if (!Number.isFinite(id) || !Number.isFinite(num)) continue;
    out[id] = num;
  }
  return out;
}

function parseLockedIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export function loadAssessmentDraft(
  assessmentId: string,
  questionIds: number[],
): AssessmentDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(draftKey(assessmentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AssessmentDraft>;
    if (parsed.assessmentId !== assessmentId) return null;

    const savedIds = Array.isArray(parsed.questionIds)
      ? parsed.questionIds.map(Number)
      : [];
    const sameSet =
      savedIds.length === questionIds.length &&
      questionIds.every((id) => savedIds.includes(id));
    if (!sameSet) {
      // Assessment question set changed — discard stale draft.
      clearAssessmentDraft(assessmentId);
      return null;
    }

    return {
      assessmentId,
      questionIds,
      questionIndex: Number(parsed.questionIndex) || 0,
      answers: parseAnswers(parsed.answers as Record<string, unknown>),
      optionOrders: parseOptionOrders(
        parsed.optionOrders as Record<string, unknown>,
      ),
      startedAt: Number(parsed.startedAt) || Date.now(),
      lockedQuestionIds: parseLockedIds(parsed.lockedQuestionIds),
      questionEnteredAt: parseNumberMap(
        parsed.questionEnteredAt as Record<string, unknown>,
      ),
      updatedAt: Number(parsed.updatedAt) || Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveAssessmentDraft(input: {
  assessmentId: string;
  questionIds: number[];
  questionIndex: number;
  answers: Record<number, string>;
  optionOrders: Record<number, string[]>;
  startedAt: number;
  lockedQuestionIds: number[];
  questionEnteredAt: Record<number, number>;
}): void {
  if (typeof window === "undefined") return;
  const payload: AssessmentDraft = {
    assessmentId: input.assessmentId,
    questionIds: input.questionIds,
    questionIndex: input.questionIndex,
    answers: toStringKeyed(input.answers) as Record<string, string>,
    optionOrders: toStringKeyed(input.optionOrders) as Record<string, string[]>,
    startedAt: input.startedAt,
    lockedQuestionIds: [...new Set(input.lockedQuestionIds)],
    questionEnteredAt: toStringKeyed(input.questionEnteredAt) as Record<
      string,
      number
    >,
    updatedAt: Date.now(),
  };
  try {
    window.localStorage.setItem(
      draftKey(input.assessmentId),
      JSON.stringify(payload),
    );
  } catch {
    // Quota / private mode — ignore; live session state still works.
  }
}

export function clearAssessmentDraft(assessmentId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftKey(assessmentId));
  } catch {
    // ignore
  }
}
