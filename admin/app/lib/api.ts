const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || "Something went wrong. Please try again.");
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
        return { token: "mock-token-123" };
      }
      throw new Error("Invalid email or password");
    }
    return request<{ token: string }>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};

export interface Student {
  id: string;
  studentName: string;
  college: string;
  domain: string;
  status: "VERIFIED" | "PENDING" | "FLAGGED";
}

export interface StudentsResponse {
  students: Student[];
  page: number;
  totalPages: number;
  total: number;
}

const mockStudents: Student[] = [
  { id: "STU-1001", studentName: "Ava Patel", college: "Tech Central Inst.", domain: "Cyber Security", status: "VERIFIED" },
  { id: "STU-1002", studentName: "Mia Chen", college: "Bio Labs Univ.", domain: "Data Science", status: "PENDING" },
  { id: "STU-1003", studentName: "Noah Brooks", college: "Global Arts Acad.", domain: "UX Architecture", status: "FLAGGED" },
  { id: "STU-1004", studentName: "Liam Ortiz", college: "Tech Central Inst.", domain: "Quantum Comp", status: "VERIFIED" },
  { id: "STU-1005", studentName: "Sophia Reed", college: "Bio Labs Univ.", domain: "Cyber Security", status: "PENDING" },
  { id: "STU-1006", studentName: "Ethan Cole", college: "Global Arts Acad.", domain: "Data Science", status: "VERIFIED" },
];

export const studentsApi = {
  getStudents: async (page = 1): Promise<StudentsResponse> => {
    if (USE_MOCK) {
      await delay(600);
      const pageSize = 4;
      const start = (page - 1) * pageSize;
      const pagedStudents = mockStudents.slice(start, start + pageSize);
      return {
        students: pagedStudents,
        page,
        totalPages: Math.max(1, Math.ceil(mockStudents.length / pageSize)),
        total: mockStudents.length,
      };
    }
    return request<StudentsResponse>(`/admin/students?page=${page}`);
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
        activeMentorsCount: 15,
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
  activeMentorsCount: number;
  recentApplications: {
    id: string;
    studentName: string;
    projectId: string;
    submittedAt: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
  }[];
}