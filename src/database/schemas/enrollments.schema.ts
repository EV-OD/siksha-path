import { pgTable, uuid, timestamp, pgEnum, index, numeric, text, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { courses } from './courses.schema';

/**
 * Enrollment Status Enum
 * Tracks the current state of student enrollment
 */
export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'active',     // Student is actively enrolled
  'inactive',   // Enrollment paused (payment issues, etc.)
  'expired',    // Enrollment period has ended
  'cancelled',  // Student or admin cancelled enrollment
  'completed'   // Student completed the course
]);

/**
 * Enrollment Type Enum
 * Differentiates between free and paid enrollments
 */
export const enrollmentTypeEnum = pgEnum('enrollment_type', ['free', 'paid']);

/**
 * Enrollments Table Schema
 * Manages student-course relationships and purchase history
 * 
 * Design principles:
 * - Tracks enrollment lifecycle with status changes
 * - Supports both free and paid enrollments
 * - Maintains purchase and payment information
 * - Enables progress tracking and analytics
 * - Handles subscription-based models
 */
export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    
    // Enrollment details
    type: enrollmentTypeEnum('type').notNull(),
    status: enrollmentStatusEnum('status').notNull().default('active'),
    
    // Payment information (for paid courses)
    amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).default('0.00'),
    currency: varchar('currency', { length: 3 }).default('NPR'),
    paymentId: uuid('payment_id'), // Reference to payment transaction
    
    // Access control
    accessGrantedAt: timestamp('access_granted_at').defaultNow(),
    accessExpiresAt: timestamp('access_expires_at'), // For subscription-based courses
    
    // Progress tracking
    progressPercentage: numeric('progress_percentage', { precision: 5, scale: 2 }).default('0.00'),
    lastAccessedAt: timestamp('last_accessed_at'),
    completedAt: timestamp('completed_at'),
    
    // Enrollment metadata
    enrollmentSource: varchar('enrollment_source', { length: 50 }).default('web'), // web, mobile, admin
    referralCode: varchar('referral_code', { length: 50 }),
    notes: text('notes'), // Admin notes or special conditions
    
    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Unique constraint: one active enrollment per student per course
    studentCourseIdx: index('enrollments_student_course_idx').on(table.studentId, table.courseId),
    studentIdx: index('enrollments_student_idx').on(table.studentId),
    courseIdx: index('enrollments_course_idx').on(table.courseId),
    statusIdx: index('enrollments_status_idx').on(table.status),
    typeIdx: index('enrollments_type_idx').on(table.type),
    accessExpiryIdx: index('enrollments_access_expiry_idx').on(table.accessExpiresAt),
    progressIdx: index('enrollments_progress_idx').on(table.progressPercentage),
  })
);

/**
 * Enrollment Relations
 * Defines relationships with other entities
 */
export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  // Will be added when payment schema is created:
  // payment: one(payments, {
  //   fields: [enrollments.paymentId],
  //   references: [payments.id],
  // }),
}));

/**
 * Type inference for TypeScript
 */
export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
