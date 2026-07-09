"use client";

import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Leaf,
  BarChart2,
  ShieldCheck,
  Briefcase,
  Trophy,
  Target,
  Users,
  FolderOpen,
  MessageSquare,
  CalendarDays,
  RefreshCw,
  Wrench,
  Award,
  Link2,
  Lock,
  Bell,
  DollarSign,
  Layers,
  Globe,
  Rocket,
  GraduationCap,
  Star,
  Check,
  ArrowRight,
  MousePointerClick,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { JOURNEY_MAP_SECTION, JOURNEY_MAP_STAGES } from "@/constants";
import { cn } from "@/lib/utils";

/* ─── Representative icon per stage (shown in the track card) ─── */
const NODE_ICONS: LucideIcon[] = [Leaf, BarChart2, ShieldCheck, Briefcase, Trophy];

/* ─── Lucide icons per stage panel card (5 stages × 4 cards) ─── */
const CARD_ICONS: LucideIcon[][] = [
  [Target, Users, FolderOpen, MessageSquare],
  [CalendarDays, RefreshCw, BarChart2, Wrench],
  [Award, Link2, Lock, Bell],
  [Briefcase, DollarSign, Layers, Globe],
  [Trophy, Rocket, GraduationCap, Star],
];

/* ─── Per-stage static colour tokens ─── */
const STAGE_STYLES = [
  {
    nodeActive: "bg-brand-600 text-white border-brand-600",
    nodePulseClass: "imr-node-pulse-0",
    progressBg: "bg-brand-600",
    progressWidth: "w-0",
    accent: "text-brand-600",
    cardActiveBorder: "border-brand-600",
    cardActiveBg: "bg-brand-50",
    cardActiveShadow: "shadow-brand-100",
    badgeFill: "bg-brand-600 border-brand-600 text-white",
    badgeBg: "bg-brand-50 text-brand-700",
    badgeBorder: "border-brand-100",
    mindsetBg: "bg-brand-50 border-brand-100",
    cardIconBg: "bg-brand-50 text-brand-600",
    connectorDot: "border-brand-300 bg-white",
  },
  {
    nodeActive: "bg-cyan-500 text-white border-cyan-500",
    nodePulseClass: "imr-node-pulse-1",
    progressBg: "bg-cyan-500",
    progressWidth: "w-1/4",
    accent: "text-cyan-600",
    cardActiveBorder: "border-cyan-500",
    cardActiveBg: "bg-cyan-50",
    cardActiveShadow: "shadow-cyan-100",
    badgeFill: "bg-cyan-500 border-cyan-500 text-white",
    badgeBg: "bg-cyan-50 text-cyan-700",
    badgeBorder: "border-cyan-100",
    mindsetBg: "bg-cyan-50 border-cyan-100",
    cardIconBg: "bg-cyan-50 text-cyan-600",
    connectorDot: "border-cyan-300 bg-white",
  },
  {
    nodeActive: "bg-violet-500 text-white border-violet-500",
    nodePulseClass: "imr-node-pulse-2",
    progressBg: "bg-violet-500",
    progressWidth: "w-1/2",
    accent: "text-violet-600",
    cardActiveBorder: "border-violet-500",
    cardActiveBg: "bg-violet-50",
    cardActiveShadow: "shadow-violet-100",
    badgeFill: "bg-violet-500 border-violet-500 text-white",
    badgeBg: "bg-violet-50 text-violet-700",
    badgeBorder: "border-violet-100",
    mindsetBg: "bg-violet-50 border-violet-100",
    cardIconBg: "bg-violet-50 text-violet-600",
    connectorDot: "border-violet-300 bg-white",
  },
  {
    nodeActive: "bg-purple-400 text-white border-purple-400",
    nodePulseClass: "imr-node-pulse-3",
    progressBg: "bg-purple-400",
    progressWidth: "w-3/4",
    accent: "text-purple-600",
    cardActiveBorder: "border-purple-400",
    cardActiveBg: "bg-purple-50",
    cardActiveShadow: "shadow-purple-100",
    badgeFill: "bg-purple-400 border-purple-400 text-white",
    badgeBg: "bg-purple-50 text-purple-700",
    badgeBorder: "border-purple-100",
    mindsetBg: "bg-purple-50 border-purple-100",
    cardIconBg: "bg-purple-50 text-purple-600",
    connectorDot: "border-purple-300 bg-white",
  },
  {
    nodeActive: "bg-amber-500 text-white border-amber-500",
    nodePulseClass: "imr-node-pulse-4",
    progressBg: "bg-amber-500",
    progressWidth: "w-full",
    accent: "text-amber-600",
    cardActiveBorder: "border-amber-500",
    cardActiveBg: "bg-amber-50",
    cardActiveShadow: "shadow-amber-100",
    badgeFill: "bg-amber-500 border-amber-500 text-white",
    badgeBg: "bg-amber-50 text-amber-700",
    badgeBorder: "border-amber-100",
    mindsetBg: "bg-amber-50 border-amber-100",
    cardIconBg: "bg-amber-50 text-amber-600",
    connectorDot: "border-amber-300 bg-white",
  },
] as const;

