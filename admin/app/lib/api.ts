const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
/** Use mock data when explicitly enabled or when no API URL is configured (local dev). */
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
  (process.env.NEXT_PUBLIC_USE_MOCK !== "false" && BASE_URL === "");
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

export interface Assessment {
  id: string;
  uuid: string;
  name: string;
  domain: string;
  passMarks: string;
  status: AssessmentStatus;
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

const MOCK_ASSESSMENTS: Assessment[] = [
  { id: "1", uuid: "147ac10b-98cc-4372-a867", name: "Data Structures V4",         domain: "Computer Science", passMarks: "75/100", status: "ACTIVE"   },
  { id: "2", uuid: "b923d11c-22ff-11ee-978f", name: "Neural Net Basics",           domain: "Machine Learning", passMarks: "80/100", status: "DRAFT"    },
  { id: "3", uuid: "a0eabc99-9c0b-4e18-b86d", name: "Cloud Arch Professional",     domain: "Infrastructure",   passMarks: "90/100", status: "ACTIVE"   },
  { id: "4", uuid: "c81e7289-694c-11e1-9b23", name: "Legacy Systems Deprecated",   domain: "Mainframe",        passMarks: "60/100", status: "ARCHIVED" },
  { id: "5", uuid: "28672166-4654-4638-953e", name: "Quantum Crypt Sec L3",        domain: "Cyber Security",   passMarks: "85/100", status: "ACTIVE"   },
];

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
};

// ─── Mentors ──────────────────────────────────────────────────────────────────

export interface MentorStudent {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Mentor {
  id: string;
  mentorId: string;
  name: string;
  initials: string;
  color: string;
  specialization: string;
  projectName: string;
  organization: string;
  teamType: "Solo" | "Team";
  students: MentorStudent[];
}

export interface MentorsResponse {
  mentors: Mentor[];
  total: number;
  page: number;
  totalPages: number;
  totalMentors: number;
  activeProjects: number;
  soloProjects: number;
  teamProjects: number;
  studentsGuided: number;
  avgStudentsPerMentor: string;
}

const MOCK_MENTORS: Mentor[] = [
  {
    id: "1", mentorId: "MTR-0112-E", name: "Dr. Elena Vasquez", initials: "EV", color: "bg-indigo-500",
    specialization: "AI Systems",
    projectName: "Autonomous Threat Detection", organization: "Cyberdyne Institute",
    teamType: "Team",
    students: [
      { id: "s1", name: "Rebecca Jorden", initials: "RJ", color: "bg-blue-500"   },
      { id: "s2", name: "Dwayne Hicks",   initials: "DH", color: "bg-violet-500" },
      { id: "s3", name: "Newt Bishop",    initials: "NB", color: "bg-violet-500" },
    ],
  },
  {
    id: "2", mentorId: "MTR-0087-A", name: "Prof. Marcus Webb", initials: "MW", color: "bg-teal-500",
    specialization: "Robotics",
    projectName: "Synthetic Vision Model", organization: "Weyland University",
    teamType: "Solo",
    students: [
      { id: "s4", name: "Gareth Holden", initials: "GH", color: "bg-violet-500" },
    ],
  },
  {
    id: "3", mentorId: "MTR-0112-B", name: "Dr. Amara Osei", initials: "AO", color: "bg-blue-600",
    specialization: "Robotics Ethics",
    projectName: "Compliance Reasoning Engine", organization: "Tyrell Academy",
    teamType: "Team",
    students: [
      { id: "s5", name: "Peter Bogert",   initials: "PB", color: "bg-violet-500" },
      { id: "s6", name: "Alfred Lanning", initials: "AL", color: "bg-orange-400" },
    ],
  },
  {
    id: "4", mentorId: "MTR-0233-G", name: "Dr. Raj Patel", initials: "RP", color: "bg-rose-500",
    specialization: "Bioinformatics",
    projectName: "Genome Pattern Analysis", organization: "Oscorp Tech",
    teamType: "Team",
    students: [
      { id: "s7",  name: "Becky Driscoll", initials: "BD", color: "bg-blue-400"   },
      { id: "s8",  name: "Miles Barrow",   initials: "MB", color: "bg-indigo-400" },
      { id: "s9",  name: "Sara Chen",      initials: "SC", color: "bg-teal-400"   },
      { id: "s10", name: "Jonas Kade",     initials: "JK", color: "bg-orange-400" },
    ],
  },
];

export const mentorsApi = {
  getMentors: async (page = 1): Promise<MentorsResponse> => {
    if (USE_MOCK) {
      await delay(500);
      return {
        mentors: MOCK_MENTORS,
        total: 18,
        page,
        totalPages: 5,
        totalMentors: 18,
        activeProjects: 24,
        soloProjects: 8,
        teamProjects: 12,
        studentsGuided: 96,
        avgStudentsPerMentor: "5.3",
      };
    }
    return request<MentorsResponse>(`/admin/mentors?page=${page}`);
  },
};