"use client";

export function Stage2PreviewBanner() {
  return (
    <div className="mx-auto mb-4 w-full max-w-7xl px-4 pt-4 lg:px-8">
      <div className="rounded-lg border border-[#d3e4fe] bg-[#eff4ff] px-3 py-2 text-xs font-medium text-[#153a75]">
        UI preview fallback is enabled when no ACTIVE team is found. Real seeded teams (e.g.
        abc-onboarding) use live API data.
      </div>
    </div>
  );
}
