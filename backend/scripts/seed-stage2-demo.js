'use strict';

/**
 * Seed Stage 2 demo data for local/QA testing.
 *
 * Creates:
 * - unpaid demo projects (teamSize 1 and 3)
 * - two verified, foundation-PASSED students
 * - optional application for the primary student on the solo project
 *
 * Usage (from backend/):
 *   node scripts/seed-stage2-demo.js
 */
const path = require('path');
// Match `npm run dev` / server.js: prefer backend/.env (local MySQL).
// Root .env is Docker-oriented (DB_USER=imready) and must not override local credentials.
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('module-alias/register');

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sequelize = require('@connections/sequelize');
const StudentAccount = require('@modules/student/student.model');
const IndustryProject = require('@modules/project/project.model');
const ProjectApplication = require('@modules/project/project-application.model');
const ProjectCategory = require('@modules/project/project-category.model');
const ProjectTeam = require('@modules/project/project-team.model');
const ProjectTeamMember = require('@modules/project/project-team-member.model');
const ProjectStageProgress = require('@modules/project/project-stage-progress.model');
const ProjectSubmission = require('@modules/project/project-submission.model');
const {
  setupCoreAssociations,
} = require('@modules/project/project.associations');

setupCoreAssociations();

const DEMO_PASSWORD = 'DemoPass123!';

const STUDENTS = [
  {
    email: 'demo.lead@imready.test',
    fullName: 'Demo Lead Student',
    collegeName: 'ImReady Demo College',
    streamMajor: 'Computer Science',
    domain: 'Product',
  },
  {
    email: 'demo.member@imready.test',
    fullName: 'Demo Team Member',
    collegeName: 'ImReady Demo College',
    streamMajor: 'Design',
    domain: 'Design',
  },
];

const PROJECTS = [
  {
    slug: 'demo-solo-sprint',
    title: 'Demo Solo Sprint',
    category: 'product',
    badge: 'Demo',
    teamSize: 1,
    description:
      'A solo unpaid demo challenge used to verify apply + create-team with a one-student roster.',
  },
  {
    slug: 'demo-campus-optimizer',
    title: 'Demo Campus Waste Optimizer',
    category: 'product',
    badge: 'Demo',
    teamSize: 3,
    description:
      'A multi-student unpaid demo challenge used to verify invites and team size limits.',
  },
  {
    slug: 'abc-onboarding',
    title: 'Improve Student Onboarding',
    category: 'product',
    badge: 'Featured',
    teamSize: 3,
    companyName: 'ABC Technologies',
    description:
      'Reduce early friction and dropout during initial student product orientation.',
  },
];

async function ensureCategory() {
  const [row] = await ProjectCategory.findOrCreate({
    where: { slug: 'product' },
    defaults: {
      uuid: crypto.randomUUID(),
      name: 'Product',
      slug: 'product',
      description: 'Product challenges',
      isActive: true,
    },
  });
  return row;
}

async function ensureStudent(spec) {
  const existing = await StudentAccount.findOne({ where: { email: spec.email } });
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const now = new Date();
  if (existing) {
    existing.fullName = spec.fullName;
    existing.passwordHash = passwordHash;
    existing.emailVerifiedAt = existing.emailVerifiedAt || now;
    existing.isActive = true;
    existing.foundationCompletedAt = existing.foundationCompletedAt || now;
    existing.foundationVerificationStatus = 'PASSED';
    existing.foundationVerificationRequestedAt =
      existing.foundationVerificationRequestedAt || now;
    existing.foundationVerificationReviewedAt =
      existing.foundationVerificationReviewedAt || now;
    existing.collegeName = spec.collegeName;
    existing.streamMajor = spec.streamMajor;
    existing.domain = spec.domain;
    await existing.save();
    return existing;
  }

  return StudentAccount.create({
    uuid: crypto.randomUUID(),
    fullName: spec.fullName,
    email: spec.email,
    countryCode: '+91',
    phone: '9999999999',
    passwordHash,
    collegeName: spec.collegeName,
    streamMajor: spec.streamMajor,
    graduationYear: '2027',
    domain: spec.domain,
    level: 'Intermediate',
    isActive: true,
    emailVerifiedAt: now,
    foundationCompletedAt: now,
    foundationVerificationStatus: 'PASSED',
    foundationVerificationRequestedAt: now,
    foundationVerificationReviewedAt: now,
    subscriptionStatus: 'FREE',
  });
}

