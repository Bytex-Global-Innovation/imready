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
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  faq: "/faq",
} as const;

export function isSignupStep(value: number): value is SignupStep {
  return SIGNUP_STEP_NUMBERS.includes(value as SignupStep);
}
