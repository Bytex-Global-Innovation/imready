const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

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
}

async function foundationRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || "Something went wrong. Please try again.");
  }

  return res.json();
}

export const foundationApi = {
  getProgress: (): Promise<FoundationProgressResponse> =>
    foundationRequest<FoundationProgressResponse>("/foundation/progress"),

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