/* ─── Scoped animation keyframes (no globals.css touch) ─── */
const ANIMATION_CSS = `
  @keyframes imr-node-pulse-0 {
    0%,100% { box-shadow: 0 0 0 0 rgba(21,58,117,0.45); }
    55%     { box-shadow: 0 0 0 10px rgba(21,58,117,0); }
  }
  @keyframes imr-node-pulse-1 {
    0%,100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.45); }
    55%     { box-shadow: 0 0 0 10px rgba(6,182,212,0); }
  }
  @keyframes imr-node-pulse-2 {
    0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.45); }
    55%     { box-shadow: 0 0 0 10px rgba(139,92,246,0); }
  }
  @keyframes imr-node-pulse-3 {
    0%,100% { box-shadow: 0 0 0 0 rgba(192,132,252,0.45); }
    55%     { box-shadow: 0 0 0 10px rgba(192,132,252,0); }
  }
  @keyframes imr-node-pulse-4 {
    0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.45); }
    55%     { box-shadow: 0 0 0 10px rgba(245,158,11,0); }
  }
  .imr-node-pulse-0 { animation: imr-node-pulse-0 2.2s ease-in-out infinite; }
  .imr-node-pulse-1 { animation: imr-node-pulse-1 2.2s ease-in-out infinite; }
  .imr-node-pulse-2 { animation: imr-node-pulse-2 2.2s ease-in-out infinite; }
  .imr-node-pulse-3 { animation: imr-node-pulse-3 2.2s ease-in-out infinite; }
  .imr-node-pulse-4 { animation: imr-node-pulse-4 2.2s ease-in-out infinite; }

  @keyframes imr-shimmer {
    0%   { transform: translateX(-140%); }
    100% { transform: translateX(240%); }
  }
  .imr-shimmer { animation: imr-shimmer 2.6s ease-in-out infinite; }

  @keyframes imr-panel-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .imr-panel-in { animation: imr-panel-in 0.38s cubic-bezier(0.4,0,0.2,1) both; }

`;

/* ─── Connector between stage cards ─── */
function StageConnector({ segmentIndex, isFilled }: { segmentIndex: number; isFilled: boolean }) {
  const st = STAGE_STYLES[segmentIndex];
  return (
    <div className="relative flex flex-1 items-center" aria-hidden="true">
      {/* Track line */}
      <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-border">
        {isFilled && (
          <div className={cn("absolute inset-0", st.progressBg)}>
            <div className="imr-shimmer pointer-events-none absolute inset-0 w-2/5 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>
        )}
      </div>
      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className={cn(
            "h-2.5 w-2.5 rounded-full border-2 bg-white transition-all duration-500",
            isFilled ? st.connectorDot : "border-border",
          )}
        />
      </div>
    </div>
  );
}

