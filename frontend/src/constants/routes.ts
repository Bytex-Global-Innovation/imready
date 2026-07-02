export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forColleges: "/for-colleges",
  domainExplorer: "/domain-explorer",
  bytex: "/bytex",
  productComparison: "/product-comparison",
  product: (id: string) => `/product/${id}`,
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  faq: "/faq",
} as const;
