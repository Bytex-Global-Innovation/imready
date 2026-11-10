"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { type Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import { STAGE2_TEAM_HEADER_IMAGE } from "@/constants/stage2-team-formation";
import { ROUTES } from "@/constants/routes";
import {
  projectsApi,
  type ProjectTeam,
  type ProjectTeamFaculty,
  type ProjectTeamMember,
  type TeamStudentSearchHit,
} from "@/lib/api";
import { MaterialSymbol } from "./material-symbol";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function Stage2TeamFormationView({ detail }: { detail: Stage2ProjectDetail }) {
  const { student } = useStudentProfile();
  const teamMax = Math.max(1, detail.teamSizeMax || 1);
  const teamMin = Math.min(Math.max(1, detail.teamSizeMin || 1), teamMax);

  const [team, setTeam] = useState<ProjectTeam | null>(null);
  const [teamName, setTeamName] = useState("");
  const [faculty, setFaculty] = useState<ProjectTeamFaculty[]>([]);
  const [facultyDraft, setFacultyDraft] = useState("");
  const [showFacultyInput, setShowFacultyInput] = useState(false);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<TeamStudentSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const syncFromTeam = useCallback((next: ProjectTeam | null) => {
    setTeam(next);
    setTeamName(next?.name || "");
    setFaculty(next?.faculty || []);
  }, []);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await projectsApi.getTeam(detail.id);
      if (!result.team) {
        const created = await projectsApi.upsertTeam(detail.id, { name: "" });
        syncFromTeam(created.team);
      } else {
        syncFromTeam(result.team);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team");
    } finally {
      setLoading(false);
    }
  }, [detail.id, syncFromTeam]);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setCandidates([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const result = await projectsApi.searchStudents(q);
        if (cancelled) return;
        const memberIds = new Set((team?.members || []).map((m) => m.studentId));
        setCandidates(result.students.filter((s) => !memberIds.has(s.id)));
      } catch {
        if (!cancelled) setCandidates([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, team?.members]);

  const roster = useMemo(
    () =>
      (team?.members || []).filter(
        (m) => m.status === "ACCEPTED" || m.status === "PENDING",
      ),
    [team],
  );
  const accepted = roster.filter((m) => m.status === "ACCEPTED");
  const reservedCount = roster.length;
  const openSlots = Math.max(0, teamMax - reservedCount);
  const isCreator =
    !team ||
    (student?.id != null && String(team.creatorStudentId) === String(student.id));
  const isActive = team?.status === "ACTIVE";
  const canEdit = Boolean(isCreator) && !isActive;

  const saveMeta = async (overrides?: {
    name?: string;
    leadStudentId?: string;
    faculty?: ProjectTeamFaculty[];
  }) => {
    const payload = {
      name: overrides?.name ?? teamName,
      leadStudentId: overrides?.leadStudentId ?? team?.leadStudentId,
      faculty: overrides?.faculty ?? faculty,
    };
    const result = await projectsApi.upsertTeam(detail.id, payload);
    syncFromTeam(result.team);
    return result.team;
  };

  const inviteStudent = async (candidate: TeamStudentSearchHit) => {
    if (!canEdit || reservedCount >= teamMax || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (!team) {
        await saveMeta({ name: teamName.trim() });
      }
      const result = await projectsApi.inviteToTeam(detail.id, candidate.id);
      syncFromTeam(result.team);
      setSearch("");
      setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
      showToast(`Invite sent to ${candidate.studentName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send invite");
    } finally {
      setBusy(false);
    }
  };

  const cancelInvite = async (member: ProjectTeamMember) => {
    if (!canEdit || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await projectsApi.cancelTeamInvite(detail.id, member.id);
      syncFromTeam(result.team);
      showToast(`Cancelled invite for ${member.studentName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel invite");
    } finally {
      setBusy(false);
    }
  };

  const setLead = async (member: ProjectTeamMember) => {
    if (!canEdit || member.status !== "ACCEPTED" || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await saveMeta({ leadStudentId: member.studentId });
      syncFromTeam(next);
      showToast(`${member.studentName} is now team lead`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update team lead");
    } finally {
      setBusy(false);
    }
  };

  const addFaculty = async () => {
    if (!canEdit) return;
    const name = facultyDraft.trim();
    if (!name) return;
    if (faculty.length >= 2) {
      setError("You can add at most 2 faculty members");
      return;
    }
    const nextFaculty = [...faculty, { name }];
    setBusy(true);
    setError(null);
    try {
      const next = await saveMeta({ faculty: nextFaculty });
      syncFromTeam(next);
      setFacultyDraft("");
      setShowFacultyInput(false);
      showToast(`Added faculty: ${name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add faculty");
    } finally {
      setBusy(false);
    }
  };

  const removeFaculty = async (index: number) => {
    if (!canEdit) return;
    const nextFaculty = faculty.filter((_, i) => i !== index);
    setBusy(true);
    setError(null);
    try {
      const next = await saveMeta({ faculty: nextFaculty });
      syncFromTeam(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove faculty");
    } finally {
      setBusy(false);
    }
  };

  const createTeam = async () => {
    if (!canEdit || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await projectsApi.finalizeTeam(detail.id, {
        name: teamName.trim(),
        leadStudentId: team?.leadStudentId,
        faculty,
      });
      syncFromTeam(result.team);
      showToast("Team created successfully");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create team");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto h-96 w-full max-w-7xl animate-pulse rounded-xl bg-white shadow-sm" />
    );
  }

  return (
    <>
      <div className="mb-6 w-full bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3 rounded-xl bg-[#eff4ff] px-3 py-1 shadow-sm">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg shadow-sm">
              <Image
                src={STAGE2_TEAM_HEADER_IMAGE}
                alt=""
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-tight text-[#002546]">
                {detail.title}
              </span>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[11px] font-medium text-[#42474f]">{detail.company}</span>
                <MaterialSymbol name="verified" className="text-[14px] text-[#153a75]" filled />
                <span className="text-[11px] font-semibold text-[#153a75]">
                  Verified Project Partner
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-[#b8d4ff]/40 px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#153a75]" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#001c38]">
              Stage 2 Flow
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-8 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center md:p-6">
          <div className="flex flex-col">
            <div className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#42474f]">
              <span>Stage 2 • Industry Experience</span>
              <MaterialSymbol name="chevron_right" className="text-[12px]" />
              <span className="font-bold text-[#153a75]">Team Workspace</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#002546]">
              Team Formation & Project Onboarding
            </h1>
          </div>
          <StageStepper activeStep={isActive ? 4 : 3} />
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {isActive && team ? (
          <ReadyView detail={detail} team={team} teamMax={teamMax} />
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="flex flex-col gap-6 lg:col-span-7">
              <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#d3e4ff] px-2 py-0.5 text-[11px] text-[#001c38]">
                      Screen 9: MVP Team Assembly
                    </div>
                    <h2 className="text-[32px] font-bold tracking-tight text-[#002546]">
                      Create your team
                    </h2>
                    <p className="mt-0.5 text-sm text-[#42474f]">
                      Add team members ({detail.teamSize}) to activate your verified industry sprint.
                    </p>
                  </div>
                  <CapacityDonut count={reservedCount} max={teamMax} />
                </div>

                <label className="mb-6 block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#737780]">
                    Team name <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    value={teamName}
                    disabled={!canEdit || busy}
                    maxLength={120}
                    onChange={(e) => setTeamName(e.target.value)}
                    onBlur={() => {
                      if (canEdit && teamName.trim()) {
                        void saveMeta({ name: teamName.trim() }).catch((err) =>
                          setError(
                            err instanceof Error ? err.message : "Could not save team name",
                          ),
                        );
                      }
                    }}
                    placeholder="e.g. Campus Waste Optimizers"
                    className="w-full rounded-lg bg-[#eff4ff] px-3 py-2.5 text-sm text-[#0b1c30] shadow-sm outline-none ring-[#002546] placeholder:text-[#737780] focus:bg-white focus:ring-2 disabled:opacity-60"
                  />
                </label>

                <div className="mb-6 flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737780]">
                    Active Roster (Minimum {teamMin} required)
                  </span>
                  {roster.length === 0 ? (
                    <p className="rounded-xl bg-[#eff4ff]/60 p-4 text-sm text-[#42474f]">
                      You will be added as creator when you send the first invite or save the team name.
                    </p>
                  ) : null}
                  {roster.map((member) => (
                    <RosterRow
                      key={member.id}
                      member={member}
                      canEdit={canEdit}
                      busy={busy}
                      onMakeLead={() => void setLead(member)}
                      onCancelInvite={() => void cancelInvite(member)}
                    />
                  ))}
                  {openSlots > 0 ? (
                    <div className="flex items-center justify-between rounded-xl bg-[#dce9ff]/40 p-3 text-[#42474f]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dce9ff] text-[#737780]">
                          <MaterialSymbol name="person_add" className="text-[22px]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#42474f]">
                            Empty Slot ({reservedCount + 1} of {teamMax})
                          </span>
                          <span className="text-xs text-[#737780]">
                            Search students on the platform to send an invite
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#001c66]">
                        Available
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="mb-6 rounded-xl bg-[#eff4ff] p-3">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#dce9ff] text-[#002546]">
                        <MaterialSymbol name="school" className="text-[22px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#0b1c30]">
                          Faculty members (optional, max 2)
                        </span>
                        <span className="text-xs text-[#42474f]">
                          Assign an academic advisor to validate university credit hours
                        </span>
                      </div>
                    </div>
                    {canEdit && faculty.length < 2 ? (
                      <button
                        type="button"
                        onClick={() => setShowFacultyInput((v) => !v)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-[#002546] shadow-sm transition-all hover:bg-[#dce9ff]"
                      >
                        <MaterialSymbol name="add" className="text-[16px]" />
                        + Add Faculty
                      </button>
                    ) : null}
                  </div>
                  {faculty.length > 0 ? (
                    <ul className="mt-3 flex flex-col gap-2">
                      {faculty.map((item, index) => (
                        <li
                          key={`${item.name}-${index}`}
                          className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-[#002546]">{item.name}</span>
                          {canEdit ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void removeFaculty(index)}
                              className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                            >
                              Remove
                            </button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {showFacultyInput && canEdit ? (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        value={facultyDraft}
                        onChange={(e) => setFacultyDraft(e.target.value)}
                        placeholder="Faculty full name"
                        className="flex-1 rounded-lg bg-white px-3 py-2 text-sm outline-none ring-[#002546] focus:ring-2"
                      />
                      <button
                        type="button"
                        disabled={busy || !facultyDraft.trim()}
                        onClick={() => void addFaculty()}
                        className="rounded-lg bg-[#002546] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Save faculty
                      </button>
                    </div>
                  ) : null}
                </div>

                {canEdit ? (
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => void createTeam()}
                      disabled={
                        busy ||
                        accepted.length < teamMin ||
                        !teamName.trim() ||
                        (team?.pendingCount || 0) > 0
                      }
                      className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#153a75] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#102b55] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy ? "Working…" : "Create Team"}
                      <MaterialSymbol
                        name="arrow_forward"
                        className="text-[20px] transition-transform group-hover:translate-x-1"
                      />
                    </button>
                    <p className="mt-1 text-center text-xs text-[#42474f]">
                      Invites must be accepted before you can create the team. Pending invites appear in{" "}
                      <Link href={ROUTES.notifications} className="font-semibold text-[#153a75] underline">
                        Notifications
                      </Link>
                      .
                    </p>
                  </div>
                ) : (
                  <p className="rounded-xl bg-[#eff4ff] px-4 py-3 text-sm text-[#42474f]">
                    Waiting for the team creator to finalize this team. Check Notifications if you still
                    have a pending invite.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-5">
              <div className="flex h-full flex-col rounded-xl bg-white p-4 shadow-sm lg:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-[#002546]">Find Team Members</h3>
                    <span className="text-xs text-[#42474f]">
                      Search students already on ImReady
                    </span>
                  </div>
                  <span className="rounded bg-[#b8d4ff]/30 px-1 py-0.5 text-[11px] font-semibold text-[#153a75]">
                    {candidates.length} Matches
                  </span>
                </div>
                <div className="relative mb-4 w-full">
                  <MaterialSymbol
                    name="search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#737780]"
                  />
                  <input
                    type="text"
                    value={search}
                    disabled={!canEdit}
                    onChange={(e) => onSearchChangeSafe(e.target.value)}
                    placeholder="Search students by name or email..."
                    className="w-full rounded-lg bg-[#eff4ff] py-2 pl-10 pr-3 text-xs text-[#0b1c30] shadow-sm transition-all placeholder:text-[#737780] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002546] disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {searching ? (
                    <p className="p-3 text-xs text-[#737780]">Searching…</p>
                  ) : search.trim().length > 0 && search.trim().length < 2 ? (
                    <p className="p-3 text-xs text-[#737780]">Type at least 2 characters</p>
                  ) : candidates.length === 0 && search.trim().length >= 2 ? (
                    <p className="p-3 text-xs text-[#737780]">No students found on the platform</p>
                  ) : null}
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-[#eff4ff]/60 p-3 transition-all hover:bg-[#eff4ff]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#002546] text-xs font-bold text-white shadow-sm">
                          {initials(candidate.studentName)}
                        </div>
                        <div className="min-w-0 flex-col">
                          <span className="truncate text-sm font-semibold text-[#0b1c30]">
                            {candidate.studentName}
                          </span>
                          <span className="truncate text-xs text-[#42474f]">{candidate.email}</span>
                          <span className="mt-1 inline-block truncate text-[10px] font-semibold text-[#42474f]">
                            {candidate.skills}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!canEdit || reservedCount >= teamMax || busy}
                        onClick={() => void inviteStudent(candidate)}
                        className="group inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-[#002546] shadow-sm transition-all hover:bg-[#153a75] hover:text-white disabled:opacity-40"
                      >
                        <MaterialSymbol name="add" className="text-[16px]" />
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#002546] px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          <MaterialSymbol name="check" className="text-[20px] text-[#b8d4ff]" />
          {toast}
        </div>
      ) : null}
    </>
  );

  function onSearchChangeSafe(value: string) {
    setSearch(value);
  }
}

function RosterRow({
  member,
  canEdit,
  busy,
  onMakeLead,
  onCancelInvite,
}: {
  member: ProjectTeamMember;
  canEdit: boolean;
  busy: boolean;
  onMakeLead: () => void;
  onCancelInvite: () => void;
}) {
  const pending = member.status === "PENDING";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#eff4ff]/70 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#002546] text-sm font-bold text-white">
          {initials(member.studentName)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-[#0b1c30]">
              {member.studentName}
            </span>
            {member.isCreator ? (
              <span className="rounded-full bg-[#d3e4ff] px-2 py-0.5 text-[10px] font-semibold text-[#001c66]">
                Creator
              </span>
            ) : null}
            {member.isLead ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#b8d4ff]/50 px-2 py-0.5 text-[10px] font-semibold text-[#153a75]">
                <MaterialSymbol name="military_tech" className="text-[12px]" filled />
                Team Lead
              </span>
            ) : null}
            {pending ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Invite pending
              </span>
            ) : (
              <span className="rounded-full bg-[#eff4ff] px-2 py-0.5 text-[10px] font-semibold text-[#153a75]">
                {member.isCreator ? "Ready" : "Joined"}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-[#42474f]">
            {member.studentEmail}
            {member.domain ? ` • ${member.domain}` : ""}
          </p>
        </div>
      </div>
      {canEdit ? (
        <div className="flex shrink-0 flex-col items-end gap-1">
          {!pending && !member.isLead ? (
            <button
              type="button"
              disabled={busy}
              onClick={onMakeLead}
              className="text-[11px] font-semibold text-[#002546] hover:underline disabled:opacity-50"
            >
              Make lead
            </button>
          ) : null}
          {pending ? (
            <button
              type="button"
              disabled={busy}
              onClick={onCancelInvite}
              className="text-[11px] font-semibold text-red-600 hover:underline disabled:opacity-50"
            >
              Cancel
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ReadyView({
  detail,
  team,
  teamMax,
}: {
  detail: Stage2ProjectDetail;
  team: ProjectTeam;
  teamMax: number;
}) {
  const accepted = team.members.filter((m) => m.status === "ACCEPTED");
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#b8d4ff]/40 px-2 py-0.5 text-[11px] font-semibold text-[#153a75]">
            Team ready
          </div>
          <h2 className="text-[32px] font-bold tracking-tight text-[#002546]">{team.name}</h2>
          <p className="mt-1 text-sm text-[#42474f]">
            Your team is locked for {detail.title}. You can start sprinting with {detail.company}.
          </p>
        </div>
        <CapacityDonut count={accepted.length} max={teamMax} />
      </div>

      <div className="mb-6 flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737780]">
          Your team ({accepted.length}/{teamMax})
        </span>
        {accepted.map((member) => (
          <RosterRow
            key={member.id}
            member={member}
            canEdit={false}
            busy={false}
            onMakeLead={() => undefined}
            onCancelInvite={() => undefined}
          />
        ))}
      </div>

      {team.faculty.length > 0 ? (
        <div className="mb-6 rounded-xl bg-[#eff4ff] p-4">
          <h3 className="text-sm font-semibold text-[#002546]">Faculty</h3>
          <ul className="mt-2 space-y-1 text-sm text-[#42474f]">
            {team.faculty.map((item, index) => (
              <li key={`${item.name}-${index}`}>{item.name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link
        href={ROUTES.freeProjects}
        className="inline-flex items-center gap-1 text-sm font-semibold text-[#153a75] hover:underline"
      >
        Browse more unpaid projects
        <MaterialSymbol name="arrow_forward" className="text-[16px]" />
      </Link>
    </div>
  );
}

function StageStepper({ activeStep }: { activeStep: 3 | 4 }) {
  type Step = { label: string; state: "done" | "current" | "upcoming" };
  const steps: Step[] = [
    { label: "Discovery", state: "done" },
    { label: "Apply", state: "done" },
    { label: "Form Team", state: activeStep === 3 ? "current" : "done" },
    { label: "Workspace", state: activeStep === 4 ? "current" : "upcoming" },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2 sm:gap-3">
          {i > 0 ? (
            <div
              className={`h-0.5 w-6 ${
                step.state === "upcoming" ? "bg-[#c3c6d0]/60" : "bg-[#153a75]"
              }`}
            />
          ) : null}
          <div className={`flex items-center gap-1 ${step.state === "upcoming" ? "opacity-60" : ""}`}>
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${
                step.state === "done"
                  ? "bg-[#153a75] text-white"
                  : step.state === "current"
                    ? "bg-[#002546] text-white ring-2 ring-[#d3e4ff]"
                    : "bg-[#dce9ff] text-[#42474f]"
              }`}
            >
              {step.state === "done" ? (
                <MaterialSymbol name="done" className="text-[14px]" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`hidden text-[11px] sm:inline ${
                step.state === "current" ? "font-bold text-[#002546]" : "font-medium text-[#0b1c30]"
              }`}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CapacityDonut({ count, max }: { count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#eff4ff]">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-[#dce9ff]"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="text-[#153a75]"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${pct}, 100`}
          strokeLinecap="round"
          strokeWidth="3.5"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none text-[#002546]">
          {count}/{max}
        </span>
        <span className="text-[9px] font-semibold uppercase text-[#42474f]">Slots</span>
      </div>
    </div>
  );
}
