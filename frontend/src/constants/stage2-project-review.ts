export const REVIEW_PROJECT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDto0WzTtFqrb4JfpZqd5hs_rAs7HgA-apB6pxvNbpoXUGXL3b7rvSCW864XjPJYnXNWD3RyPO2IvFjB0dkn17Py-f0reKH2IcTzdz0A30WmXKH_c7aF8RmxwsNSEjDpwYV2UfBgrRAQG674krNKgOYWdF40DMRB1jU1WE5hpvKrwUfYaAzNrhgkvHFJQzBH08ShGyGztFseryazTG8zIkUedPGddf31Q3r-FRzjIdh";

export const REVIEW_COMPANY_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBn0khLUCBN53krK2GJzs3pO2yZyE3-J-6Tb-zY6O457nYqR9cLWdzilM5uO6joT8p-khvef9l_-pVblsXnw0PlBlypwt3pnMky-qRVrhrQPeVIbE2YfboMV79KjxKNxR1Z7odrfv8pJnK34MgsTiMYGz1LKN-7KRY8u31tai1p1j2cOIWoAvNfr-VmLhTBb0NaHBvpx92s9kEQAytCgdcZWiNS6piCWmpZ798vyam2";

export const REVIEW_TARGET_USER_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCHGxNPXa8sjtDnx53ix2NLn9goPGLYQvHQKVClq18DBvk3wmy6ReSaGBZKlhN-RnS0bwZ40NlMpmysFt5zapn3sHzhKdfmPU4BUiaHW3sBczN6HXtok4X4dhoqHNs6xusZJHn5jTLnry2p6THwq2nd69RT_kBFDyMmmkUNyC6KkPbi_rDs-vaiqN17izZi9bE99Ie_ZlXgFNnmApt95pHMz4nHrsHvnAfXqS6I3pHa";

export const REVIEW_DEMO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCnILGmsW8dG6rWwJtn_3mOuu1ck7CXX5cN8-iuBVrta3UYIkFR-Nljvmn2JIYseQhUJumzCv1NFhyoFZoVnYKa2qtuUchLt_Y1GVy03f5hE_weZCp4yC6IsoWGpkosutGIbvmfN7GXzyj-bBMHf4xPdNJu2e0BMOEf2xGA1YtndCCagVPZzm3OKWiLMNJcMSii9fy5jap2DEtxScKLHC7RWL7y0RPdyWDvv4rONN36";

export type ReviewEvidenceCard = {
  id: string;
  label: string;
  value: string;
  imageSrc: string;
  done?: boolean;
  badge?: string;
  highlight?: boolean;
  metric?: string;
};

