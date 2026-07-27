export const SIGNUP_STEP_NUMBERS = [1, 2, 3] as const;
export type SignupStep = (typeof SIGNUP_STEP_NUMBERS)[number];

export const ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  signup: "/signup",
  signupStep: (step: SignupStep) => `/signup/step/${step}`,
  forColleges: "/for-colleges",
  domainExplorer: "/domain-explorer",
  bytex: "/bytex",
  productComparison: "/product-comparison",
  product: (id: string) => `/product/${id}`,
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  faq: "/faq",
  dashboard: "/dashboard",
  assessment: "/assessment",
  assessmentSubmitted: "/assessment/submitted",
  projects: "/projects",
  projectDetail: (id: string) => `/projects/${id}`,
} as const;

/** Routes that use the authenticated app shell (no marketing navbar). */
export const APP_ROUTE_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.assessment,
  ROUTES.projects,
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
] as const;

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}


export function isSignupStep(value: number): value is SignupStep {
  return SIGNUP_STEP_NUMBERS.includes(value as SignupStep);
}
