import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  index,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { courses } from './courses.schema';

/**
 * Live Class Status Enum
 * Tracks the lifecycle of scheduled live classes
 */
export const liveClassStatusEnum = pgEnum('live_class_status', [
  'scheduled', // Class is scheduled but not started
  'ongoing', // Class is currently in progress
  'completed', // Class has finished normally
  'cancelled', // Class was cancelled by teacher/admin
  'missed', // Class time passed without starting
]);

/**
 * Live Class Type Enum
 * Different types of live sessions
 */
export const liveClassTypeEnum = pgEnum('live_class_type', [
  'lecture', // Regular teaching session
  'discussion', // Interactive Q&A session
  'workshop', // Hands-on practical session
  'exam', // Assessment session
  'review', // Revision session
]);

/**
 * Live Classes Table Schema
 * Manages Zoom-integrated live class scheduling and tracking
 *
 * Design principles:
 * - Integration with Zoom API for meeting management
 * - Flexible scheduling with timezone support
 * - Attendance tracking capabilities
 * - Recording management and storage
 * - Notification and reminder system
 */
export const liveClasses = pgTable(
  'live_classes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    teacherId: uuid('teacher_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Class details
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    type: liveClassTypeEnum('type').notNull().default('lecture'),
    status: liveClassStatusEnum('status').notNull().default('scheduled'),

    // Scheduling information
    scheduledStartTime: timestamp('scheduled_start_time').notNull(),
    scheduledEndTime: timestamp('scheduled_end_time').notNull(),
    actualStartTime: timestamp('actual_start_time'),
    actualEndTime: timestamp('actual_end_time'),
    duration: integer('duration'), // Planned duration in minutes
    timezone: varchar('timezone', { length: 50 })
      .notNull()
      .default('Asia/Kathmandu'),

    // Zoom integration
    zoomMeetingId: varchar('zoom_meeting_id', { length: 50 }),
    zoomJoinUrl: text('zoom_join_url'),
    zoomStartUrl: text('zoom_start_url'),
    zoomPassword: varchar('zoom_password', { length: 50 }),
    zoomMeetingUuid: varchar('zoom_meeting_uuid', { length: 100 }),

    // Recording information
    recordingEnabled: varchar('recording_enabled', { length: 10 })
      .notNull()
      .default('true'),
    recordingUrl: text('recording_url'),
    recordingPassword: varchar('recording_password', { length: 50 }),
    recordingSize: integer('recording_size'), // Size in bytes

    // Attendance tracking
    maxAttendees: integer('max_attendees').default(100),
    attendeeCount: integer('attendee_count').default(0),

    // Notifications
    reminderSent: varchar('reminder_sent', { length: 10 })
      .notNull()
      .default('false'),
    reminderSentAt: timestamp('reminder_sent_at'),

    // Additional metadata
    agenda: text('agenda'), // Class agenda/topics to cover
    prerequisites: text('prerequisites'), // What students should prepare
    materials: text('materials'), // JSON array of required materials

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Indexes for performance and querying
    courseIdx: index('live_classes_course_idx').on(table.courseId),
    teacherIdx: index('live_classes_teacher_idx').on(table.teacherId),
    statusIdx: index('live_classes_status_idx').on(table.status),
    scheduledTimeIdx: index('live_classes_scheduled_time_idx').on(
      table.scheduledStartTime,
    ),
    zoomMeetingIdx: index('live_classes_zoom_meeting_idx').on(
      table.zoomMeetingId,
    ),
  }),
);

/**
 * Live Class Attendance Table Schema
 * Tracks individual student attendance for each live class
 */
export const liveClassAttendance = pgTable(
  'live_class_attendance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    liveClassId: uuid('live_class_id')
      .notNull()
      .references(() => liveClasses.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Attendance details
    joinedAt: timestamp('joined_at'),
    leftAt: timestamp('left_at'),
    duration: integer('duration'), // Duration attended in minutes
    attendanceStatus: varchar('attendance_status', { length: 20 })
      .notNull()
      .default('absent'), // present, absent, late

    // Zoom participant data
    zoomParticipantId: varchar('zoom_participant_id', { length: 100 }),
    zoomUserName: varchar('zoom_user_name', { length: 255 }),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Unique constraint: one attendance record per student per class
    liveClassStudentIdx: index('live_class_attendance_class_student_idx').on(
      table.liveClassId,
      table.studentId,
    ),
    liveClassIdx: index('live_class_attendance_class_idx').on(
      table.liveClassId,
    ),
    studentIdx: index('live_class_attendance_student_idx').on(table.studentId),
  }),
);

/**
 * Live Classes Relations
 */
export const liveClassesRelations = relations(liveClasses, ({ one, many }) => ({
  course: one(courses, {
    fields: [liveClasses.courseId],
    references: [courses.id],
  }),
  teacher: one(users, {
    fields: [liveClasses.teacherId],
    references: [users.id],
  }),
  attendance: many(liveClassAttendance),
}));

/**
 * Live Class Attendance Relations
 */
export const liveClassAttendanceRelations = relations(
  liveClassAttendance,
  ({ one }) => ({
    liveClass: one(liveClasses, {
      fields: [liveClassAttendance.liveClassId],
      references: [liveClasses.id],
    }),
    student: one(users, {
      fields: [liveClassAttendance.studentId],
      references: [users.id],
    }),
  }),
);

/**
 * Type inference for TypeScript
 */
export type LiveClass = typeof liveClasses.$inferSelect;
export type NewLiveClass = typeof liveClasses.$inferInsert;
export type LiveClassAttendance = typeof liveClassAttendance.$inferSelect;
export type NewLiveClassAttendance = typeof liveClassAttendance.$inferInsert;