export const ITERATION_1_EVIDENCE: readonly ReviewEvidenceCard[] = [
  {
    id: "i1-discovered",
    label: "What they discovered",
    value: "5 user interviews, 3 key insights",
    done: true,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDhaRfokpmlRLi36RpxdTkKgOcwHeDN5zkMTfTxY0KySo7OqHDLzoO5qc0mKnKcIIaqOcO7TfPdI27LsROB922EjX1s86z_nyqS4ExNWHcB9ZHoyGJBXMeYf-XGM1aMF-O_7vCBxARzXocJ75wZZS3YIcv-FftAt_mf9CCtzLP4ZgdENnJswT8MXWW04KTib1vwvREPRAXADAWltEUXeLhHqB46YtBqx1V6GwSmWRxj",
  },
  {
    id: "i1-built",
    label: "What they built",
    value: "Simplified onboarding flow (v1)",
    done: true,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvf_Bn1752rkIlmpqqs1vYiMkeo68csbCdVQhoApI6vUVB9Cc5hTo3AFj-GTtYQEC9QdcNgMUmWo20HXXA550Y3z3I73C2nNKob7WZNWgmeEYnmIQ6voRU2hrXMebiRV0E7iDpUkEAmVcgKJE7auDxr9ULXz69zS7VRrnyDiZD0l9MXL_fLAmngBgW1OF7QG0EPkUG4bTpmDYiTRW-fn4-o8iQnXLFqZZZhGL-lzbv",
  },
  {
    id: "i1-testing",
    label: "Testing",
    value: "Tested with 5 students",
    badge: "D",
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpJD8-hB1FWwA-GqeYlvgxXTLpTu19sSo9LdXPM_-El2UelOvwYTq5ICqxDuuYZnEHSXlOZTfCQIESXfKAnHPV0U7xCT5U1SHQqNWlYxiT4py5XcSGe6-iW7-kIfUstJ1O1kGaBVN9C0jOT9cO9uFXZBnC66jU6jpUT0ZL2YVbQF1dF2CFTgACZYxAhdMRxEK90DR3w5WmyutlKGnUAdzv8opA72-1nl74jU9mwivA",
  },
  {
    id: "i1-learned",
    label: "What they learned",
    value: "Profile felt too long, unclear benefits",
    badge: "D",
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAq8Gfrs_Zlzg30CgVXjIgE36Hff4sWb9jN6uPQuf9KPkb9OEZZb6IlEPyBE1phnNt7O2sC7i-lrU7uiQ-z_0HV1lCa9-8aUYwKA0Z6I664fLoHap-485-9bJc_ewsFttMYN1vv5TRK_DZd7OBoZzrgvyatp-uXHwGgzfo4JAbv5-7ICAtb56UZpho7k8pzKMl6L0bWRoxFYGJriitFwGAkWhLFr2c0UHMwyEv02bDS",
  },
];

export const ITERATION_2_EVIDENCE: readonly ReviewEvidenceCard[] = [
  {
    id: "i2-changed",
    label: "What changed",
    value: "Reduced fields by 40%, added progress",
    done: true,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBJhMBTN7VjVzkvEnV8iNt0b0QMIUt5xN7PEAtv1DVDH1vV4hFHRp4v5jULM9XS2RFzV72v32Z7BaFg8wHUjd34MSCONXXjMWmpA59gPxku0GOBBKzDsxiS2dK-R1Eo51loQbkUR8ecgpiSd7O_AzFQOwx_VpBD8NQQkcfn_bCAP9Zm0U5Y_zhyqu4RYnY6f0vmMgGVgtsc5tBnmxwGT6YNmNYx97u8ixcBoQkkYDgQ",
  },
  {
    id: "i2-built",
    label: "What they built",
    value: "Improved flow (v2)",
    done: true,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAxs5OvCX3ewQNJhovlneDXt9cvSyBpiq0vgkF1x7kJlx6-dCMLSRDIIs-PjozyAyveT4kzotHFxE66BPyCfp12061UQcPb-ZFhqtD3YnNDtwMhTo2L_28u7mY8iQUDEcMZqYkBMo0l5E-QbdZREflVD9QvRHcVYGaS4NblJxC55RioN-lMrTqh89K58MDhfa8b_fuLII5LTZIsA5CxDnmZVpHRb5jyZXEP4WenyOkC",
  },
  {
    id: "i2-testing",
    label: "Testing",
    value: "Tested with 10 students",
    badge: "9",
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDsnS8p6ryRNcWGvthQqTAegvPnyaI_SjuJCd1nri6h41Ih1T8QHsbnkYMBiZlHG44Mkg6x4Z5hgZjeVWNIyL3kRZE9ekVpFkEVrUF7IxLawkMNmOMys4Nu-7EvfE4AHH6H79R-dkHxy8S-LyL-6RR7MMNJTPwG406ZA3x_s_eZN5YU5CnNNuYehr9jL0PHkpQX9Ph3QLETFkX2ecoD_1sLHw2dRByiYr3xHsfgVhSS",
  },
  {
    id: "i2-results",
    label: "Results",
    value: "Completion rate improved from 28% to 72%",
    badge: "D",
    highlight: true,
    metric: "+44%",
    imageSrc: "",
  },
];

export const OWNER_REVIEW_TABS = [
  "Overview",
  "Iteration 1",
  "Iteration 2",
  "Final Demo",
  "Team",
] as const;
