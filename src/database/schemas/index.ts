/**
 * Database Schema Index
 * Centralizes all database schemas and their relationships
 *
 * This file exports all schemas and provides a complete picture
 * of the database structure for Drizzle ORM
 */

// Import all schemas
export * from './users.schema';
export * from './courses.schema';
export * from './enrollments.schema';
export * from './live-classes.schema';
export * from './resources.schema';
export * from './chat.schema';
export * from './payments.schema';

// Re-export schema objects for Drizzle operations
export { users, usersRelations, userRoleEnum } from './users.schema';

export {
  courses,
  coursesRelations,
  courseStatusEnum,
  courseDifficultyEnum,
  courseCategoryEnum,
  courseLanguageEnum,
} from './courses.schema';

export {
  enrollments,
  enrollmentsRelations,
  enrollmentStatusEnum,
  enrollmentTypeEnum,
} from './enrollments.schema';

export {
  liveClasses,
  liveClassAttendance,
  liveClassesRelations,
  liveClassAttendanceRelations,
  liveClassStatusEnum,
  liveClassTypeEnum,
} from './live-classes.schema';

export {
  resources,
  resourceDownloads,
  resourceViews,
  resourcesRelations,
  resourceDownloadsRelations,
  resourceViewsRelations,
  resourceTypeEnum,
  resourceAccessEnum,
} from './resources.schema';

export {
  chatMessages,
  chatMessageReads,
  chatRoomMembers,
  chatMessagesRelations,
  chatMessageReadsRelations,
  chatRoomMembersRelations,
  messageTypeEnum,
  messageStatusEnum,
} from './chat.schema';

export {
  payments,
  paymentLogs,
  teacherEarnings,
  paymentsRelations,
  paymentLogsRelations,
  teacherEarningsRelations,
  paymentGatewayEnum,
  paymentStatusEnum,
  paymentMethodEnum,
  currencyEnum,
} from './payments.schema';
