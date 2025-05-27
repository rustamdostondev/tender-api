export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  SUPER_ADMIN: 'super_admin',
} as const;

export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  LIST: 'list',
  CREATE: 'create',
  UPDATE: 'update',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  ASSIGN: 'assign',
  MODERATE: 'moderate',
  VIEW: 'view',
  ENROLL: 'enroll',
  EXPORT: 'export',
  GRADE: 'grade',
  PUBLISH: 'publish',
  SUBMIT: 'submit',
} as const;

export const RESOURCES = {
  AUTH: 'auth',
  ROLES: 'roles',
  USERS: 'users',
  COURSES: 'courses',
  LESSONS: 'lessons',
  ASSIGNMENTS: 'assignments',
  SUBMISSIONS: 'submissions',
  ANNOUNCEMENTS: 'announcements',
  DISCUSSIONS: 'discussions',
  FILES: 'files',
  ANALYTICS: 'analytics',
  TENDERS: 'tenders',
  PROPOSALS: 'proposals',
} as const;

export const REPOSITORIES = {
  USERS: 'USERS_REPOSITORY',
  REFRESH_TOKENS: 'REFRESH_TOKENS_REPOSITORY',
  USER_SESSIONS: 'USER_SESSIONS_REPOSITORY',
  ROLES_REPOSITORY: 'ROLES_REPOSITORY',
  PERMISSIONS_REPOSITORY: 'PERMISSIONS_REPOSITORY',
  SEMESTERS: 'SEMESTERS_REPOSITORY',
} as const;

export const SERVICES = {
  USERS: 'USERS_SERVICE',
  AUTH: 'AUTH_SERVICE',
  COURSES: 'COURSES_SERVICE',
  LESSONS: 'LESSONS_SERVICE',
} as const;

export const JWT_CONSTANTS = {
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET || 'your-access-token-secret',
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
  ACCESS_TOKEN_EXPIRATION: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '10h',
  REFRESH_TOKEN_EXPIRATION: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
} as const;
