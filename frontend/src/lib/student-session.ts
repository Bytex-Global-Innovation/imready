import { authApi, type StudentProfile } from "@/lib/api";

export type StudentSession = {
  student: StudentProfile;
  foundationComplete: boolean;
  unpaidProjectsUnlocked: boolean;
  paidProjectsUnlocked: boolean;
  /** @deprecated Use paidProjectsUnlocked */
  projectsUnlocked: boolean;
};

/** In-flight /me dedupe — also covers React Strict Mode double-mount in dev. */
let meInFlight: Promise<StudentSession> | null = null;
let meCache: StudentSession | null = null;

export function getCachedStudentSession(): StudentSession | null {
  return meCache;
}

export function clearStudentSessionCache() {
  meCache = null;
  meInFlight = null;
}

export function setCachedStudentSession(session: StudentSession) {
  meCache = session;
}

export async function loadStudentSession(
  force = false,
): Promise<StudentSession> {
  if (!force && meCache) return meCache;
  if (!force && meInFlight) return meInFlight;

  meInFlight = authApi
    .me()
    .then((data) => {
      meCache = {
        student: data.student,
        foundationComplete: Boolean(data.foundationComplete),
        unpaidProjectsUnlocked: Boolean(data.unpaidProjectsUnlocked),
        paidProjectsUnlocked: Boolean(data.paidProjectsUnlocked),
        projectsUnlocked: Boolean(data.paidProjectsUnlocked ?? data.projectsUnlocked),
      };
      return meCache;
    })
    .finally(() => {
      meInFlight = null;
    });

  return meInFlight;
}
