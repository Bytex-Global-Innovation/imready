"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Award, BadgeCheck, Briefcase, Check, ExternalLink, Flame, Trophy, Users } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DASHBOARD_USER } from "@/constants/dashboard";
import { MISSIONS, READY_SCORE_LABELS } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { ensureFoundationProgress, getTotalXp } from "../lib/mission-progress";

const SCORE_BREAKDOWN: Record<string, number> = { R: 80, E: 75, A: 70, D: 80, Y: 85 };
const OVERALL_SCORE = Math.round(
  Object.values(SCORE_BREAKDOWN).reduce((sum, v) => sum + v, 0) / Object.values(SCORE_BREAKDOWN).length,
);

const NEXT_HORIZON = [
  {
    icon: Briefcase,
    title: "Apply for Real Industry Projects",
    description: "Match with verified startup briefs, campus challenges, and real-world micro-internships.",
    cta: "Apply Now",
  },
  {
    icon: Users,
    title: "Join a Guided Cohort",
    description: "Accelerate your learning curve with dedicated weekly mentor critique, live teardowns, and peer sprints.",
    cta: "View Cohorts",
  },
  {
    icon: BadgeCheck,
    title: "Build Your Verified Portfolio",
    description: "Export public proof-links for recruiters with cryptographic skill verification stamps and notes.",
    cta: "Generate Link",
  },
  {
    icon: Award,
    title: "Connect with Mentors & Peers",
    description: "Directly message engineers, founders, and senior students who evaluated your submissions.",
    cta: "Explore Network",
  },
];

export function FoundationCompleteView() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureFoundationProgress().finally(() => setReady(true));
  }, []);

  const totalXp = useMemo(() => (ready ? getTotalXp() : 0), [ready]);

  if (!ready) {
    return <div className="py-12 text-center text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-semibold tracking-wider text-muted uppercase">
        Journey <span className="mx-1 text-brand-100">/</span> Stage 0: Foundation{" "}
        <span className="mx-1 text-brand-100">/</span> <span className="text-emerald-600">Foundation Complete</span>
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              All 5 Missions Complete{" "}
              <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Foundation Verified
              </span>
            </p>
            <p className="text-xs text-muted">Official milestone assessment finalized &amp; registered on learner ledger.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-amber-600">
            <Flame className="h-4 w-4" /> Total XP +{totalXp || 250} XP
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <Trophy className="h-4 w-4 text-primary" /> Stage Badge: Stage 0 Pass
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-[var(--radius-card)] border border-border bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm lg:col-span-2">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-6 w-6" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Foundation Complete!</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              You took curiosity and turned it into real evidence. That&apos;s a big step.
            </p>
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              <Flame className="h-4 w-4" />
              +{totalXp || 250} READY Points
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs">XP Earned</span>
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <ScoreRing percent={OVERALL_SCORE} />
            <div className="space-y-2.5">
              {MISSIONS.map((mission) => (
                <div key={mission.id} className="flex items-center gap-3 text-sm">
                  <span className="w-5 shrink-0 font-bold text-foreground">{mission.letter}</span>
                  <span className="w-24 shrink-0 text-muted">{READY_SCORE_LABELS[mission.letter].label}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-brand-100">
                    <span
                      className={`block h-full rounded-full ${READY_SCORE_LABELS[mission.letter].color}`}
                      style={{ width: `${SCORE_BREAKDOWN[mission.letter]}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right font-medium text-foreground">{SCORE_BREAKDOWN[mission.letter]}%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted">Your Overall READY Score</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wider text-muted uppercase">Student Profile Verified</p>
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-1 font-display text-base font-bold text-foreground">Foundation Credential</p>

            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {DASHBOARD_USER.name.split(" ").map((part) => part[0]).join("")}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{DASHBOARD_USER.name}</p>
                <p className="text-xs text-muted">B.Tech, 2nd Year • Junior Explorer</p>
              </div>
              <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Active &amp; Validated
              </span>
            </div>

            <p className="mt-4 text-xs font-semibold tracking-wider text-muted uppercase">Demonstrated Strengths</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {["Problem Discovery", "User Empathy", "Rapid Prototyping"].map((strength) => (
                <span key={strength} className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-primary">
                  {strength}
                </span>
              ))}
            </div>

            <p className="mt-4 rounded-[var(--radius-card)] bg-surface p-3 text-xs leading-relaxed text-muted italic">
              &ldquo;{DASHBOARD_USER.name.split(" ")[0]} showcased clear conversational data in Mission 2 and rapidly validated a
              physical prototype in Mission 4.&rdquo;
              <span className="mt-1 block not-italic text-muted">— READY Evaluator</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push(ROUTES.dashboard)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-card)] border border-border bg-white p-4 text-left shadow-sm hover:border-primary"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-surface text-primary">
              <ExternalLink className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-wider text-muted uppercase">Final Proof Submission</p>
              <p className="truncate text-sm font-semibold text-foreground">Canteen Token Prototype</p>
              <p className="truncate text-xs text-muted">Validated by students • Mission 5</p>
            </span>
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          Next Horizon · Stage 1: Accelerated Tracks Available
        </p>
        <h2 className="mt-1 font-display text-xl font-bold text-foreground">
          What&apos;s Next? Open the Door to Bigger Opportunities
        </h2>
        <p className="mt-1 text-sm text-muted">
          You&apos;re now ready for more. You&apos;ve completed the Free Path and built your Foundation Profile.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NEXT_HORIZON.map((item) => (
            <div key={item.title} className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] bg-white text-primary shadow-sm">
                <item.icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
              <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                {item.cta} <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="secondary" onClick={() => router.push(ROUTES.dashboard)}>
            Join Guided Cohort
          </Button>
          <Button variant="secondary" onClick={() => router.push(ROUTES.projects)}>
            Explore Next Steps &amp; Industry Projects
          </Button>
          <Button onClick={() => router.push(ROUTES.dashboard)} className="bg-[#153a75] hover:bg-[#102b55]">
            View My Foundation Profile
          </Button>
        </div>
      </div>

      <p className="mt-6 flex flex-col items-center gap-1 pb-4 text-center text-sm text-muted sm:flex-row sm:justify-between">
        <span className="italic">&ldquo;You don&apos;t just learn. You do. And that changes you.&rdquo;</span>
        <span>Keep going. A more ready you is ahead.</span>
      </p>
    </div>
  );
}

function ScoreRing({ percent }: { percent: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg viewBox="0 0 100 100" className="mx-auto h-32 w-32">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="#10b981"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="46" textAnchor="middle" className="fill-foreground text-[22px] font-bold">
        {percent}%
      </text>
      <text x="50" y="62" textAnchor="middle" className="fill-muted text-[9px] font-semibold tracking-wider uppercase">
        READY
      </text>
    </svg>
  );
}