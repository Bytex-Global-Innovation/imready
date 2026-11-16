'use strict';

const StudentAccount = require('@modules/student/student.model');
const IndustryProject = require('@modules/project/project.model');
const ProjectApplication = require('@modules/project/project-application.model');
const ProjectTeam = require('@modules/project/project-team.model');
const ProjectTeamMember = require('@modules/project/project-team-member.model');
const ProjectStageProgress = require('@modules/project/project-stage-progress.model');
const ProjectSubmission = require('@modules/project/project-submission.model');
const ProjectOwnerFeedback = require('@modules/project/project-owner-feedback.model');

let associationsReady = false;

function setupCoreAssociations() {
  if (associationsReady) return;

  IndustryProject.hasMany(ProjectApplication, {
    as: 'applications',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  ProjectApplication.belongsTo(IndustryProject, {
    as: 'project',
    foreignKey: 'projectId',
  });

  StudentAccount.hasMany(ProjectApplication, {
    as: 'applications',
    foreignKey: 'studentId',
    onDelete: 'SET NULL',
  });
  ProjectApplication.belongsTo(StudentAccount, {
    as: 'student',
    foreignKey: 'studentId',
  });

  IndustryProject.hasMany(ProjectTeam, {
    as: 'teams',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  ProjectTeam.belongsTo(IndustryProject, {
    as: 'project',
    foreignKey: 'projectId',
  });

  StudentAccount.hasMany(ProjectTeam, {
    as: 'createdTeams',
    foreignKey: 'creatorStudentId',
    onDelete: 'CASCADE',
  });
  ProjectTeam.belongsTo(StudentAccount, {
    as: 'creator',
    foreignKey: 'creatorStudentId',
  });
  ProjectTeam.belongsTo(StudentAccount, {
    as: 'lead',
    foreignKey: 'leadStudentId',
  });

  ProjectTeam.hasMany(ProjectTeamMember, {
    as: 'members',
    foreignKey: 'teamId',
    onDelete: 'CASCADE',
  });
  ProjectTeamMember.belongsTo(ProjectTeam, {
    as: 'team',
    foreignKey: 'teamId',
  });

  StudentAccount.hasMany(ProjectTeamMember, {
    as: 'teamMemberships',
    foreignKey: 'studentId',
    onDelete: 'CASCADE',
  });
  ProjectTeamMember.belongsTo(StudentAccount, {
    as: 'student',
    foreignKey: 'studentId',
  });
  ProjectTeamMember.belongsTo(StudentAccount, {
    as: 'invitedBy',
    foreignKey: 'invitedByStudentId',
  });

  ProjectTeam.hasOne(ProjectStageProgress, {
    as: 'stageProgress',
    foreignKey: 'teamId',
    onDelete: 'CASCADE',
  });
  ProjectStageProgress.belongsTo(ProjectTeam, {
    as: 'team',
    foreignKey: 'teamId',
  });
  IndustryProject.hasMany(ProjectStageProgress, {
    as: 'stageProgressRows',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  ProjectStageProgress.belongsTo(IndustryProject, {
    as: 'project',
    foreignKey: 'projectId',
  });

  ProjectTeam.hasOne(ProjectSubmission, {
    as: 'submission',
    foreignKey: 'teamId',
    onDelete: 'CASCADE',
  });
  ProjectSubmission.belongsTo(ProjectTeam, {
    as: 'team',
    foreignKey: 'teamId',
  });
  IndustryProject.hasMany(ProjectSubmission, {
    as: 'submissions',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  ProjectSubmission.belongsTo(IndustryProject, {
    as: 'project',
    foreignKey: 'projectId',
  });
  ProjectSubmission.belongsTo(StudentAccount, {
    as: 'submittedBy',
    foreignKey: 'submittedByStudentId',
  });

  ProjectTeam.hasOne(ProjectOwnerFeedback, {
    as: 'ownerFeedback',
    foreignKey: 'teamId',
    onDelete: 'CASCADE',
  });
  ProjectOwnerFeedback.belongsTo(ProjectTeam, {
    as: 'team',
    foreignKey: 'teamId',
  });
  IndustryProject.hasMany(ProjectOwnerFeedback, {
    as: 'ownerFeedbackRows',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  ProjectOwnerFeedback.belongsTo(IndustryProject, {
    as: 'project',
    foreignKey: 'projectId',
  });
  ProjectOwnerFeedback.belongsTo(ProjectSubmission, {
    as: 'submission',
    foreignKey: 'submissionId',
  });

  associationsReady = true;
}

module.exports = {
  setupCoreAssociations,
  StudentAccount,
  IndustryProject,
  ProjectApplication,
  ProjectTeam,
  ProjectTeamMember,
  ProjectStageProgress,
  ProjectSubmission,
  ProjectOwnerFeedback,
};
