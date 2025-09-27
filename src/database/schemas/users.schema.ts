import { pgTable, uuid, varchar, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * User Role Enum
 * Defines the three main user types in the system
 */
export const userRoleEnum = pgEnum('user_role', ['student', 'teacher', 'admin']);

/**
 * Users Table Schema
 * Central table for all user types (Student/Teacher/Admin)
 * 
 * Design principles:
 * - Single table for all user types with role-based differentiation
 * - UUID primary keys for better security and scalability
 * - Proper indexing on frequently queried fields
 * - Timestamps for audit trail
 * - Profile fields for user customization
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull().default('student'),
    
    // Profile fields
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    bio: text('bio'),
    profilePicture: text('profile_picture'),
    
    // Contact information
    phone: varchar('phone', { length: 20 }),
    address: text('address'),
    
    // Account status
    isActive: varchar('is_active', { length: 10 }).notNull().default('true'),
    isVerified: varchar('is_verified', { length: 10 }).notNull().default('false'),
    
    // Teacher-specific fields (nullable for students/admins)
    teacherVerified: varchar('teacher_verified', { length: 10 }).default('false'),
    specialization: varchar('specialization', { length: 255 }),
    experience: text('experience'),
    
    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Indexes for performance optimization
    emailIdx: index('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
    activeIdx: index('users_active_idx').on(table.isActive),
  })
);

/**
 * User Relations
 * Defines relationships with other entities
 * Relations will be properly configured when used with the complete schema
 */
export const usersRelations = relations(users, ({ many }) => ({
  // Relations will be defined when importing all schemas together
  // This prevents circular dependency issues during development
}));

/**
 * Type inference for TypeScript
 * Provides type safety when working with user data
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
