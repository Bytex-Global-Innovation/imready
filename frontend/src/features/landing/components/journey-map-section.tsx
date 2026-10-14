"use client";

import { useState } from "react";
import type { LucideIcon } from "@/components/icons";
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
  ChevronRight,
} from "@/components/icons";
import { JOURNEY_MAP_SECTION, JOURNEY_MAP_STAGES } from "@/constants/landing";
import { cn } from "@/lib/utils";

type StageTone = {
  progress: string;
  connectorDot: string;
  cardActive: string;
  badgeActive: string;
  accent: string;
  badgeSoft: string;
  mindset: string;
  cardIcon: string;
};

/** Per-stage visual tokens — keeps JSX free of repeated color conditionals. */
const STAGE_TONES: StageTone[] = [
  {
    progress: "bg-brand-600",
    connectorDot: "border-brand-300",
    cardActive: "border-brand-600 bg-brand-50 shadow-md shadow-brand-100",
    badgeActive: "border-brand-600 bg-brand-600 text-white",
    accent: "text-brand-600",
    badgeSoft: "border-brand-100 bg-brand-50 text-brand-700",
    mindset: "border-brand-100 bg-brand-50",
    cardIcon: "bg-brand-50 text-brand-600",
  },
  {
    progress: "bg-cyan-500",
    connectorDot: "border-cyan-300",
    cardActive: "border-cyan-500 bg-cyan-50 shadow-md shadow-cyan-100",
    badgeActive: "border-cyan-500 bg-cyan-500 text-white",
    accent: "text-cyan-600",
    badgeSoft: "border-cyan-100 bg-cyan-50 text-cyan-700",
    mindset: "border-cyan-100 bg-cyan-50",
    cardIcon: "bg-cyan-50 text-cyan-600",
  },
  {
    progress: "bg-violet-500",
    connectorDot: "border-violet-300",
    cardActive: "border-violet-500 bg-violet-50 shadow-md shadow-violet-100",
    badgeActive: "border-violet-500 bg-violet-500 text-white",
    accent: "text-violet-600",
    badgeSoft: "border-violet-100 bg-violet-50 text-violet-700",
    mindset: "border-violet-100 bg-violet-50",
    cardIcon: "bg-violet-50 text-violet-600",
  },
  {
    progress: "bg-purple-400",
    connectorDot: "border-purple-300",
    cardActive: "border-purple-400 bg-purple-50 shadow-md shadow-purple-100",
    badgeActive: "border-purple-400 bg-purple-400 text-white",
    accent: "text-purple-600",
    badgeSoft: "border-purple-100 bg-purple-50 text-purple-700",
    mindset: "border-purple-100 bg-purple-50",
    cardIcon: "bg-purple-50 text-purple-600",
  },
  {
    progress: "bg-amber-500",
    connectorDot: "border-amber-300",
    cardActive: "border-amber-500 bg-amber-50 shadow-md shadow-amber-100",
    badgeActive: "border-amber-500 bg-amber-500 text-white",
    accent: "text-amber-600",
    badgeSoft: "border-amber-100 bg-amber-50 text-amber-700",
    mindset: "border-amber-100 bg-amber-50",
    cardIcon: "bg-amber-50 text-amber-600",
  },
];

const NODE_ICONS: LucideIcon[] = [Leaf, BarChart2, ShieldCheck, Briefcase, Trophy];

const CARD_ICONS: LucideIcon[][] = [
  [Target, Users, FolderOpen, MessageSquare],
  [CalendarDays, RefreshCw, BarChart2, Wrench],
  [Award, Link2, Lock, Bell],
  [Briefcase, DollarSign, Layers, Globe],
  [Trophy, Rocket, GraduationCap, Star],
];

const STAGE_TRACK_SCROLL =
  "mt-12 overflow-x-scroll pb-3 [scrollbar-width:thin] [scrollbar-color:var(--border)_var(--surface-alt)] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-surface-alt [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border";

const STAGE_CARD_BASE =
  "group relative flex w-[100px] shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 transition-all duration-300 ease-out lg:w-[130px] lg:gap-2.5 lg:rounded-2xl lg:px-3 lg:py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-hero-accent focus-visible:ring-offset-2";

function StageConnector({
  segmentIndex,
  activeStage,
}: {
  segmentIndex: number;
  activeStage: number;
}) {
  const isFilled = activeStage > 0 && segmentIndex < activeStage;
  const hasPulse = activeStage > 0 && segmentIndex === activeStage - 1;
  const tone = STAGE_TONES[activeStage];

  return (
    <div className="relative flex flex-1 items-center" aria-hidden="true">
      <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-border">
        {isFilled && (
          <div className={cn("absolute inset-0", tone.progress)}>
            <div className="pointer-events-none absolute inset-0 w-2/5 animate-pulse bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>
        )}
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className={cn(
            "h-2.5 w-2.5 rounded-full border-2 bg-white transition-all duration-500",
            isFilled ? tone.connectorDot : "border-border",
            hasPulse && "animate-pulse",
          )}
        />
      </div>
    </div>
  );
}

