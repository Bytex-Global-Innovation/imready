import { clearStudentSessionCache } from "@/lib/student-session";

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export class FoundationApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export interface FoundationEvidence {
  fileName: string | null;
  fileType: string | null;
  filePath: string | null;
  fileUrl?: string | null;
  previewDataUrl?: string | null;
}

export interface FoundationMissionPayload {
  answers: Record<string, string | string[] | undefined>;
  evidence: FoundationEvidence | null;
}

export interface FoundationProblemStatement {
  id: string;
  uuid?: string;
  statementText: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface FoundationMissionJourneyConfig {
  id: string;
  missionId: number;
  tipAdvisorLabel: string;
  tipQuote: string;
  analyzeContextText: string | null;
  patternTagOptions: string[] | null;
  whyLayerLabels: { key: string; label: string }[] | null;
  questions: Array<{
    answerKey: string;
    question?: string;
    label?: string;
    helper?: string;
    placeholder?: string;
  }>;
  evidenceConfig: Record<string, string> | null;
}

export interface FoundationJourneyContent {
  selectedProblemStatement: FoundationProblemStatement | null;
  missions: Record<string, FoundationMissionJourneyConfig>;
}

export interface FoundationStageFrameworkPart {
  part: string;
  letter: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface FoundationProgressResponse {
  missions: Record<
    string,
    {
      answers: Record<string, string | string[] | undefined>;
      evidence: FoundationEvidence | null;
      completed: boolean;
      completedAt: number | null;
      xpEarned: number;
      updatedAt: number;
    }
  >;
  totalXp: number;
  completedCount: number;
  totalMissions: number;
  foundationComplete: boolean;
  foundationCompletedAt: string | null;
  projectsUnlocked: boolean;
  selectedProblemStatement?: FoundationProblemStatement | null;
  foundationProblemStatementId?: string | null;
}

let refreshInFlight: Promise<boolean> | null = null;

/** Same refresh call api.ts uses: renews the access cookie from the refresh cookie. */
async function tryRefreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/students/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function foundationRequest<T>(
  path: string,
  options: RequestInit = {},
  allowRefresh = true,
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && allowRefresh) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return foundationRequest<T>(path, options, false);
    }
    clearStudentSessionCache();
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message =
      res.status === 401
        ? "Your session has expired. Please log in again."
        : errorBody?.message || "Something went wrong. Please try again.";
    throw new FoundationApiError(message, res.status, errorBody?.code);
  }

  return res.json();
}

export const foundationApi = {
  getProgress: (): Promise<FoundationProgressResponse> =>
    foundationRequest<FoundationProgressResponse>("/foundation/progress"),

  listProblemStatements: (): Promise<{ problemStatements: FoundationProblemStatement[] }> =>
    foundationRequest<{ problemStatements: FoundationProblemStatement[] }>(
      "/foundation/problem-statements",
    ),

  getJourneyContent: (): Promise<FoundationJourneyContent> =>
    foundationRequest<FoundationJourneyContent>("/foundation/journey-content"),

  getStageFramework: (): Promise<{ parts: FoundationStageFrameworkPart[] }> =>
    foundationRequest<{ parts: FoundationStageFrameworkPart[] }>("/foundation/stage-framework"),

  selectProblemStatement: (problemStatementId: string): Promise<FoundationJourneyContent> => {
    const id = Number(problemStatementId);
    if (!Number.isInteger(id) || id <= 0) {
      return Promise.reject(
        new FoundationApiError("Invalid problem statement selection.", 400, "INVALID_PROBLEM_ID"),
      );
    }
    return foundationRequest<FoundationJourneyContent>("/foundation/problem-statement", {
      method: "POST",
      body: JSON.stringify({ problemStatementId: id }),
    });
  },

  uploadEvidence: (missionId: number, file: File) => {
    const formData = new FormData();
    formData.append("evidence", file);
    return foundationRequest<{
      evidence: FoundationEvidence;
      progress: FoundationProgressResponse;
    }>(`/foundation/missions/${missionId}/evidence`, {
      method: "POST",
      body: formData,
    });
  },

  saveDraft: (missionId: number, payload: FoundationMissionPayload) =>
    foundationRequest<{ progress: FoundationProgressResponse }>(
      `/foundation/missions/${missionId}/draft`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),

  completeMission: (missionId: number, payload: FoundationMissionPayload) =>
    foundationRequest<{
      progress: FoundationProgressResponse;
      projectsUnlocked: boolean;
      xpAwarded: number;
    }>(`/foundation/missions/${missionId}/complete`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};