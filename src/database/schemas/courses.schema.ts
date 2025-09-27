import { pgTable, uuid, varchar, text, numeric, timestamp, pgEnum, index, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

/**
 * Course Status Enum
 * Tracks the lifecycle of a course
 */
export const courseStatusEnum = pgEnum('course_status', ['draft', 'published', 'archived']);

/**
 * Course Difficulty Enum  
 * Helps students choose appropriate courses
 */
export const courseDifficultyEnum = pgEnum('course_difficulty', ['beginner', 'intermediate', 'advanced']);

/**
 * Course Category Enum
 * Organizes courses by subject matter
 * Based on common Nepal education categories
 */
export const courseCategoryEnum = pgEnum('course_category', [
  'mathematics', 
  'science', 
  'english', 
  'nepali',
  'social_studies',
  'computer_science',
  'engineering',
  'medical',
  'business',
  'arts',
  'language',
  'other'
]);

/**
 * Course Language Enum
 * Supports multilingual content delivery
 */
export const courseLanguageEnum = pgEnum('course_language', ['nepali', 'english', 'hindi', 'mixed']);

/**
 * Courses Table Schema
 * Central table for all course information
 * 
 * Design principles:
 * - Comprehensive metadata for course discovery
 * - Pricing support for both free and paid courses
 * - Teacher ownership and management
 * - SEO-friendly slug generation
 * - Rich content descriptions
 */
export const courses = pgTable(
  'courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    
    // Basic course information
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description').notNull(),
    shortDescription: varchar('short_description', { length: 500 }),
    
    // Course metadata
    category: courseCategoryEnum('category').notNull(),
    language: courseLanguageEnum('language').notNull().default('nepali'),
    difficulty: courseDifficultyEnum('difficulty').notNull().default('beginner'),
    status: courseStatusEnum('status').notNull().default('draft'),
    
    // Pricing information
    price: numeric('price', { precision: 10, scale: 2 }).notNull().default('0.00'),
    originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
    currency: varchar('currency', { length: 3 }).notNull().default('NPR'),
    
    // Course structure
    totalDuration: integer('total_duration'), // in minutes
    totalLessons: integer('total_lessons').default(0),
    totalResources: integer('total_resources').default(0),
    
    // Marketing and SEO
    thumbnailUrl: text('thumbnail_url'),
    videoPreviewUrl: text('video_preview_url'),
    tags: text('tags'), // JSON array stored as text
    
    // Course requirements and outcomes
    prerequisites: text('prerequisites'),
    learningOutcomes: text('learning_outcomes'), // JSON array stored as text
    targetAudience: text('target_audience'),
    
    // Statistics (updated via triggers/jobs)
    enrollmentCount: integer('enrollment_count').default(0),
    rating: numeric('rating', { precision: 3, scale: 2 }).default('0.00'),
    totalRatings: integer('total_ratings').default(0),
    
    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at'),
  },
  (table) => ({
    // Indexes for performance and search
    teacherIdx: index('courses_teacher_idx').on(table.teacherId),
    categoryIdx: index('courses_category_idx').on(table.category),
    statusIdx: index('courses_status_idx').on(table.status),
    priceIdx: index('courses_price_idx').on(table.price),
    slugIdx: index('courses_slug_idx').on(table.slug),
    enrollmentIdx: index('courses_enrollment_idx').on(table.enrollmentCount),
    ratingIdx: index('courses_rating_idx').on(table.rating),
  })
);

/**
 * Course Relations
 * Defines relationships with other entities
 */
export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(users, {
    fields: [courses.teacherId],
    references: [users.id],
  }),
  // Will be added as we create other schemas:
  // enrollments: many(enrollments),
  // liveClasses: many(liveClasses),
  // resources: many(resources),
  // chatMessages: many(chatMessages),
}));

/**
 * Type inference for TypeScript
 */
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
