const SESSION_EXPIRES_KEY = "imready_admin_session_expires_at";
const LEGACY_TOKEN_KEY = "imready_admin_token";

/** Remove legacy localStorage JWT (migrated to httpOnly cookie). */
export function clearLegacyAdminToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function setAdminSessionExpiresAt(iso: string) {
  if (typeof window === "undefined") return;
  // localStorage so the 15-minute timer survives tab refresh.
  window.localStorage.setItem(SESSION_EXPIRES_KEY, iso);
}

export function getAdminSessionExpiresAt(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_EXPIRES_KEY);
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_EXPIRES_KEY);
  clearLegacyAdminToken();
}

/** Soft client check — real auth is the httpOnly cookie validated by the API. */
export function isAdminSessionActive(): boolean {
  const expiresAt = getAdminSessionExpiresAt();
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}

clearLegacyAdminToken();