function StageTrackCard({
  stage,
  index,
  isActive,
  onSelect,
}: {
  stage: (typeof JOURNEY_MAP_STAGES)[number];
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const tone = STAGE_TONES[index];
  const NodeIcon = NODE_ICONS[index];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        STAGE_CARD_BASE,
        isActive
          ? tone.cardActive
          : "border-border bg-white hover:border-border/80 hover:bg-hero hover:shadow-sm",
      )}
      aria-pressed={isActive}
      aria-label={`Stage ${stage.num} — ${stage.name}`}
    >
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border-2 font-display text-[10px] font-bold transition-all duration-300 lg:h-8 lg:w-8 lg:text-xs",
          isActive
            ? tone.badgeActive
            : "border-border bg-white text-hero-body group-hover:border-hero-accent/30 group-hover:text-hero-accent",
        )}
      >
        {stage.num}
      </div>

      <NodeIcon
        size={30}
        strokeWidth={1.75}
        className={cn(
          "h-5 w-5 transition-all duration-300 lg:h-[30px] lg:w-[30px]",
          isActive ? tone.accent : "text-hero-body group-hover:text-hero-accent",
        )}
        aria-hidden="true"
      />

      <span
        className={cn(
          "text-xs font-bold tracking-tight transition-colors duration-300 lg:text-sm",
          isActive ? tone.accent : "text-hero-heading",
        )}
      >
        {stage.name}
      </span>

      <span
        className={cn(
          "flex items-center gap-0.5 text-[10px] font-semibold transition-colors duration-300 lg:text-xs",
          isActive ? tone.accent : "text-hero-body group-hover:text-hero-heading",
        )}
      >
        {isActive ? "Current Stage" : "Explore Stage"}
        {!isActive && <ArrowRight size={11} strokeWidth={2.5} aria-hidden="true" />}
      </span>
    </button>
  );
}

function StageDetailPanel({
  stage,
  tone,
  cardIcons,
}: {
  stage: (typeof JOURNEY_MAP_STAGES)[number];
  tone: StageTone;
  cardIcons: LucideIcon[];
}) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-opacity duration-300">
      <div className={cn("h-0.5 w-full transition-colors duration-500", tone.progress)} />

      <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_280px] lg:gap-10">
        <div>
          <span
            className={cn(
              "inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest",
              tone.badgeSoft,
            )}
          >
            Stage {stage.num} — {stage.name}
          </span>

          <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-hero-heading sm:text-3xl sm:leading-snug">
            {stage.headline}
          </h3>

          <p className="mt-3 text-base leading-relaxed text-hero-body">{stage.desc}</p>

          <ul className="mt-5 space-y-2.5">
            {stage.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span className={cn("mt-0.5 shrink-0", tone.accent)}>
                  <Check size={15} strokeWidth={2.8} aria-hidden="true" />
                </span>
                <span className="text-sm leading-relaxed text-hero-heading">{point}</span>
              </li>
            ))}
          </ul>


          <div className={cn("mt-6 rounded-xl border px-4 py-4", tone.mindset)}>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-hero-body">
              Mindset Shift
            </p>
            <p className={cn("text-sm font-semibold leading-relaxed italic", tone.accent)}>
              &ldquo;{stage.mindset}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {stage.cards.map((label, cardIdx) => {
            const Icon = cardIcons[cardIdx];
            return (
              <div
                key={label}
                className="group/card flex items-center gap-3 rounded-xl border border-border bg-white p-3.5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border/60 hover:shadow-md"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover/card:scale-110",
                    tone.cardIcon,
                  )}
                >
                  {Icon && <Icon size={15} strokeWidth={2} aria-hidden="true" />}
                </div>
                <span className="text-sm font-medium leading-snug text-hero-heading">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function JourneyMapSection() {
  const [active, setActive] = useState(0);
  const [panelKey, setPanelKey] = useState(0);

  function handleStageChange(index: number) {
    if (index === active) return;
    setActive(index);
    setPanelKey((key) => key + 1);
  }

  const stage = JOURNEY_MAP_STAGES[active];
  const tone = STAGE_TONES[active];

  return (
    <section id="journey" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-hero-accent">
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
          <div className="mt-5 flex justify-center sm:mt-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-hero-accent shadow-sm sm:px-5 sm:text-base">
              <MousePointerClick size={17} strokeWidth={2.25} aria-hidden="true" />
              {JOURNEY_MAP_SECTION.hint}
              <ChevronRight size={17} strokeWidth={2.25} aria-hidden="true" />
            </p>
          </div>
        </div>

        <div className={STAGE_TRACK_SCROLL}>
          <div className="flex min-w-[560px] items-center px-2 lg:min-w-[700px]">
            {JOURNEY_MAP_STAGES.flatMap((stageItem, index) => {
              const items = [
                <StageTrackCard
                  key={stageItem.num}
                  stage={stageItem}
                  index={index}
                  isActive={index === active}
                  onSelect={() => handleStageChange(index)}
                />,
              ];

              if (index < JOURNEY_MAP_STAGES.length - 1) {
                items.push(
                  <StageConnector
                    key={`connector-${stageItem.num}`}
                    segmentIndex={index}
                    activeStage={active}
                  />,
                );
              }

              return items;
            })}
          </div>
        </div>

        <div key={panelKey}>
          <StageDetailPanel
            stage={stage}
            tone={tone}
            cardIcons={CARD_ICONS[active]}
          />
        </div>
      </div>
    </section>
  );
}
