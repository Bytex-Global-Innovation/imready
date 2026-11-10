'use strict';

const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  setupCoreAssociations,
  StudentAccount,
  IndustryProject,
  ProjectTeam,
  ProjectTeamMember,
} = require('@modules/project/project.associations');

setupCoreAssociations();

function badRequest(message, code) {
  const err = new Error(message);
  err.statusCode = 400;
  if (code) err.code = code;
  return err;
}

function notFound(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

function forbidden(message, code) {
  const err = new Error(message);
  err.statusCode = 403;
  if (code) err.code = code;
  return err;
}

function teamSizeBounds(teamSize) {
  const max = Math.max(1, Number(teamSize) || 1);
  const min = max <= 1 ? 1 : Math.min(2, max);
  return { teamSizeMin: min, teamSizeMax: max };
}

function normalizeFaculty(faculty) {
  if (!Array.isArray(faculty)) return [];
  return faculty
    .map((item) => {
      if (typeof item === 'string') {
        const name = item.trim();
        return name ? { name } : null;
      }
      const name = String(item?.name || '').trim();
      if (!name) return null;
      const email = String(item?.email || '').trim();
      return email ? { name, email } : { name };
    })
    .filter(Boolean)
    .slice(0, 2);
}

function serializeMember(row, leadStudentId) {
  const student = row.student;
  const isLead = String(row.studentId) === String(leadStudentId);
  return {
    id: String(row.id),
    uuid: row.uuid,
    studentId: String(row.studentId),
    studentName: student?.fullName || '',
    studentEmail: student?.email || '',
    collegeName: student?.collegeName || '',
    domain: student?.domain || '',
    role: row.role,
    status: row.status,
    isLead,
    isCreator: row.role === 'CREATOR',
    invitedByStudentId:
      row.invitedByStudentId != null ? String(row.invitedByStudentId) : null,
    respondedAt: row.respondedAt
      ? new Date(row.respondedAt).toISOString()
      : null,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
  };
}

function serializeTeam(team, members = []) {
  const bounds = teamSizeBounds(team.project?.teamSize);
  const accepted = members.filter((m) => m.status === 'ACCEPTED');
  const pending = members.filter((m) => m.status === 'PENDING');
  return {
    id: String(team.id),
    uuid: team.uuid,
    projectId: String(team.projectId),
    projectSlug: team.project?.slug || '',
    projectTitle: team.project?.title || '',
    projectCompanyName: team.project?.companyName || '',
    name: team.name || '',
    status: team.status,
    creatorStudentId: String(team.creatorStudentId),
    leadStudentId: String(team.leadStudentId),
    faculty: normalizeFaculty(team.faculty),
    members: members.map((m) => serializeMember(m, team.leadStudentId)),
    acceptedCount: accepted.length,
    pendingCount: pending.length,
    reservedCount: accepted.length + pending.length,
    ...bounds,
    createdAt: team.createdAt ? new Date(team.createdAt).toISOString() : null,
    updatedAt: team.updatedAt ? new Date(team.updatedAt).toISOString() : null,
  };
}

async function loadTeamWithMembers(teamId) {
  const team = await ProjectTeam.findByPk(teamId, {
    include: [
      {
        model: IndustryProject,
        as: 'project',
        attributes: ['id', 'slug', 'title', 'companyName', 'teamSize', 'isFree'],
      },
      {
        model: ProjectTeamMember,
        as: 'members',
        include: [
          {
            model: StudentAccount,
            as: 'student',
            attributes: ['id', 'fullName', 'email', 'collegeName', 'domain'],
          },
        ],
      },
    ],
  });
  if (team?.members) {
    team.members.sort((a, b) => Number(a.id) - Number(b.id));
  }
  return team;
}

async function findProjectBySlug(slug) {
  const project = await IndustryProject.findOne({
    where: { slug, deletedAt: null },
  });
  if (!project) throw notFound('Project not found');
  return project;
}

async function findMembershipForStudent(studentId, projectId) {
  return ProjectTeamMember.findOne({
    where: {
      studentId,
      status: { [Op.in]: ['PENDING', 'ACCEPTED'] },
    },
    include: [
      {
        model: ProjectTeam,
        as: 'team',
        required: true,
        where: { projectId },
      },
    ],
  });
}

async function getTeamForStudent(slug, studentId) {
  const project = await findProjectBySlug(slug);
  const membership = await findMembershipForStudent(studentId, project.id);
  if (!membership) {
    return {
      team: null,
      project: {
        id: String(project.id),
        slug: project.slug,
        title: project.title,
        companyName: project.companyName || '',
        ...teamSizeBounds(project.teamSize),
      },
    };
  }
  const team = await loadTeamWithMembers(membership.teamId);
  return {
    team: serializeTeam(team, team.members || []),
    project: {
      id: String(project.id),
      slug: project.slug,
      title: project.title,
      companyName: project.companyName || '',
      ...teamSizeBounds(project.teamSize),
    },
  };
}

async function ensureCreatorTeam(project, student) {
  const existing = await findMembershipForStudent(student.id, project.id);
  if (existing) {
    const team = await loadTeamWithMembers(existing.teamId);
    if (String(team.creatorStudentId) !== String(student.id)) {
      throw forbidden(
        'You already belong to a team for this project',
        'ALREADY_ON_TEAM',
      );
    }
    return team;
  }

  const team = await ProjectTeam.create({
    uuid: crypto.randomUUID(),
    projectId: project.id,
    creatorStudentId: student.id,
    leadStudentId: student.id,
    name: '',
    faculty: [],
    status: 'FORMING',
  });

  await ProjectTeamMember.create({
    uuid: crypto.randomUUID(),
    teamId: team.id,
    studentId: student.id,
    invitedByStudentId: student.id,
    role: 'CREATOR',
    status: 'ACCEPTED',
    respondedAt: new Date(),
  });

  return loadTeamWithMembers(team.id);
}

async function upsertTeam(slug, student, payload = {}) {
  const project = await findProjectBySlug(slug);
  const team = await ensureCreatorTeam(project, student);

  if (team.status === 'ACTIVE') {
    throw badRequest('Team is already created and locked', 'TEAM_ACTIVE');
  }
  if (String(team.creatorStudentId) !== String(student.id)) {
    throw forbidden('Only the team creator can update the team', 'NOT_CREATOR');
  }

  if (payload.name != null) {
    team.name = String(payload.name).trim().slice(0, 120);
  }

  if (payload.faculty != null) {
    const faculty = normalizeFaculty(payload.faculty);
    if (faculty.length > 2) {
      throw badRequest('You can add at most 2 faculty members', 'FACULTY_LIMIT');
    }
    team.faculty = faculty;
  }

  if (payload.leadStudentId != null) {
    const leadId = Number(payload.leadStudentId);
    const accepted = (team.members || []).find(
      (m) =>
        Number(m.studentId) === leadId && m.status === 'ACCEPTED',
    );
    if (!accepted) {
      throw badRequest(
        'Team lead must be an accepted team member',
        'INVALID_LEAD',
      );
    }
    team.leadStudentId = leadId;
  }

  await team.save();
  const refreshed = await loadTeamWithMembers(team.id);
  return serializeTeam(refreshed, refreshed.members || []);
}

async function inviteMember(slug, student, inviteeStudentId) {
  const project = await findProjectBySlug(slug);
  const team = await ensureCreatorTeam(project, student);

  if (team.status === 'ACTIVE') {
    throw badRequest('Team is already created and locked', 'TEAM_ACTIVE');
  }
  if (String(team.creatorStudentId) !== String(student.id)) {
    throw forbidden('Only the team creator can invite members', 'NOT_CREATOR');
  }

  const inviteeId = Number(inviteeStudentId);
  if (!inviteeId || inviteeId === Number(student.id)) {
    throw badRequest('Choose another student to invite');
  }

  const invitee = await StudentAccount.findByPk(inviteeId);
  if (!invitee || !invitee.isActive || !invitee.emailVerifiedAt) {
    throw notFound('Student not found on the platform');
  }

  const { teamSizeMax } = teamSizeBounds(project.teamSize);
  const activeMembers = (team.members || []).filter(
    (m) => m.status === 'PENDING' || m.status === 'ACCEPTED',
  );
  if (activeMembers.length >= teamSizeMax) {
    throw badRequest(
      `This project allows a maximum of ${teamSizeMax} students on a team`,
      'TEAM_FULL',
    );
  }

  const existingOnProject = await findMembershipForStudent(inviteeId, project.id);
  if (existingOnProject) {
    throw badRequest(
      'That student is already on a team for this project',
      'ALREADY_ON_TEAM',
    );
  }

  const prior = (team.members || []).find(
    (m) => Number(m.studentId) === inviteeId,
  );
  if (prior) {
    if (prior.status === 'REJECTED') {
      prior.status = 'PENDING';
      prior.invitedByStudentId = student.id;
      prior.respondedAt = null;
      await prior.save();
    } else {
      throw badRequest('Invite already sent to this student');
    }
  } else {
    await ProjectTeamMember.create({
      uuid: crypto.randomUUID(),
      teamId: team.id,
      studentId: inviteeId,
      invitedByStudentId: student.id,
      role: 'MEMBER',
      status: 'PENDING',
    });
  }

  const refreshed = await loadTeamWithMembers(team.id);
  return serializeTeam(refreshed, refreshed.members || []);
}

async function cancelInvite(slug, student, memberId) {
  const project = await findProjectBySlug(slug);
  const team = await ensureCreatorTeam(project, student);
  if (String(team.creatorStudentId) !== String(student.id)) {
    throw forbidden('Only the team creator can cancel invites', 'NOT_CREATOR');
  }
  if (team.status === 'ACTIVE') {
    throw badRequest('Team is already created and locked', 'TEAM_ACTIVE');
  }

  const member = (team.members || []).find(
    (m) => String(m.id) === String(memberId),
  );
  if (!member) throw notFound('Invite not found');
  if (member.role === 'CREATOR') {
    throw badRequest('Cannot remove the team creator');
  }
  if (member.status !== 'PENDING') {
    throw badRequest('Only pending invites can be cancelled');
  }

  await member.destroy();

  if (String(team.leadStudentId) === String(member.studentId)) {
    team.leadStudentId = team.creatorStudentId;
    await team.save();
  }

  const refreshed = await loadTeamWithMembers(team.id);
  return serializeTeam(refreshed, refreshed.members || []);
}

async function finalizeTeam(slug, student, payload = {}) {
  const project = await findProjectBySlug(slug);
  let team = await ensureCreatorTeam(project, student);

  if (String(team.creatorStudentId) !== String(student.id)) {
    throw forbidden('Only the team creator can create the team', 'NOT_CREATOR');
  }
  if (team.status === 'ACTIVE') {
    return serializeTeam(team, team.members || []);
  }

  if (payload.name != null || payload.faculty != null || payload.leadStudentId != null) {
    await upsertTeam(slug, student, payload);
    team = await loadTeamWithMembers(team.id);
  }

  const name = String(team.name || '').trim();
  if (!name) {
    throw badRequest('Team name is required', 'TEAM_NAME_REQUIRED');
  }

  const faculty = normalizeFaculty(team.faculty);
  if (faculty.length > 2) {
    throw badRequest('You can add at most 2 faculty members', 'FACULTY_LIMIT');
  }

  const { teamSizeMin, teamSizeMax } = teamSizeBounds(project.teamSize);
  const accepted = (team.members || []).filter((m) => m.status === 'ACCEPTED');
  const pending = (team.members || []).filter((m) => m.status === 'PENDING');

  if (pending.length > 0) {
    throw badRequest(
      'Wait for all invitees to accept or cancel pending invites before creating the team',
      'PENDING_INVITES',
    );
  }
  if (accepted.length < teamSizeMin) {
    throw badRequest(
      `This project requires at least ${teamSizeMin} accepted student${teamSizeMin === 1 ? '' : 's'}`,
      'TEAM_TOO_SMALL',
    );
  }
  if (accepted.length > teamSizeMax) {
    throw badRequest(
      `This project allows at most ${teamSizeMax} students`,
      'TEAM_TOO_LARGE',
    );
  }

  const leadOk = accepted.some(
    (m) => String(m.studentId) === String(team.leadStudentId),
  );
  if (!leadOk) {
    throw badRequest('Choose a team lead from accepted members', 'INVALID_LEAD');
  }

  team.status = 'ACTIVE';
  team.faculty = faculty;
  await team.save();

  const refreshed = await loadTeamWithMembers(team.id);
  return serializeTeam(refreshed, refreshed.members || []);
}

async function searchStudentsForTeam(studentId, query, { limit = 12 } = {}) {
  const q = String(query || '').trim();
  if (q.length < 2) {
    return { students: [] };
  }

  const term = `%${q}%`;
  const rows = await StudentAccount.findAll({
    where: {
      id: { [Op.ne]: studentId },
      isActive: true,
      emailVerifiedAt: { [Op.ne]: null },
      [Op.or]: [
        { fullName: { [Op.like]: term } },
        { email: { [Op.like]: term } },
      ],
    },
    attributes: ['id', 'fullName', 'email', 'collegeName', 'domain', 'streamMajor'],
    order: [['fullName', 'ASC']],
    limit: Math.min(30, Math.max(1, Number(limit) || 12)),
  });

  return {
    students: rows.map((row) => ({
      id: String(row.id),
      studentName: row.fullName,
      email: row.email,
      collegeName: row.collegeName || '',
      domain: row.domain || '',
      streamMajor: row.streamMajor || '',
      skills: [row.domain, row.streamMajor].filter(Boolean).join(' • ') || 'Student',
    })),
  };
}

async function listNotifications(studentId) {
  const rows = await ProjectTeamMember.findAll({
    where: {
      studentId,
      status: 'PENDING',
      role: 'MEMBER',
    },
    include: [
      {
        model: ProjectTeam,
        as: 'team',
        required: true,
        include: [
          {
            model: IndustryProject,
            as: 'project',
            attributes: ['id', 'slug', 'title', 'companyName', 'teamSize'],
          },
          {
            model: StudentAccount,
            as: 'creator',
            attributes: ['id', 'fullName', 'email'],
          },
        ],
      },
      {
        model: StudentAccount,
        as: 'invitedBy',
        attributes: ['id', 'fullName', 'email'],
      },
    ],
    order: [['id', 'DESC']],
  });

  return {
    notifications: rows.map((row) => ({
      id: String(row.id),
      type: 'TEAM_INVITE',
      status: row.status,
      teamId: String(row.teamId),
      teamName: row.team?.name || 'Untitled team',
      projectId: row.team?.project ? String(row.team.project.id) : null,
      projectSlug: row.team?.project?.slug || '',
      projectTitle: row.team?.project?.title || '',
      projectCompanyName: row.team?.project?.companyName || '',
      fromStudentId: row.invitedBy
        ? String(row.invitedBy.id)
        : row.team?.creator
          ? String(row.team.creator.id)
          : null,
      fromStudentName:
        row.invitedBy?.fullName || row.team?.creator?.fullName || 'A teammate',
      fromStudentEmail: row.invitedBy?.email || row.team?.creator?.email || '',
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
      createdAtLabel: row.createdAt
        ? new Date(row.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : '',
    })),
  };
}

async function respondToInvite(studentId, memberId, accept) {
  const member = await ProjectTeamMember.findByPk(memberId, {
    include: [
      {
        model: ProjectTeam,
        as: 'team',
        required: true,
        include: [
          {
            model: IndustryProject,
            as: 'project',
            attributes: ['id', 'slug', 'title', 'teamSize'],
          },
        ],
      },
    ],
  });

  if (!member || String(member.studentId) !== String(studentId)) {
    throw notFound('Invite not found');
  }
  if (member.status !== 'PENDING') {
    throw badRequest('This invite has already been responded to');
  }
  if (member.team.status === 'ACTIVE') {
    throw badRequest('This team is already locked');
  }

  if (accept) {
    const { teamSizeMax } = teamSizeBounds(member.team.project?.teamSize);
    const acceptedCount = await ProjectTeamMember.count({
      where: { teamId: member.teamId, status: 'ACCEPTED' },
    });
    if (acceptedCount >= teamSizeMax) {
      throw badRequest('This team is already full', 'TEAM_FULL');
    }
    member.status = 'ACCEPTED';
  } else {
    member.status = 'REJECTED';
  }
  member.respondedAt = new Date();
  await member.save();

  return {
    id: String(member.id),
    status: member.status,
    teamId: String(member.teamId),
    projectSlug: member.team.project?.slug || '',
  };
}

module.exports = {
  getTeamForStudent,
  upsertTeam,
  inviteMember,
  cancelInvite,
  finalizeTeam,
  searchStudentsForTeam,
  listNotifications,
  respondToInvite,
};
