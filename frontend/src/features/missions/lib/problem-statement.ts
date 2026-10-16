import { FOUNDATION_PROBLEM_STATEMENTS } from "@/constants/dashboard";
import { getCachedStudentSession } from "@/lib/student-session";

const KEY_PREFIX = "imready_foundation_problem";

function storageKey(): string {
  const id = getCachedStudentSession()?.student?.id;
  return `${KEY_PREFIX}:${id ? String(id) : "anon"}`;
}

export function getSelectedProblemStatement() {
  if (typeof window === "undefined") return null;
  try {
    const id = window.localStorage.getItem(storageKey());
    if (!id) return null;
    return FOUNDATION_PROBLEM_STATEMENTS.find((item) => item.id === id) ?? null;
  } catch {
    return null;
  }
}

export function setSelectedProblemStatement(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(), id);
  } catch {
    // quota / private mode: ignore
  }
  // TODO(backend): also send this id to the foundation API once your coworker adds a field for it.
}