'use strict';

const StudentAccount = require('@modules/student/student.model');
const IndustryProject = require('@modules/project/project.model');
const ProjectApplication = require('@modules/project/project-application.model');

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

  associationsReady = true;
}

module.exports = {
  setupCoreAssociations,
  StudentAccount,
  IndustryProject,
  ProjectApplication,
};