/* ─── Main section ─── */
export function JourneyMapSection() {
  const [active, setActive] = useState(0);
  const [panelKey, setPanelKey] = useState(0);

  function handleStageChange(i: number) {
    if (i === active) return;
    setActive(i);
    setPanelKey((k) => k + 1);
  }

  const stage = JOURNEY_MAP_STAGES[active];
  const styles = STAGE_STYLES[active];
  const ActiveCardIcons = CARD_ICONS[active];

  return (
    <section id="journey" className="py-16 sm:py-24">
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_CSS }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-hero-accent">
            <Sparkles size={14} strokeWidth={2.25} aria-hidden="true" />
            {JOURNEY_MAP_SECTION.eyebrow}
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-hero-heading sm:text-4xl lg:text-5xl">
            {JOURNEY_MAP_SECTION.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-hero-body sm:text-lg">
            {JOURNEY_MAP_SECTION.description}
          </p>
          <p className="mt-1 text-base leading-relaxed text-hero-body sm:text-lg">
            {JOURNEY_MAP_SECTION.subdescription}
          </p>
          <p className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-medium text-hero-accent sm:mt-6 sm:text-base">
            <MousePointerClick size={17} strokeWidth={2.25} aria-hidden="true" />
            {JOURNEY_MAP_SECTION.hint}
            <ChevronDown size={17} strokeWidth={2.25} aria-hidden="true" />
          </p>
        </div>

        {/* ── Stage Track ── */}
        <div className="mt-12 overflow-x-auto pb-2">
          <div className="flex min-w-[700px] items-center px-2">
            {JOURNEY_MAP_STAGES.map((s, i) => {
              const isActive = i === active;
              const isPast = i < active;
              const st = STAGE_STYLES[i];
              const NodeIcon = NODE_ICONS[i];

              return (
                <React.Fragment key={s.num}>
                  {/* Stage card */}
                  <button
                    onClick={() => handleStageChange(i)}
                    className={cn(
                      "group relative flex w-[130px] shrink-0 cursor-pointer flex-col items-center gap-2.5 rounded-2xl border-2 px-3 py-4",
                      "transition-all duration-300 ease-out",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-hero-accent focus-visible:ring-offset-2",
                      isActive
                        ? cn(
                            "shadow-md",
                            st.cardActiveBorder,
                            st.cardActiveBg,
                            st.cardActiveShadow,
                          )
                        : "border-border bg-white hover:border-border/80 hover:bg-hero hover:shadow-sm",
                    )}
                    aria-pressed={isActive}
                    aria-label={`Stage ${s.num} — ${s.name}`}
                  >
                    {/* Number badge */}
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2",
                        "font-display text-xs font-bold transition-all duration-300",
                        isActive
                          ? cn(st.badgeFill, st.nodePulseClass)
                          : isPast
                            ? cn(st.badgeFill, "opacity-70")
                            : "border-border bg-white text-hero-body group-hover:border-hero-accent/30 group-hover:text-hero-accent",
                      )}
                    >
                      {isPast ? (
                        <Check size={12} strokeWidth={3} aria-hidden="true" />
                      ) : (
                        s.num
                      )}
                    </div>

                    {/* Stage icon */}
                    <NodeIcon
                      size={30}
                      strokeWidth={1.75}
                      className={cn(
                        "transition-all duration-300",
                        isActive
                          ? st.accent
                          : isPast
                            ? cn(st.accent, "opacity-60")
                            : "text-hero-body group-hover:text-hero-accent",
                      )}
                      aria-hidden="true"
                    />

                    {/* Stage name */}
                    <span
                      className={cn(
                        "text-sm font-bold tracking-tight transition-colors duration-300",
                        isActive ? st.accent : "text-hero-heading",
                      )}
                    >
                      {s.name}
                    </span>

                    {/* Explore Stage → */}
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-[11px] font-semibold transition-colors duration-300",
                        isActive ? st.accent : "text-hero-body group-hover:text-hero-heading",
                      )}
                    >
                      Explore Stage
                      <ArrowRight size={11} strokeWidth={2.5} aria-hidden="true" />
                    </span>
                  </button>

                  {/* Connector segment */}
                  {i < JOURNEY_MAP_STAGES.length - 1 && (
                    <StageConnector
                      segmentIndex={i}
                      isFilled={i < active}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── Stage Detail Panel ── */}
        <div
          key={panelKey}
          className="imr-panel-in mt-8 overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
        >
          {/* Coloured top accent stripe */}
          <div className={cn("h-[3px] w-full transition-colors duration-500", styles.progressBg)} />

          <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_280px] lg:gap-10">

            {/* Left — content */}
            <div>
              <span
                className={cn(
                  "inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest",
                  styles.badgeBg,
                  styles.badgeBorder,
                )}
              >
                Stage {stage.num} — {stage.name}
              </span>

              <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-hero-heading sm:text-[1.75rem] sm:leading-snug">
                {stage.headline}
              </h3>

              <p className="mt-3 text-base leading-relaxed text-hero-body">
                {stage.desc}
              </p>

              <ul className="mt-5 space-y-2.5">
                {stage.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className={cn("mt-0.5 shrink-0", styles.accent)}>
                      <Check size={15} strokeWidth={2.8} aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-relaxed text-hero-heading">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Mindset quote */}
              <div className={cn("mt-6 rounded-xl border px-4 py-4", styles.mindsetBg)}>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-hero-body">
                  Mindset Shift
                </p>
                <p className={cn("text-sm font-semibold leading-relaxed italic", styles.accent)}>
                  &ldquo;{stage.mindset}&rdquo;
                </p>
              </div>
            </div>

            {/* Right — visual cards */}
            <div className="flex flex-col gap-2.5">
              {stage.cards.map((label, cardIdx) => {
                const Icon = ActiveCardIcons[cardIdx];
                return (
                  <div
                    key={label}
                    className="group/card flex items-center gap-3 rounded-xl border border-border bg-white p-3.5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border/60 hover:shadow-md"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        "transition-transform duration-200 group-hover/card:scale-110",
                        styles.cardIconBg,
                      )}
                    >
                      {Icon && <Icon size={15} strokeWidth={2} aria-hidden="true" />}
                    </div>
                    <span className="text-sm font-medium leading-snug text-hero-heading">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
