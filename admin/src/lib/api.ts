import {
  clearAdminSession,
  clearLegacyAdminToken,
  setAdminSessionExpiresAt,
} from "@/lib/auth";

clearLegacyAdminToken();

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
/** Origin for static assets like /uploads (not versioned under /api/v1). */
const API_ORIGIN = BASE_URL.replace(/\/api\/v\d+$/i, "");
/** Use mock data when explicitly enabled or when no API URL is configured (local dev). */
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
  (process.env.NEXT_PUBLIC_USE_MOCK !== "false" && BASE_URL === "");

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

function redirectToLogin() {
  clearAdminSession();
  if (typeof window !== "undefined" && window.location.pathname !== "/") {
    window.location.replace("/");
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    redirectToLogin();
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const error = new Error(
      errorBody?.message || "Something went wrong. Please try again.",
    ) as Error & { errors?: unknown };
    if (Array.isArray(errorBody?.errors)) {
      error.errors = errorBody.errors;
    }
    throw error;
  }

  return res.json();
}

// Fake network delay so loading states are testable too
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  login: async (email: string, password: string) => {
    if (USE_MOCK) {
      await delay(600);
      if (email === "admin@imready.io" && password === "password123") {
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        setAdminSessionExpiresAt(expiresAt);
        return { expiresAt, expiresIn: 900, admin: { id: "1", email } };
      }
      throw new Error("Invalid email or password");
    }

    const result = await request<{
      expiresAt: string;
      expiresIn: number;
      admin: { id: string; email: string };
    }>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAdminSessionExpiresAt(result.expiresAt);
    return result;
  },

  me: () =>
    request<{ admin: { id: string; email: string }; expiresAt: string }>(
      "/auth/admin/me",
    ),

  logout: async () => {
    try {
      await request<{ message: string }>("/auth/admin/logout", {
        method: "POST",
      });
    } catch {
      // ignore network errors on logout
    }
    clearAdminSession();
  },
};

export type StudentStatus = "VERIFIED" | "PENDING" | "FLAGGED";
export type SubscriptionStatus = "FREE" | "PREMIUM_PENDING" | "PREMIUM";

export interface Student {
  id: string;
  uuid?: string;
  studentName: string;
  email: string;
  phone?: string;
  college: string;
  collegeName?: string;
  streamMajor?: string;
  graduationYear?: string;
  domain: string;
  level: string;
  careerDoor?: string;
  status: StudentStatus;
  emailVerified?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  premiumApprovedAt?: string | null;
  premiumPaymentScreenshot?: string | null;
  premiumPaymentSubmittedAt?: string | null;
  createdAt?: string;
}

export interface StudentsResponse {
  students: Student[];
  page: number;
  pageSize?: number;
  totalPages: number;
  total: number;
}

const mockStudents: Student[] = [
  { id: "STU-1001", studentName: "Ava Patel", email: "ava@example.com", college: "Tech Central Inst.", domain: "Cyber Security", level: "Beginner", status: "VERIFIED", subscriptionStatus: "FREE" },
  { id: "STU-1002", studentName: "Mia Chen", email: "mia@example.com", college: "Bio Labs Univ.", domain: "Data Science", level: "Intermediate", status: "PENDING", subscriptionStatus: "PREMIUM_PENDING", premiumPaymentScreenshot: "/uploads/premium-payments/demo.png", premiumPaymentSubmittedAt: "2026-09-05T10:00:00.000Z" },
  { id: "STU-1003", studentName: "Noah Brooks", email: "noah@example.com", college: "Global Arts Acad.", domain: "UX Architecture", level: "Advanced", status: "FLAGGED", subscriptionStatus: "FREE" },
  { id: "STU-1004", studentName: "Liam Ortiz", email: "liam@example.com", college: "Tech Central Inst.", domain: "Quantum Comp", level: "Beginner", status: "VERIFIED", subscriptionStatus: "PREMIUM" },
  { id: "STU-1005", studentName: "Sophia Reed", email: "sophia@example.com", college: "Bio Labs Univ.", domain: "Cyber Security", level: "Intermediate", status: "PENDING", subscriptionStatus: "FREE" },
  { id: "STU-1006", studentName: "Ethan Cole", email: "ethan@example.com", college: "Global Arts Acad.", domain: "Data Science", level: "Beginner", status: "VERIFIED", subscriptionStatus: "PREMIUM_PENDING" },
];

