import { invalidateFoundationProgressCache } from "@/features/missions/lib/mission-progress";
import { clearStudentSessionCache, setCachedStudentSession } from "@/lib/student-session";
import { clearLegacyStudentToken } from "@/lib/auth";

clearLegacyStudentToken();

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
/** Origin for static assets like /uploads (not versioned under /api/v1). */
const API_ORIGIN = BASE_URL.replace(/\/api\/v\d+$/i, "");

export class ApiError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

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

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
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

  if (res.status === 401 && auth && allowRefresh) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return request<T>(path, options, auth, false);
    }
    clearStudentSessionCache();
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    if (res.status === 401 && auth) {
      clearStudentSessionCache();
    }
    throw new ApiError(
      errorBody?.message || "Something went wrong. Please try again.",
      res.status,
      errorBody?.code,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export function resolveMediaUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith("blob:")) {
    return pathOrUrl;
  }
  if (pathOrUrl.startsWith("/")) {
    return `${API_ORIGIN}${pathOrUrl}`;
  }
  return pathOrUrl;
}

export interface AssessmentOption {
  id: string;
  label: string;
}

export type AnswerType =
  | "JUMBLED"
  | "PERSONAL"
  | "BOTH"
  | "MCQ"
  | "JUMBLED_MCQ"
  | "PERSONAL_MCQ"
  | "ALL";

export interface AssessmentQuestion {
  id: number;
  uuid: string;
  title: string;
  prompt: string;
  question: string;
  tips: string[];
  category: "OBSERVATION" | "THINKING" | "BUILDING";
  answerType: AnswerType;
  /** Optional per-question timer in seconds. null = no question lock timer. */
  durationSeconds?: number | null;
  options: AssessmentOption[];
  /** MCQ choices when answerType includes MCQ. */
  mcqOptions?: AssessmentOption[];
}

export interface ActiveAssessment {
  id: string;
  name: string;
  questionCount: number;
  questionOrderMode: "sequential" | "random" | "jumbled";
  /** Overall assessment time limit in minutes. */
  durationMinutes: number;
  /** Server clock for skew-aware timers. */
  serverNow?: string;
  questions: AssessmentQuestion[];
}

export interface SubmitAssessmentPayload {
  answers: {
    questionId: number;
    optionOrder: string[];
    personalResponse: string;
    mcqSelection?: string | null;
  }[];
}

export const assessmentApi = {
  getActive: (): Promise<ActiveAssessment> =>
    request<ActiveAssessment>("/assessments/active"),

  submit: (assessmentId: string, payload: SubmitAssessmentPayload) =>
    request<{ id: string; uuid: string; status: string }>(
      `/assessments/${assessmentId}/submit`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true,
    ),
};

export type ProjectCategory = string;

export interface ApiProjectCategory {
  id: string;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface ApiProjectItem {
  id: string;
  dbId?: string;
  category: ProjectCategory;
  badge: string;
  isFree?: boolean;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  requirements: string[];
  techStack: { label: string }[];
  estimatedTime?: string;
  level?: string;
  overview?: string;
  briefRequirements?: string[];
  deliverables?: { id: string; label: string }[];
  evaluationCriteria?: { label: string; percent: number }[];
  resources?: { label: string; type: "pdf" | "zip"; href: string }[];
}

export const projectsApi = {
  listCategories: (): Promise<{ categories: ApiProjectCategory[] }> =>
    request<{ categories: ApiProjectCategory[] }>("/projects/categories"),

  list: (
    category?: ProjectCategory,
    access?: "free" | "premium",
  ): Promise<{ projects: ApiProjectItem[] }> => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (access) params.set("access", access);
    const query = params.toString();
    return request<{ projects: ApiProjectItem[] }>(
      `/projects${query ? `?${query}` : ""}`,
    );
  },

  getBySlug: (slug: string, access?: "free" | "premium"): Promise<ApiProjectItem> => {
    const query = access ? `?access=${access}` : "";
    return request<ApiProjectItem>(`/projects/${slug}${query}`);
  },

  apply: (slug: string) =>
    request<{ id: string; status: string; projectSlug: string }>(
      `/projects/${slug}/apply`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
      true,
    ),
};

export interface SignupPayload {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  college: string;
  streamMajor: string;
  graduationYear: string;
  targetDomain: string;
  careerDoor: string;
  agreedToTerms: boolean;
}

export interface StudentProfile {
  id: string;
  uuid?: string;
  studentName: string;
  email: string;
  phone?: string;
  college?: string;
  collegeName?: string;
  streamMajor?: string;
  graduationYear?: string;
  domain?: string;
  level?: string;
  careerDoor?: string;
  status?: string;
  emailVerified?: boolean;
  subscriptionStatus?: "FREE" | "PREMIUM_PENDING" | "PREMIUM";
  premiumApprovedAt?: string | null;
  premiumPaymentScreenshot?: string | null;
  premiumPaymentSubmittedAt?: string | null;
  foundationCompletedAt?: string | null;
  foundationComplete?: boolean;
  projectsUnlocked?: boolean;
}

export interface AuthSession {
  student: StudentProfile;
  redirectTo: string;
  projectsUnlocked?: boolean;
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    request<{
      message: string;
      email: string;
      requiresVerification: boolean;
      emailSent?: boolean;
      emailPreviewUrl?: string;
      devVerifyUrl?: string;
      redirectTo: string;
    }>("/auth/students/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: async (payload: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<AuthSession> => {
    const result = await request<AuthSession>("/auth/students/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setCachedStudentSession({
      student: result.student,
      projectsUnlocked: Boolean(result.projectsUnlocked),
    });
    return result;
  },

  verifyEmail: async (token: string): Promise<AuthSession> => {
    const result = await request<AuthSession>("/auth/students/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    setCachedStudentSession({
      student: result.student,
      projectsUnlocked: Boolean(result.projectsUnlocked),
    });
    return result;
  },

  resendVerification: (email: string) =>
    request<{ message: string }>("/auth/students/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/students/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: { token: string; password: string }) =>
    request<{ message: string }>("/auth/students/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: (): Promise<{
    student: StudentProfile;
    projectsUnlocked: boolean;
    redirectTo: string;
  }> => request("/auth/students/me", {}, true),

  requestPremium: async (): Promise<{
    message: string;
    student: StudentProfile;
    projectsUnlocked: boolean;
  }> => {
    const result = await request<{
      message: string;
      student: StudentProfile;
      projectsUnlocked: boolean;
    }>("/auth/students/request-premium", { method: "POST" }, true);
    setCachedStudentSession({
      student: result.student,
      projectsUnlocked: Boolean(result.projectsUnlocked),
    });
    return result;
  },

  submitPremiumPayment: async (
    screenshot: File,
  ): Promise<{
    message: string;
    student: StudentProfile;
    projectsUnlocked: boolean;
  }> => {
    const formData = new FormData();
    formData.append("screenshot", screenshot);
    const result = await request<{
      message: string;
      student: StudentProfile;
      projectsUnlocked: boolean;
    }>(
      "/auth/students/submit-premium-payment",
      { method: "POST", body: formData },
      true,
    );
    setCachedStudentSession({
      student: result.student,
      projectsUnlocked: Boolean(result.projectsUnlocked),
    });
    return result;
  },

  refresh: () =>
    request<AuthSession>("/auth/students/refresh", { method: "POST" }, false),

  logout: async () => {
    try {
      await request<{ message: string }>(
        "/auth/students/logout",
        { method: "POST" },
        false,
        false,
      );
    } catch {
      // Still clear local session if the network call fails.
    }
    clearStudentSessionCache();
    invalidateFoundationProgressCache();
  },
};
