'use strict';

const StudentAccount = require('@modules/student/student.model');
const IndustryProject = require('@modules/project/project.model');
const ProjectApplication = require('@modules/project/project-application.model');
const ProjectTeam = require('@modules/project/project-team.model');
const ProjectTeamMember = require('@modules/project/project-team-member.model');

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

  associationsReady = true;
}

module.exports = {
  setupCoreAssociations,
  StudentAccount,
  IndustryProject,
  ProjectApplication,
  ProjectTeam,
  ProjectTeamMember,
};
