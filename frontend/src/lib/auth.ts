/** Client-side auth helpers. Tokens live in httpOnly cookies set by the API. */

const LEGACY_STUDENT_TOKEN_KEY = "imready_student_token";

/** Remove the old localStorage JWT if present (migrated to httpOnly cookies). */
export function clearLegacyStudentToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_STUDENT_TOKEN_KEY);
  } catch {
    // ignore
  }
}

clearLegacyStudentToken();