async function ensureProject(spec) {
  const existing = await IndustryProject.findOne({ where: { slug: spec.slug } });
  const today = new Date();
  const opens = today.toISOString().slice(0, 10);
  const closesDate = new Date(today);
  closesDate.setDate(closesDate.getDate() + 30);
  const closes = closesDate.toISOString().slice(0, 10);

  const payload = {
    title: spec.title,
    category: spec.category,
    badge: spec.badge,
    isFree: true,
    description: spec.description,
    imageSrc:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    imageAlt: spec.title,
    requirements: ['Research', 'Collaboration'],
    techStack: ['Figma', 'Notion'],
    estimatedTime: 'Up to 30 days',
    teamSize: spec.teamSize,
    level: 'Intermediate Level',
    overview: spec.description,
    briefRequirements: [
      'Map the current experience',
      'Propose an improvement',
      'Validate with peers',
    ],
    deliverables: [{ label: 'Problem brief' }, { label: 'Prototype concept' }],
    evaluationCriteria: [
      { label: 'Insight quality', percent: 40 },
      { label: 'Execution', percent: 40 },
      { label: 'Collaboration', percent: 20 },
    ],
    resources: [],
    companyName: spec.companyName || 'ImReady Demo Partners',
    whatYouGain: ['Verified proof of work', 'Mentor feedback'],
    cohortStarts: 'Rolling demo cohort',
    mentorshipLabel: 'Verified Industry Partner',
    teamFormationNote: 'Apply, then form your team within the allowed size.',
    applyOpensAt: opens,
    applyClosesAt: closes,
    applyWindowDays: 30,
    status: 'ACTIVE',
  };

  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }

  return IndustryProject.create({
    uuid: crypto.randomUUID(),
    slug: spec.slug,
    ...payload,
  });
}

async function ensureApplication(project, student) {
  const email = student.email.toLowerCase();
  const existing = await ProjectApplication.findOne({
    where: { projectId: project.id, studentEmail: email },
  });
  if (existing) return existing;
  return ProjectApplication.create({
    uuid: crypto.randomUUID(),
    studentId: student.id,
    projectId: project.id,
    studentName: student.fullName,
    studentEmail: email,
    motivation:
      'I want to verify the Stage 2 apply and team-creation flow with demo data.',
    contributions: ['Research', 'Product'],
    status: 'PENDING',
  });
}

