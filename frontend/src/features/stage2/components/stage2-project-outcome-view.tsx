"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import { ROUTES } from "@/constants/routes";
import type { ProjectTeam, ProjectTeamMember, Stage2Outcome } from "@/lib/api";
import { MaterialSymbol } from "./material-symbol";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function memberRole(member: ProjectTeamMember, team: ProjectTeam) {
  if (String(member.studentId) === String(team.leadStudentId)) {
    return "Team Lead";
  }
  if (member.domain) return member.domain;
  return member.role === "CREATOR" ? "Team Creator" : "Team Member";
}

export function Stage2ProjectOutcomeView({
  detail,
  team,
  outcome,
}: {
  detail: Stage2ProjectDetail;
  team: ProjectTeam;
  outcome?: Stage2Outcome | null;
}) {
  const { student } = useStudentProfile();
  const accepted = useMemo(
    () => team.members.filter((m) => m.status === "ACCEPTED"),
    [team.members],
  );

  const selectedIds = useMemo(() => {
    if (outcome?.available && outcome.selectedStudentIds?.length) {
      return new Set(outcome.selectedStudentIds.map(String));
    }
    // Fallback demo selection when feedback is not published yet.
    const ids = new Set<string>();
    const lead = accepted.find(
      (m) => String(m.studentId) === String(team.leadStudentId),
    );
    if (lead) ids.add(String(lead.studentId));
    const other = accepted.find(
      (m) => String(m.studentId) !== String(team.leadStudentId),
    );
    if (other) ids.add(String(other.studentId));
    if (ids.size === 0 && accepted[0]) ids.add(String(accepted[0].studentId));
    return ids;
  }, [accepted, outcome, team.leadStudentId]);

  const youSelected =
    student?.id != null && selectedIds.has(String(student.id));

  const profileHref = ROUTES.stage2ProjectProfile(detail.id);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d3b66] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#81a6d7]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b8d4ff]" />
              Stage 2 – Industry Experience
            </span>
            <span className="text-xs font-medium text-[#737780]">
              Board C: Review → Outcome → Opportunity
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#002546]">
            Project Outcome &amp; Next Opportunities
          </h1>
          <p className="mt-1 text-sm text-[#42474f]">
            Your project is submitted. The industry owner reviews your work and shares
            feedback. Get your outcome and next opportunity.
          </p>
        </div>
        <div className="inline-flex items-center gap-3 self-start rounded-xl bg-white px-3 py-2 shadow-sm md:self-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d3e4fe] text-[#153a75]">
            <MaterialSymbol name="workspace_premium" className="text-[20px]" filled />
          </div>
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#42474f]">
              Project Evaluation
            </span>
            <span className="text-sm font-bold text-[#002546]">
              Offer Confirmed · Stage 3
            </span>
          </div>
        </div>
      </section>

      <div className="mb-4">
        <Link
          href={ROUTES.stage2ProjectOwnerFeedback(detail.id)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#42474f] hover:text-[#002546]"
        >
          <MaterialSymbol name="arrow_back" className="text-[18px]" />
          Back to Owner Feedback
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-6">
          <div className="flex items-center justify-between rounded-lg bg-[#eff4ff] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#002e97] text-[11px] font-bold text-white">
                27
              </span>
              <span className="text-sm font-bold text-[#002546]">Project Outcome</span>
            </div>
            <span className="text-[11px] font-semibold text-[#42474f]">
              See your result and next steps
            </span>
          </div>

          <div className="relative flex flex-col gap-5 overflow-hidden rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md lg:p-6">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#153a75] via-[#b8d4ff] to-[#0d3b66]" />
            <div className="flex flex-col items-center pt-1 text-center">
              <div className="relative mb-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#d3e4fe]/60 shadow-inner">
                  <MaterialSymbol
                    name="military_tech"
                    className="text-[42px] text-[#153a75]"
                    filled
                  />
                </div>
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#153a75] text-white shadow-sm">
                  <MaterialSymbol name="done" className="text-[14px]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#002546]">
                You’ve been selected!
              </h2>
              <p className="mt-1 max-w-sm text-sm text-[#42474f]">
                The project owner wants to continue working with your team.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-xl bg-[#eff4ff] p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#0d3b66] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  Next Step
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#153a75]">
                  <MaterialSymbol name="lock_open" className="text-[14px]" />
                  Unlocked
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#002546]">
                  Stage 3 – Paid Industry Project
                </h3>
                <p className="mt-1 text-sm text-[#42474f]">
                  You are invited to continue to a real industry project with {detail.company}.
                </p>
              </div>
              <Link
                href={profileHref}
                className="mt-1 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#153a75] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#102b55]"
              >
                View Opportunity
                <MaterialSymbol name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm lg:p-6">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737780]">
                Alternative Outcome (Example)
              </span>
              <span className="rounded bg-[#dce9ff] px-2 py-0.5 text-[11px] font-semibold text-[#c3c6d0]">
                Reference View
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#dce9ff]">
                <MaterialSymbol name="star" className="text-[24px] text-[#737780]" filled />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#002546]">Project Complete</h3>
                <p className="text-sm text-[#42474f]">
                  You completed a verified industry project.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                "Industry experience gained",
                "READY evidence created",
                "Final proof of work",
                "Industry feedback received",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-lg bg-[#eff4ff] p-2"
                >
                  <MaterialSymbol
                    name="check_circle"
                    className="text-[20px] text-[#153a75]"
                    filled
                  />
                  <span className="text-xs font-medium text-[#0b1c30]">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-[#dce9ff]/60 p-3">
              <MaterialSymbol
                name="schedule"
                className="mt-0.5 shrink-0 text-[22px] text-[#002e97]"
              />
              <p className="text-sm leading-relaxed text-[#42474f]">
                Your journey doesn’t end here. Explore more industry projects and keep building
                your experience.
              </p>
            </div>
            <Link
              href={ROUTES.freeProjects}
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#e5eeff] px-4 py-2.5 text-sm font-semibold text-[#002546] transition-colors hover:bg-[#dce9ff]"
            >
              Explore Next Project
              <MaterialSymbol name="arrow_forward" className="text-[18px]" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-6">
          <div className="flex items-center justify-between rounded-lg bg-[#eff4ff] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#153a75] text-[11px] font-bold text-white">
                28
              </span>
              <span className="text-sm font-bold text-[#002546]">Individual Selection</span>
            </div>
            <Link
              href={ROUTES.stage2ProjectWorkspace(detail.id)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#002546] hover:text-[#204874]"
            >
              ← Workspace
            </Link>
          </div>

          <div className="relative flex flex-col gap-5 overflow-hidden rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md lg:p-6">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#d3e4fe]/30 blur-2xl" />
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3 flex items-center justify-center">
                <div className="flex h-20 w-20 rotate-3 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#d3e4fe] via-[#e5eeff] to-white shadow-sm transition-transform hover:rotate-0">
                  <MaterialSymbol
                    name="auto_awesome"
                    className="text-[44px] text-[#153a75]"
                    filled
                  />
                </div>
                <MaterialSymbol
                  name="star"
                  className="absolute -top-2 left-0 animate-pulse text-[18px] text-[#153a75]"
                />
                <MaterialSymbol
                  name="hotel_class"
                  className="absolute -right-3 -top-1 text-[20px] text-[#153a75]"
                />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#002546]">
                {youSelected ? "You’ve been selected!" : "Team selections are in"}
              </h2>
              <p className="mt-1 max-w-sm text-sm text-[#42474f]">
                {youSelected
                  ? "The project owner has invited you to continue into a paid project."
                  : "Some teammates were invited to Stage 3. Keep building — more opportunities are ahead."}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#d3e4fe]/60 px-3 py-1.5 text-xs font-semibold text-[#153a75]">
                <MaterialSymbol name="verified_user" className="text-[18px]" />
                {youSelected
                  ? "You are one of the selected students from your team."
                  : "Selection is individual — outcomes can differ within a team."}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl bg-[#eff4ff] p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailTile
                  icon="assignment"
                  label="Project"
                  value={detail.title}
                />
                <DetailTile
                  icon="corporate_fare"
                  label="Company"
                  value={detail.company}
                />
                <DetailTile
                  icon="engineering"
                  label="Role"
                  value="Product Research (Stage 3)"
                />
                <DetailTile
                  icon="calendar_today"
                  label="Start Date"
                  value="Tentative — to be confirmed"
                />
              </div>
              <Link
                href={profileHref}
                className="mt-1 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#153a75] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#102b55]"
              >
                View Opportunity
                <MaterialSymbol name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>

            <div className="pt-1">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#002546]">Other Team Members</h3>
                <span className="text-[11px] font-semibold text-[#737780]">
                  Stage 3 Roster Status
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {accepted.map((member) => {
                  const selected = selectedIds.has(String(member.studentId));
                  return (
                    <div
                      key={member.id}
                      className={
                        selected
                          ? "flex items-center justify-between rounded-xl bg-[#eff4ff] p-3 transition-colors hover:bg-[#e5eeff]"
                          : "flex items-center justify-between rounded-xl bg-[#eff4ff]/70 p-3 transition-colors hover:bg-[#e5eeff]"
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={
                            selected
                              ? "flex h-10 w-10 items-center justify-center rounded-full bg-[#002546] text-xs font-bold text-white shadow-sm"
                              : "flex h-10 w-10 items-center justify-center rounded-full bg-[#cbdbf5] text-xs font-bold text-[#42474f] shadow-sm"
                          }
                        >
                          {initials(member.studentName)}
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-[#002546]">
                            {member.studentName}
                          </span>
                          <span className="text-[11px] font-medium text-[#42474f]">
                            {memberRole(member, team)}
                          </span>
                        </div>
                      </div>
                      {selected ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#d3e4fe] px-3 py-1 text-xs font-semibold text-[#153a75]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#153a75]" />
                          Selected
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[#dce9ff] px-3 py-1 text-xs font-medium text-[#42474f]">
                          Not selected
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function DetailTile({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-white p-2 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e5eeff] text-[#002546]">
        <MaterialSymbol name={icon} className="text-[20px]" />
      </div>
      <div className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase text-[#737780]">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold text-[#002546]">{value}</span>
      </div>
    </div>
  );
}
