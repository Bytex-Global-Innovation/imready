const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || "Something went wrong. Please try again.");
  }

  return res.json();
}

export function resolveMediaUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith("blob:")) {
    return pathOrUrl;
  }
  if (pathOrUrl.startsWith("/")) {
    return `${BASE_URL}${pathOrUrl}`;
  }
  return pathOrUrl;
}

export interface AssessmentOption {
  id: string;
  label: string;
}

export type AnswerType = "JUMBLED" | "PERSONAL" | "BOTH";

export interface AssessmentQuestion {
  id: number;
  uuid: string;
  title: string;
  prompt: string;
  question: string;
  tips: string[];
  category: "OBSERVATION" | "THINKING" | "BUILDING";
  answerType: AnswerType;
  options: AssessmentOption[];
}

export interface ActiveAssessment {
  id: string;
  questionCount: number;
  questionOrderMode: "sequential" | "random" | "jumbled";
  questions: AssessmentQuestion[];
}

export interface SubmitAssessmentPayload {
  studentName: string;
  email: string;
  collegeName: string;
  answers: {
    questionId: number;
    optionOrder: string[];
    personalResponse: string;
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

  list: (category?: ProjectCategory): Promise<{ projects: ApiProjectItem[] }> => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    const query = params.toString();
    return request<{ projects: ApiProjectItem[] }>(
      `/projects${query ? `?${query}` : ""}`,
    );
  },

  getBySlug: (slug: string): Promise<ApiProjectItem> =>
    request<ApiProjectItem>(`/projects/${slug}`),

  apply: (
    slug: string,
    payload: { studentName: string; studentEmail: string },
  ) =>
    request<{ id: string; status: string; projectSlug: string }>(
      `/projects/${slug}/apply`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
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

export const authApi = {
  signup: (payload: SignupPayload) =>
    request<{
      token: string;
      redirectTo: string;
      student: { id: string; email: string; studentName: string };
    }>("/auth/students/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
