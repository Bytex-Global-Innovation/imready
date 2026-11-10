export const SIGNUP_STEP_NUMBERS = [1, 2] as const;
export type SignupStep = (typeof SIGNUP_STEP_NUMBERS)[number];

export const ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  signup: "/signup",
  forColleges: "/for-colleges",
  domainExplorer: "/domain-explorer",
  details: "/details",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  faq: "/faq",
  dashboard: "/dashboard",
  assessment: "/assessment",
  assessmentSubmitted: "/assessment/submitted",
  mission: (id: number) => `/assessment/mission/${id}`,
  missionComplete: (id: number) => `/assessment/mission/${id}/complete`,
  /** Post–Mission 5 — Stage 2 Industry Experience UI (same as stage2IndustryExperience) */
  foundationComplete: "/assessment/complete",
  projects: "/projects",
  freeProjects: "/free-projects",
  notifications: "/notifications",
  projectDetail: (id: string) => `/projects/${id}`,
  freeProjectDetail: (id: string) => `/free-projects/${id}`,
  /** Stage 2 — Industry Experience (celebration / transition after Foundation) */
  stage2IndustryExperience: "/stage-2/industry-experience",
  stage2ProjectDetail: (projectId: string) => `/stage-2/projects/${projectId}`,
  stage2ProjectApply: (projectId: string) => `/stage-2/projects/${projectId}/apply`,
  stage2ProjectTeam: (projectId: string) => `/stage-2/projects/${projectId}/team`,
} as const;

/** Routes that use the authenticated app shell (no marketing navbar). */
export const APP_ROUTE_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.assessment,
  ROUTES.projects,
  ROUTES.freeProjects,
  ROUTES.notifications,
  ROUTES.details,
  "/stage-2",
] as const;

export function isAppRoute(pathname: string): boolean {
  return APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Routes that use the standalone auth shell (no marketing navbar). */
export const AUTH_ROUTE_PREFIXES = [
  ROUTES.login,
  ROUTES.signup,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.verifyEmail,
] as const;

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Login/signup only — logged-in users should be redirected away. */
export const GUEST_ONLY_AUTH_PREFIXES = [ROUTES.login, ROUTES.signup] as const;

export function isGuestOnlyAuthRoute(pathname: string): boolean {
  return GUEST_ONLY_AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isSignupStep(value: number): value is SignupStep {
  return SIGNUP_STEP_NUMBERS.includes(value as SignupStep);
}