function filterMockStudents(
  opts?: { search?: string; status?: string; subscriptionStatus?: string },
) {
  const search = opts?.search?.trim().toLowerCase() ?? "";
  return mockStudents.filter((student) => {
    const matchesSearch =
      !search ||
      student.studentName.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      student.college.toLowerCase().includes(search) ||
      student.domain.toLowerCase().includes(search);
    const matchesStatus =
      !opts?.status || opts.status === "ALL" || student.status === opts.status;
    const matchesSubscription =
      !opts?.subscriptionStatus ||
      opts.subscriptionStatus === "ALL" ||
      student.subscriptionStatus === opts.subscriptionStatus;
    return matchesSearch && matchesStatus && matchesSubscription;
  });
}

export const studentsApi = {
  getStudents: async (
    page = 1,
    opts?: { search?: string; status?: string; subscriptionStatus?: string },
  ): Promise<StudentsResponse> => {
    if (USE_MOCK) {
      await delay(600);
      const pageSize = 10;
      const filtered = filterMockStudents(opts);
      const start = (page - 1) * pageSize;
      const pagedStudents = filtered.slice(start, start + pageSize);
      return {
        students: pagedStudents,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
        total: filtered.length,
      };
    }
    const params = new URLSearchParams({ page: String(page) });
    if (opts?.search) params.set("search", opts.search);
    if (opts?.status && opts.status !== "ALL") params.set("status", opts.status);
    if (opts?.subscriptionStatus && opts.subscriptionStatus !== "ALL") {
      params.set("subscriptionStatus", opts.subscriptionStatus);
    }
    return request<StudentsResponse>(`/admin/students?${params.toString()}`);
  },

  approvePremium: async (id: string): Promise<{ message: string; student: Student }> => {
    if (USE_MOCK) {
      await delay(400);
      const student = mockStudents.find((row) => row.id === id);
      if (!student) throw new Error("Student not found");
      student.subscriptionStatus = "PREMIUM";
      return {
        message: "Premium access approved. Premium features are now unlocked.",
        student,
      };
    }
    return request<{ message: string; student: Student }>(
      `/admin/students/${id}/approve-premium`,
      { method: "POST" },
    );
  },

  undoPremium: async (id: string): Promise<{ message: string; student: Student }> => {
    if (USE_MOCK) {
      await delay(400);
      const student = mockStudents.find((row) => row.id === id);
      if (!student) throw new Error("Student not found");
      student.subscriptionStatus = "PREMIUM_PENDING";
      return {
        message:
          "Premium approval undone. Status is Premium Pending again and premium features are locked.",
        student,
      };
    }
    return request<{ message: string; student: Student }>(
      `/admin/students/${id}/undo-premium`,
      { method: "POST" },
    );
  },

  rejectPremium: async (id: string): Promise<{ message: string; student: Student }> => {
    if (USE_MOCK) {
      await delay(400);
      const student = mockStudents.find((row) => row.id === id);
      if (!student) throw new Error("Student not found");
      student.subscriptionStatus = "FREE";
      return {
        message: "Premium subscription rejected. The student is back on the Free plan.",
        student,
      };
    }
    return request<{ message: string; student: Student }>(
      `/admin/students/${id}/reject-premium`,
      { method: "POST" },
    );
  },

  updateStudent: async (
    id: string,
    payload: {
      studentName: string;
      email: string;
      college: string;
      domain: string;
      level: string;
      phone?: string;
      subscriptionStatus?: SubscriptionStatus;
    },
  ): Promise<{ message: string; student: Student }> => {
    if (USE_MOCK) {
      await delay(400);
      const student = mockStudents.find((row) => row.id === id);
      if (!student) throw new Error("Student not found");
      student.studentName = payload.studentName;
      student.email = payload.email;
      student.college = payload.college;
      student.domain = payload.domain;
      student.level = payload.level;
      if (payload.phone !== undefined) student.phone = payload.phone;
      if (payload.subscriptionStatus) {
        student.subscriptionStatus = payload.subscriptionStatus;
      }
      return { message: "Student details updated.", student };
    }
    return request<{ message: string; student: Student }>(
      `/admin/students/${id}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
  },
};

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    if (USE_MOCK) {
      await delay(600);
      return {
        studentsCount: 520,
        projectsCount: 24,
        assessmentsCount: 8,
        recentApplications: [
          { id: "1", studentName: "Alexander Vance", projectId: "PRJ-2941", submittedAt: "Oct 25, 2023", status: "PENDING" },
          { id: "2", studentName: "Sarah Jenkins", projectId: "PRJ-3012", submittedAt: "Oct 24, 2023", status: "APPROVED" },
          { id: "3", studentName: "Marcus Thorne", projectId: "PRJ-1188", submittedAt: "Oct 24, 2023", status: "REJECTED" },
          { id: "4", studentName: "Elara Kim", projectId: "PRJ-4450", submittedAt: "Oct 23, 2023", status: "PENDING" },
          { id: "5", studentName: "Nico Zhang", projectId: "PRJ-2291", submittedAt: "Oct 23, 2023", status: "PENDING" },
        ],
      };
    }
    return request<DashboardSummary>("/admin/dashboard/summary");
  },
};

export interface DashboardSummary {
  studentsCount: number;
  projectsCount: number;
  assessmentsCount: number;
  pendingApprovals?: number;
  recentApplications: {
    id: string;
    studentName: string;
    projectId: string;
    projectTitle?: string;
    submittedAt: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
  }[];
}

export interface College {
  id: string;
  name: string;
  studentCount: number;
  studentCapacity: number;
  coordinator: string;
}

export interface CollegesSummary {
  totalInstitutions: number;
  enrolledStudents: number;
  totalSeatCapacity: number;
}

export interface CollegesResponse {
  colleges: College[];
  summary: CollegesSummary;
  page: number;
  totalPages: number;
  total: number;
}

const MOCK_COORDINATORS = [
  "Dr. Sarah Connor",
  "Prof. Miles Dyson",
  "Dr. Elena Vasquez",
  "Prof. James Kirk",
];

const MOCK_COLLEGE_NAMES = [
  "CYBERDYNE_INSTITUTE",
  "NEURALINK_ACADEMY",
  "SKYNET_UNIVERSITY",
  "WAYNE_TECH_INSTITUTE",
  "STARK_INDUSTRIES_COLLEGE",
  "OSCORP_SCIENCES",
  "UMBRELLA_ACADEMY",
  "WAKANDA_TECH",
  "TYRELL_CORP_INSTITUTE",
  "APEX_UNIVERSITY",
  "HORIZON_LABS_COLLEGE",
  "VAULT_TECH_INSTITUTE",
];

const mockColleges: College[] = Array.from({ length: 42 }, (_, i) => {
  const capacity = 800 + (i % 5) * 400;
  const studentCount = Math.min(capacity, 400 + ((i * 137) % (capacity - 100)) + 100);
  return {
    id: `${String(10000 + i).slice(1)}${String.fromCharCode(65 + (i % 26))}-${String(i % 10)}`,
    name: MOCK_COLLEGE_NAMES[i % MOCK_COLLEGE_NAMES.length],
    studentCount,
    studentCapacity: capacity,
    coordinator: MOCK_COORDINATORS[i % MOCK_COORDINATORS.length],
  };
});

export const collegesApi = {
  getColleges: async (page = 1, search = ""): Promise<CollegesResponse> => {
    if (USE_MOCK) {
      await delay(600);
      const pageSize = 4;
      const query = search.trim().toLowerCase();
      const filtered = query
        ? mockColleges.filter(
            (c) =>
              c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query),
          )
        : mockColleges;
      const start = (page - 1) * pageSize;
      const pagedColleges = filtered.slice(start, start + pageSize);
      const enrolledStudents = mockColleges.reduce((sum, c) => sum + c.studentCount, 0);
      const totalSeatCapacity = mockColleges.reduce((sum, c) => sum + c.studentCapacity, 0);

      return {
        colleges: pagedColleges,
        summary: {
          totalInstitutions: mockColleges.length,
          enrolledStudents,
          totalSeatCapacity,
        },
        page,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
        total: filtered.length,
      };
    }
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return request<CollegesResponse>(`/admin/colleges?${params.toString()}`);
  },
};

// ─── Assessments ─────────────────────────────────────────────────────────────

export type AssessmentStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";
export type QuestionOrderMode = "sequential" | "random" | "jumbled";
export type QuestionCategory = "OBSERVATION" | "THINKING" | "BUILDING";
export type WeightingMode = "EQUAL" | "INDIVIDUAL";
export type AnswerType =
  | "JUMBLED"
  | "PERSONAL"
  | "BOTH"
  | "MCQ"
  | "JUMBLED_MCQ"
  | "PERSONAL_MCQ"
  | "ALL";
export type SubmissionResult = "PASS" | "FAIL" | null;
export type SubmissionStatus = "SUBMITTED" | "PARTIALLY_EVALUATED" | "EVALUATED";

/** Capability helpers — keep in sync with backend answer-type.helpers.js */
export function needsJumbled(answerType: AnswerType | string | undefined | null): boolean {
  const type = String(answerType || "BOTH").toUpperCase();
  return (
    type === "JUMBLED" ||
    type === "BOTH" ||
    type === "JUMBLED_MCQ" ||
    type === "ALL"
  );
}

export function needsPersonal(answerType: AnswerType | string | undefined | null): boolean {
  const type = String(answerType || "BOTH").toUpperCase();
  return (
    type === "PERSONAL" ||
    type === "BOTH" ||
    type === "PERSONAL_MCQ" ||
    type === "ALL"
  );
}

export function needsMcq(answerType: AnswerType | string | undefined | null): boolean {
  const type = String(answerType || "BOTH").toUpperCase();
  return (
    type === "MCQ" ||
    type === "JUMBLED_MCQ" ||
    type === "PERSONAL_MCQ" ||
    type === "ALL"
  );
}

export interface Assessment {
  id: string;
  uuid: string;
  name: string;
  domain: string;
  passMarks: string;
  status: AssessmentStatus;
  questionCount?: number;
  questionOrderMode?: QuestionOrderMode;
  jumbledOptionsMarks?: number;
  personalResponseMarks?: number;
  mcqOptionsMarks?: number;
  weightingMode?: WeightingMode;
  passMarksValue?: number;
  durationMinutes?: number;
}

const MOCK_ASSESSMENTS: Assessment[] = [
  { id: "1", uuid: "147ac10b-98cc-4372-a867", name: "Data Structures V4",         domain: "Computer Science", passMarks: "75/100", status: "ACTIVE"   },
  { id: "2", uuid: "b923d11c-22ff-11ee-978f", name: "Neural Net Basics",           domain: "Machine Learning", passMarks: "80/100", status: "DRAFT"    },
  { id: "3", uuid: "a0eabc99-9c0b-4e18-b86d", name: "Cloud Arch Professional",     domain: "Infrastructure",   passMarks: "90/100", status: "ACTIVE"   },
  { id: "4", uuid: "c81e7289-694c-11e1-9b23", name: "Legacy Systems Deprecated",   domain: "Mainframe",        passMarks: "60/100", status: "ARCHIVED" },
  { id: "5", uuid: "28672166-4654-4638-953e", name: "Quantum Crypt Sec L3",        domain: "Cyber Security",   passMarks: "85/100", status: "ACTIVE"   },
];

export interface AssessmentOptionInput {
  label: string;
  correctOrder: number;
}

export interface AssessmentMcqOptionInput {
  label: string;
  isCorrect: boolean;
}

/** MCQ choice as returned from the API (admin detail / results). */
export interface AssessmentQuestionMcqOption {
  id?: string;
  label: string;
  isCorrect?: boolean;
}

export interface AssessmentQuestionInput {
  title: string;
  prompt: string;
  question: string;
  tips: string[];
  answerType: AnswerType;
  options: AssessmentOptionInput[];
  mcqOptions?: AssessmentMcqOptionInput[];
  category: QuestionCategory;
  jumbledOptionsMarks?: number;
  personalResponseMarks?: number;
  mcqOptionsMarks?: number;
  weightingMode?: WeightingMode;
  /** Optional per-question timer in seconds. null/omit = no question timer. */
  durationSeconds?: number | null;
}

export interface AssessmentDetail extends Assessment {
  questions: AssessmentQuestionBankItem[];
}

export interface AssessmentQuestionBankItem {
  id: number;
  uuid: string;
  title: string;
  prompt: string;
  question: string;
  tips: string[];
  answerType?: AnswerType;
  category?: QuestionCategory;
  jumbledOptionsMarks?: number | null;
  personalResponseMarks?: number | null;
  mcqOptionsMarks?: number | null;
  durationSeconds?: number | null;
  options: { id: string; label: string; correctOrder: number }[];
  mcqOptions?: AssessmentQuestionMcqOption[];
}

export interface CreateAssessmentPayload {
  name: string;
  domain: string;
  status: AssessmentStatus;
  questionCount: number;
  questionOrderMode: QuestionOrderMode;
  jumbledOptionsMarks: number;
  personalResponseMarks: number;
  mcqOptionsMarks: number;
  weightingMode: WeightingMode;
  passMarks: number;
  durationMinutes: number;
  questionIds: number[];
  questions: AssessmentQuestionInput[];
}

export interface AssessmentsResponse {
  assessments: Assessment[];
  total: number;
  page: number;
  totalPages: number;
  totalThisMonth: number;
  activeSessions: number;
  avgPassRate: string;
}

export interface AssessmentResultListItem {
  id: string;
  uuid: string;
  studentName: string;
  email: string;
  collegeName: string;
  assessmentName: string;
  domain: string;
  status: SubmissionStatus;
  result: SubmissionResult;
  jumbledScore: number;
  personalScore: number | null;
  mcqScore?: number;
  totalScore: number | null;
  maxScore: number;
  submittedAt: string;
}

export interface AssessmentResultsResponse {
  results: AssessmentResultListItem[];
  page: number;
  totalPages: number;
  total: number;
}

export interface AssessmentResultDetail {
  id: string;
  uuid: string;
  studentName: string;
  email: string;
  collegeName: string;
  status: SubmissionStatus;
  result: SubmissionResult;
  jumbledScore: number;
  personalScore: number | null;
  mcqScore?: number;
  totalScore: number | null;
  maxScore: number;
  passMarksValue: number;
  assessment: Assessment | null;
  answers: {
    id: string;
    questionId: number;
    category: QuestionCategory;
    answerType: AnswerType;
    title: string;
    prompt: string;
    question: string;
    optionOrder: { id: string; label: string }[];
    correctOrder: { id: string; label: string; correctOrder: number }[];
    personalResponse: string;
    mcqSelection?: { id: string; label: string } | null;
    mcqOptions?: AssessmentQuestionMcqOption[];
    jumbledScore: number;
    personalScore: number | null;
    mcqScore?: number;
    jumbledMax: number;
    personalMax: number;
    mcqMax?: number;
  }[];
}

export const assessmentsApi = {
  getAssessments: async (page = 1): Promise<AssessmentsResponse> => {
    if (USE_MOCK) {
      await delay(500);
      return {
        assessments: MOCK_ASSESSMENTS,
        total: 124,
        page,
        totalPages: 25,
        totalThisMonth: 4,
        activeSessions: 18,
        avgPassRate: "74.2%",
      };
    }
    return request<AssessmentsResponse>(`/admin/assessments?page=${page}`);
  },

  createAssessment: async (payload: CreateAssessmentPayload): Promise<Assessment> => {
    if (USE_MOCK) {
      await delay(500);
      return {
        id: String(Date.now()),
        uuid: crypto.randomUUID(),
        name: payload.name,
        domain: payload.domain,
        passMarks: `${payload.passMarks}/100`,
        status: payload.status,
      };
    }
    return request<Assessment>("/admin/assessments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getAssessment: async (id: string): Promise<AssessmentDetail> => {
    if (USE_MOCK) {
      await delay(300);
      throw new Error("Not available in mock mode");
    }
    return request<AssessmentDetail>(`/admin/assessments/${id}`);
  },

  updateAssessment: async (
    id: string,
    payload: CreateAssessmentPayload,
  ): Promise<Assessment> => {
    if (USE_MOCK) {
      await delay(500);
      return {
        id,
        uuid: crypto.randomUUID(),
        name: payload.name,
        domain: payload.domain,
        passMarks: `${payload.passMarks}/100`,
        status: payload.status,
      };
    }
    return request<Assessment>(`/admin/assessments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getQuestions: async (): Promise<{ questions: AssessmentQuestionBankItem[] }> => {
    if (USE_MOCK) {
      await delay(300);
      return { questions: [] };
    }
    return request<{ questions: AssessmentQuestionBankItem[] }>(
      "/admin/assessments/questions",
    );
  },

  createQuestion: async (
    payload: AssessmentQuestionInput,
  ): Promise<AssessmentQuestionBankItem> => {
    if (USE_MOCK) {
      await delay(300);
      return {
        id: Date.now(),
        uuid: crypto.randomUUID(),
        ...payload,
        options: payload.options.map((o, i) => ({
          id: `mock-o${i + 1}`,
          label: o.label,
          correctOrder: o.correctOrder,
        })),
        mcqOptions: (payload.mcqOptions || []).map((o, i) => ({
          id: `mock-mcq${i + 1}`,
          label: o.label,
          isCorrect: o.isCorrect,
        })),
      };
    }
    return request<AssessmentQuestionBankItem>("/admin/assessments/questions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteAssessment: async (id: string): Promise<Assessment> => {
    if (USE_MOCK) {
      await delay(300);
      const found = MOCK_ASSESSMENTS.find((a) => a.id === id);
      if (!found) throw new Error("Assessment not found");
      return { ...found, status: "ARCHIVED" };
    }
    return request<Assessment>(`/admin/assessments/${id}`, { method: "DELETE" });
  },

  getResults: async (
    page = 1,
    result?: "PASS" | "FAIL" | "PENDING" | "ALL",
  ): Promise<AssessmentResultsResponse> => {
    if (USE_MOCK) {
      await delay(400);
      return { results: [], page: 1, totalPages: 1, total: 0 };
    }
    const params = new URLSearchParams({ page: String(page) });
    if (result && result !== "ALL") params.set("result", result);
    return request<AssessmentResultsResponse>(
      `/admin/assessments/results?${params.toString()}`,
    );
  },

  getResultDetail: async (submissionId: string): Promise<AssessmentResultDetail> => {
    if (USE_MOCK) {
      await delay(300);
      throw new Error("Not available in mock mode");
    }
    return request<AssessmentResultDetail>(
      `/admin/assessments/results/${submissionId}`,
    );
  },

  setPersonalScore: async (
    submissionId: string,
    answerId: string,
    personalScore: number,
  ): Promise<AssessmentResultDetail> => {
    if (USE_MOCK) {
      await delay(300);
      throw new Error("Not available in mock mode");
    }
    return request<AssessmentResultDetail>(
      `/admin/assessments/results/${submissionId}/answers/${answerId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ personalScore }),
      },
    );
  },

  fullEvaluate: async (submissionId: string): Promise<AssessmentResultDetail> => {
    if (USE_MOCK) {
      await delay(300);
      throw new Error("Not available in mock mode");
    }
    return request<AssessmentResultDetail>(
      `/admin/assessments/results/${submissionId}/full-evaluate`,
      { method: "POST" },
    );
  },

  deleteResult: async (submissionId: string): Promise<{ id: string; deleted: boolean }> => {
    if (USE_MOCK) {
      await delay(300);
      return { id: submissionId, deleted: true };
    }
    return request<{ id: string; deleted: boolean }>(
      `/admin/assessments/results/${submissionId}`,
      { method: "DELETE" },
    );
  },

  bulkDeleteResults: async (
    ids: string[],
  ): Promise<{ deleted: string[]; deletedCount: number; requestedCount: number }> => {
    if (USE_MOCK) {
      await delay(300);
      return { deleted: ids, deletedCount: ids.length, requestedCount: ids.length };
    }
    return request<{ deleted: string[]; deletedCount: number; requestedCount: number }>(
      "/admin/assessments/results/bulk-delete",
      {
        method: "POST",
        body: JSON.stringify({ ids }),
      },
    );
  },

  downloadResultsExport: async (
    result?: "PASS" | "FAIL" | "PENDING" | "ALL",
  ): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      throw new Error("Results export is not available in mock mode");
    }

    const params = new URLSearchParams();
    if (result && result !== "ALL") params.set("result", result);
    const query = params.toString();
    const res = await fetch(
      `${BASE_URL}/admin/assessments/results/export${query ? `?${query}` : ""}`,
      {
        credentials: "include",
      },
    );

    if (res.status === 401) {
      redirectToLogin();
    }

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(errorBody?.message || "Failed to download results Excel.");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "assessment-results.xlsx";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },

  downloadBulkSample: async (): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      throw new Error("Bulk sample download is not available in mock mode");
    }

    const res = await fetch(`${BASE_URL}/admin/assessments/bulk/sample`, {
      credentials: "include",
    });

    if (res.status === 401) {
      redirectToLogin();
    }

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(errorBody?.message || "Failed to download sample Excel.");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "assessment-bulk-sample.xlsx";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },

  bulkUpload: async (
    file: File,
  ): Promise<{ createdCount: number; assessments: Assessment[] }> => {
    if (USE_MOCK) {
      await delay(500);
      throw new Error("Bulk upload is not available in mock mode");
    }

    const formData = new FormData();
    formData.append("file", file);

    return request<{ createdCount: number; assessments: Assessment[] }>(
      "/admin/assessments/bulk/upload",
      {
        method: "POST",
        body: formData,
      },
    );
  },
};

// ─── Project categories ───────────────────────────────────────────────────────

export interface ProjectCategoryItem {
  id: string;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export const projectCategoriesApi = {
  list: async (activeOnly = false): Promise<{ categories: ProjectCategoryItem[] }> => {
    if (USE_MOCK) {
      await delay(300);
      return {
        categories: [
          {
            id: "1",
            uuid: "mock-ai",
            name: "Artificial Intelligence",
            slug: "artificial-intelligence",
            isActive: true,
          },
          {
            id: "2",
            uuid: "mock-ml",
            name: "Machine Learning",
            slug: "machine-learning",
            isActive: true,
          },
          {
            id: "3",
            uuid: "mock-el",
            name: "Electronics",
            slug: "electronics",
            isActive: true,
          },
        ],
      };
    }
    const query = activeOnly ? "?activeOnly=true" : "";
    return request<{ categories: ProjectCategoryItem[] }>(
      `/admin/projects/categories${query}`,
    );
  },

  create: async (payload: {
    name: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<ProjectCategoryItem> => {
    if (USE_MOCK) {
      await delay(300);
      return {
        id: String(Date.now()),
        uuid: `mock-${Date.now()}`,
        name: payload.name,
        slug: payload.slug || payload.name.toLowerCase().replace(/\s+/g, "-"),
        description: payload.description || "",
        isActive: payload.isActive !== false,
      };
    }
    return request<ProjectCategoryItem>("/admin/projects/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (
    id: string,
    payload: {
      name: string;
      slug?: string;
      description?: string;
      isActive?: boolean;
    },
  ): Promise<ProjectCategoryItem> => {
    if (USE_MOCK) {
      await delay(300);
      return {
        id,
        uuid: `mock-${id}`,
        name: payload.name,
        slug: payload.slug || payload.name.toLowerCase().replace(/\s+/g, "-"),
        description: payload.description || "",
        isActive: payload.isActive !== false,
      };
    }
    return request<ProjectCategoryItem>(`/admin/projects/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string): Promise<{ id: string; deleted: boolean }> => {
    if (USE_MOCK) {
      await delay(300);
      return { id, deleted: true };
    }
    return request<{ id: string; deleted: boolean }>(
      `/admin/projects/categories/${id}`,
      { method: "DELETE" },
    );
  },
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export type ProjectStatus = "ACTIVE" | "PENDING" | "REVIEW" | "ARCHIVED";
export type ProjectCategory = string;

export interface Project {
  id: string;
  uuid?: string;
  slug?: string;
  name: string;
  title?: string;
  domain: string;
  category?: ProjectCategory;
  badge?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  requirements?: string[];
  techStack?: string[];
  estimatedTime?: string;
  level?: string;
  overview?: string;
  briefRequirements?: string[];
  deliverables?: { id?: string; label: string }[];
  evaluationCriteria?: { label: string; percent: number }[];
  resources?: { label: string; type: "pdf" | "zip"; href: string }[];
  teamSize: number;
  status: ProjectStatus;
}

export interface ProjectInput {
  title: string;
  slug?: string;
  category: ProjectCategory;
  badge?: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  requirements: string[];
  techStack: string[];
  estimatedTime: string;
  level: string;
  overview: string;
  briefRequirements: string[];
  deliverables: { id?: string; label: string }[];
  evaluationCriteria: { label: string; percent: number }[];
  resources?: { label: string; type: "pdf" | "zip"; href: string }[];
  teamSize: number;
  status: ProjectStatus;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  totalPages: number;
}

const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "Neural_Sync_Core",    domain: "AI_ML",        teamSize: 5,  status: "ACTIVE"   },
  { id: "2", name: "Vortex_Ledger_v4",   domain: "BLOCKCHAIN",   teamSize: 8,  status: "PENDING"  },
  { id: "3", name: "Secure_Vault_Beta",  domain: "CYBER_SEC",    teamSize: 3,  status: "REVIEW"   },
  { id: "4", name: "Data_Harvester_X",   domain: "CLOUD_COMP",   teamSize: 12, status: "ACTIVE"   },
  { id: "5", name: "Quantum_Cipher_7",   domain: "CRYPTOGRAPHY", teamSize: 4,  status: "ARCHIVED" },
];

export const projectsApi = {
  getProjects: async (page = 1): Promise<ProjectsResponse> => {
    if (USE_MOCK) {
      await delay(500);
      return {
        projects: MOCK_PROJECTS,
        total: 5,
        page,
        totalPages: 1,
      };
    }
    return request<ProjectsResponse>(`/admin/projects?page=${page}`);
  },

  getProject: async (id: string): Promise<Project> => {
    if (USE_MOCK) {
      await delay(300);
      const found = MOCK_PROJECTS.find((p) => p.id === id);
      if (!found) throw new Error("Project not found");
      return found;
    }
    return request<Project>(`/admin/projects/${id}`);
  },

  createProject: async (payload: ProjectInput): Promise<Project> => {
    if (USE_MOCK) {
      await delay(400);
      return {
        id: String(Date.now()),
        name: payload.title,
        domain: payload.category,
        teamSize: payload.teamSize,
        status: payload.status,
      };
    }
    return request<Project>("/admin/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateProject: async (id: string, payload: ProjectInput): Promise<Project> => {
    if (USE_MOCK) {
      await delay(400);
      return {
        id,
        name: payload.title,
        domain: payload.category,
        teamSize: payload.teamSize,
        status: payload.status,
      };
    }
    return request<Project>(`/admin/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteProject: async (id: string): Promise<{ id: string; deleted: boolean }> => {
    if (USE_MOCK) {
      await delay(300);
      return { id, deleted: true };
    }
    return request<{ id: string; deleted: boolean }>(`/admin/projects/${id}`, {
      method: "DELETE",
    });
  },

  uploadFile: async (
    file: File,
    kind: "image" | "resource" = "image",
  ): Promise<{ url: string; filename: string; type: string }> => {
    if (USE_MOCK) {
      await delay(400);
      return {
        url: URL.createObjectURL(file),
        filename: file.name,
        type: kind === "image" ? "image" : file.name.endsWith(".zip") ? "zip" : "pdf",
      };
    }
    const formData = new FormData();
    formData.append("file", file);
    return request<{ url: string; filename: string; type: string }>(
      `/admin/projects/uploads?kind=${kind}`,
      {
        method: "POST",
        body: formData,
      },
    );
  },
};
