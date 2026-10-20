'use strict';

/**
 * Canonical list of versioned API routes (mounted under /api/v1).
 * Used by GET /api/v1/health for documentation and lightweight probes.
 */
const API_CATALOG = [
  // Student auth
  { method: 'POST', path: '/auth/students/signup', auth: 'public', module: 'student-auth' },
  { method: 'POST', path: '/auth/students/login', auth: 'public', module: 'student-auth' },
  { method: 'POST', path: '/auth/students/verify-email', auth: 'public', module: 'student-auth' },
  { method: 'GET', path: '/auth/students/verify-email', auth: 'public', module: 'student-auth' },
  { method: 'POST', path: '/auth/students/refresh', auth: 'public', module: 'student-auth' },
  { method: 'POST', path: '/auth/students/logout', auth: 'public', module: 'student-auth' },
  { method: 'POST', path: '/auth/students/resend-verification', auth: 'public', module: 'student-auth' },
  { method: 'POST', path: '/auth/students/forgot-password', auth: 'public', module: 'student-auth' },
  { method: 'POST', path: '/auth/students/reset-password', auth: 'public', module: 'student-auth' },
  { method: 'GET', path: '/auth/students/me', auth: 'student', module: 'student-auth' },
  { method: 'POST', path: '/auth/students/request-premium', auth: 'student', module: 'student-auth' },
  { method: 'POST', path: '/auth/students/submit-premium-payment', auth: 'student', module: 'student-auth' },
  // Admin auth
  { method: 'POST', path: '/auth/admin/login', auth: 'public', module: 'admin-auth' },
  { method: 'POST', path: '/auth/admin/logout', auth: 'public', module: 'admin-auth' },
  { method: 'GET', path: '/auth/admin/me', auth: 'admin', module: 'admin-auth' },
  // Admin students
  { method: 'GET', path: '/admin/students', auth: 'admin', module: 'admin-students' },
  { method: 'PATCH', path: '/admin/students/:id', auth: 'admin', module: 'admin-students' },
  { method: 'POST', path: '/admin/students/:id/approve-premium', auth: 'admin', module: 'admin-students' },
  { method: 'POST', path: '/admin/students/:id/undo-premium', auth: 'admin', module: 'admin-students' },
  { method: 'POST', path: '/admin/students/:id/reject-premium', auth: 'admin', module: 'admin-students' },
  // Admin dashboard
  { method: 'GET', path: '/admin/dashboard/summary', auth: 'admin', module: 'admin-dashboard' },
  // Admin projects
  { method: 'GET', path: '/admin/projects/categories', auth: 'admin', module: 'admin-projects' },
  { method: 'POST', path: '/admin/projects/categories', auth: 'admin', module: 'admin-projects' },
  { method: 'PUT', path: '/admin/projects/categories/:id', auth: 'admin', module: 'admin-projects' },
  { method: 'DELETE', path: '/admin/projects/categories/:id', auth: 'admin', module: 'admin-projects' },
  { method: 'POST', path: '/admin/projects/uploads', auth: 'admin', module: 'admin-projects' },
  { method: 'GET', path: '/admin/projects', auth: 'admin', module: 'admin-projects' },
  { method: 'POST', path: '/admin/projects', auth: 'admin', module: 'admin-projects' },
  { method: 'GET', path: '/admin/projects/:id', auth: 'admin', module: 'admin-projects' },
  { method: 'PUT', path: '/admin/projects/:id', auth: 'admin', module: 'admin-projects' },
  { method: 'DELETE', path: '/admin/projects/:id', auth: 'admin', module: 'admin-projects' },
  // Student projects
  { method: 'GET', path: '/projects/categories', auth: 'public', module: 'projects', probe: 'live' },
  { method: 'GET', path: '/projects', auth: 'public', module: 'projects', probe: 'live' },
  { method: 'GET', path: '/projects/:slug', auth: 'public', module: 'projects' },
  { method: 'POST', path: '/projects/:slug/apply', auth: 'student', module: 'projects' },
  // Assessments (student)
  { method: 'GET', path: '/assessments/active', auth: 'public', module: 'assessments', probe: 'live' },
  { method: 'POST', path: '/assessments/:id/submit', auth: 'student', module: 'assessments' },
  // Assessments (admin)
  { method: 'GET', path: '/admin/assessments/questions', auth: 'admin', module: 'admin-assessments' },
  { method: 'POST', path: '/admin/assessments/questions', auth: 'admin', module: 'admin-assessments' },
  { method: 'GET', path: '/admin/assessments/results', auth: 'admin', module: 'admin-assessments' },
  { method: 'GET', path: '/admin/assessments/results/export', auth: 'admin', module: 'admin-assessments' },
  { method: 'POST', path: '/admin/assessments/results/bulk-delete', auth: 'admin', module: 'admin-assessments' },
  { method: 'GET', path: '/admin/assessments/results/:submissionId', auth: 'admin', module: 'admin-assessments' },
  { method: 'DELETE', path: '/admin/assessments/results/:submissionId', auth: 'admin', module: 'admin-assessments' },
  { method: 'PATCH', path: '/admin/assessments/results/:submissionId/answers/:answerId', auth: 'admin', module: 'admin-assessments' },
  { method: 'POST', path: '/admin/assessments/results/:submissionId/full-evaluate', auth: 'admin', module: 'admin-assessments' },
  { method: 'GET', path: '/admin/assessments/bulk/sample', auth: 'admin', module: 'admin-assessments' },
  { method: 'POST', path: '/admin/assessments/bulk/upload', auth: 'admin', module: 'admin-assessments' },
  { method: 'GET', path: '/admin/assessments', auth: 'admin', module: 'admin-assessments' },
  { method: 'POST', path: '/admin/assessments', auth: 'admin', module: 'admin-assessments' },
  { method: 'PUT', path: '/admin/assessments/:id', auth: 'admin', module: 'admin-assessments' },
  { method: 'GET', path: '/admin/assessments/:id', auth: 'admin', module: 'admin-assessments' },
  { method: 'DELETE', path: '/admin/assessments/:id', auth: 'admin', module: 'admin-assessments' },
  // Foundation (student)
  { method: 'GET', path: '/foundation/progress', auth: 'student', module: 'foundation' },
  { method: 'POST', path: '/foundation/missions/:missionId/evidence', auth: 'student', module: 'foundation' },
  { method: 'PUT', path: '/foundation/missions/:missionId/draft', auth: 'student', module: 'foundation' },
  { method: 'POST', path: '/foundation/missions/:missionId/complete', auth: 'student', module: 'foundation' },
  { method: 'GET', path: '/foundation/problem-statements', auth: 'student', module: 'foundation' },
  { method: 'GET', path: '/foundation/journey-content', auth: 'student', module: 'foundation' },
  { method: 'GET', path: '/foundation/stage-framework', auth: 'student', module: 'foundation' },
  { method: 'POST', path: '/foundation/problem-statement', auth: 'student', module: 'foundation' },
  // Foundation (admin)
  { method: 'GET', path: '/admin/foundation/progress', auth: 'admin', module: 'admin-foundation' },
  { method: 'GET', path: '/admin/foundation/progress/:studentId', auth: 'admin', module: 'admin-foundation' },
  { method: 'GET', path: '/admin/foundation/step/problems', auth: 'admin', module: 'admin-foundation' },
  { method: 'POST', path: '/admin/foundation/step/problems', auth: 'admin', module: 'admin-foundation' },
  { method: 'GET', path: '/admin/foundation/step/problems/:problemId', auth: 'admin', module: 'admin-foundation' },
  { method: 'PUT', path: '/admin/foundation/step/problems/:problemId', auth: 'admin', module: 'admin-foundation' },
  { method: 'DELETE', path: '/admin/foundation/step/problems/:problemId', auth: 'admin', module: 'admin-foundation' },
  { method: 'PUT', path: '/admin/foundation/step/problems/:problemId/missions/:missionId', auth: 'admin', module: 'admin-foundation' },
  // Health (this endpoint)
  { method: 'GET', path: '/health', auth: 'public', module: 'health', probe: 'self' },
];

const API_PREFIX = '/api/v1';

function fullPath(relativePath) {
  return `${API_PREFIX}${relativePath}`;
}

module.exports = {
  API_CATALOG,
  API_PREFIX,
  fullPath,
};