async function ensureActiveTeamWithSubmission(project, lead, member) {
  let team = await ProjectTeam.findOne({
    where: { projectId: project.id, creatorStudentId: lead.id },
  });
  if (!team) {
    team = await ProjectTeam.create({
      uuid: crypto.randomUUID(),
      projectId: project.id,
      creatorStudentId: lead.id,
      leadStudentId: lead.id,
      name: `${project.title} Demo Team`,
      faculty: [{ name: 'Campus Mentor', email: 'mentor@imready.test' }],
      status: 'ACTIVE',
    });
  } else {
    team.name = `${project.title} Demo Team`;
    team.status = 'ACTIVE';
    team.leadStudentId = lead.id;
    await team.save();
  }

  const members = [
    {
      student: lead,
      role: 'CREATOR',
      status: 'ACCEPTED',
    },
    {
      student: member,
      role: 'MEMBER',
      status: 'ACCEPTED',
    },
  ];

  for (const spec of members) {
    const existing = await ProjectTeamMember.findOne({
      where: { teamId: team.id, studentId: spec.student.id },
    });
    if (existing) {
      existing.role = spec.role;
      existing.status = spec.status;
      existing.respondedAt = existing.respondedAt || new Date();
      await existing.save();
    } else {
      await ProjectTeamMember.create({
        uuid: crypto.randomUUID(),
        teamId: team.id,
        studentId: spec.student.id,
        invitedByStudentId: lead.id,
        role: spec.role,
        status: spec.status,
        respondedAt: new Date(),
      });
    }
  }

  let progress = await ProjectStageProgress.findOne({ where: { teamId: team.id } });
  if (!progress) {
    progress = await ProjectStageProgress.create({
      uuid: crypto.randomUUID(),
      teamId: team.id,
      projectId: project.id,
      currentStage: 'REVIEW',
      checkpoints: {
        ready: { reality: true, engage: true, analyze: true },
        doProof: { build: true, test: true, proof: true },
      },
      updatedByStudentId: lead.id,
    });
  } else {
    progress.currentStage = 'REVIEW';
    await progress.save();
  }

  let submission = await ProjectSubmission.findOne({ where: { teamId: team.id } });
  const now = new Date();
  if (!submission) {
    submission = await ProjectSubmission.create({
      uuid: crypto.randomUUID(),
      teamId: team.id,
      projectId: project.id,
      submittedByStudentId: lead.id,
      submissionCode: `IMR-STG2-${String(team.id).padStart(4, '0')}-${now.getFullYear()}`,
      summary:
        'Iteration 2 demo submitted with research evidence, prototype, and onboarding completion lift.',
      demoVideoUrl: 'https://example.com/demo-onboarding',
      payload: { iteration: 2, evidenceCount: 6 },
      status: 'SUBMITTED',
      submittedAt: now,
    });
  } else {
    submission.status = 'SUBMITTED';
    submission.submittedAt = submission.submittedAt || now;
    submission.summary =
      submission.summary ||
      'Iteration 2 demo submitted with research evidence, prototype, and onboarding completion lift.';
    await submission.save();
  }

  return { team, progress, submission };
}

async function main() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || '(missing)';
  const dbName = String(process.env.DB_NAME || '').trim() || '(missing)';
  console.log(`Connecting to MySQL as ${dbUser}@${dbHost}/${dbName} …`);

  try {
    await sequelize.authenticate();
  } catch (err) {
    err.message = `${err.message}\n\nHint: seed uses backend/.env (same as npm run dev). ` +
      `If you use Docker only, start the stack or set DB_* in backend/.env to match MySQL.`;
    throw err;
  }
  await ensureCategory();

  const students = [];
  for (const spec of STUDENTS) {
    students.push(await ensureStudent(spec));
  }

  const projects = [];
  for (const spec of PROJECTS) {
    projects.push(await ensureProject(spec));
  }

  // Lead already applied so team pages are reachable immediately.
  await ensureApplication(projects[0], students[0]);
  await ensureApplication(projects[1], students[0]);
  await ensureApplication(projects[2], students[0]);
  await ensureApplication(projects[2], students[1]);

  const abcBundle = await ensureActiveTeamWithSubmission(
    projects[2],
    students[0],
    students[1],
  );

  console.log('\nStage 2 demo seed complete.\n');
  console.log('Students (password for both):', DEMO_PASSWORD);
  for (const s of students) {
    console.log(`- ${s.fullName} <${s.email}> foundation=PASSED`);
  }
  console.log('\nProjects:');
  for (const p of projects) {
    console.log(`- ${p.title} (/stage-2/projects/${p.slug}) teamSize=${p.teamSize}`);
  }
  console.log('\nABC onboarding ACTIVE team ready for admin owner feedback:');
  console.log(`- teamId=${abcBundle.team.id} submission=${abcBundle.submission.status}`);
  console.log(
    `\nQuick test:\n1. Login student: ${students[0].email} / ${DEMO_PASSWORD}\n2. Open /stage-2/projects/abc-onboarding/review (and later /owner-feedback)\n3. Admin → Stage 2 Reviews → open team #${abcBundle.team.id} → Submit Feedback\n4. Student refreshes /owner-feedback + /outcome\n`,
  );
}

main()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Seed failed:', err);
    try {
      await sequelize.close();
    } catch {
      // ignore
    }
    process.exit(1);
  });
