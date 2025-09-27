import { pgTable, uuid, varchar, text, timestamp, pgEnum, index, integer, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { courses } from './courses.schema';

/**
 * Resource Type Enum
 * Supports various file types for course materials
 */
export const resourceTypeEnum = pgEnum('resource_type', [
  'pdf',        // PDF documents
  'pptx',       // PowerPoint presentations  
  'docx',       // Word documents
  'image',      // Images (jpg, png, gif, etc.)
  'video',      // Video files
  'audio',      // Audio files
  'text',       // Plain text content
  'link',       // External links/URLs
  'other'       // Other file types
]);

/**
 * Resource Access Level Enum
 * Controls who can access the resource
 */
export const resourceAccessEnum = pgEnum('resource_access', [
  'public',     // Anyone can access (for free courses)
  'enrolled',   // Only enrolled students can access
  'premium',    // Only premium/paid students can access
  'teacher'     // Only teacher and admins can access
]);

/**
 * Resources Table Schema
 * Manages course materials and files with S3 storage integration
 * 
 * Design principles:
 * - Flexible file type support with metadata
 * - S3-compatible storage integration
 * - Access control and permissions
 * - Organization with folders/categories
 * - Download tracking and analytics
 * - Version control for updated materials
 */
export const resources = pgTable(
  'resources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    uploadedBy: uuid('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    
    // Resource metadata
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    type: resourceTypeEnum('type').notNull(),
    accessLevel: resourceAccessEnum('access_level').notNull().default('enrolled'),
    
    // File information
    fileName: varchar('file_name', { length: 255 }).notNull(),
    originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
    fileSize: integer('file_size'), // Size in bytes
    mimeType: varchar('mime_type', { length: 100 }),
    fileExtension: varchar('file_extension', { length: 10 }),
    
    // Storage information
    storageUrl: text('storage_url').notNull(), // S3 URL
    storagePath: text('storage_path').notNull(), // S3 key/path
    bucketName: varchar('bucket_name', { length: 100 }),
    
    // Organization
    folder: varchar('folder', { length: 255 }).default('general'), // Organize resources in folders
    sortOrder: integer('sort_order').default(0), // For custom ordering
    tags: text('tags'), // JSON array of tags for searchability
    
    // Content metadata
    thumbnailUrl: text('thumbnail_url'), // For images/videos
    duration: integer('duration'), // For video/audio files in seconds
    pageCount: integer('page_count'), // For PDF documents
    
    // Access control
    isActive: varchar('is_active', { length: 10 }).notNull().default('true'),
    downloadEnabled: varchar('download_enabled', { length: 10 }).notNull().default('true'),
    viewOnlineEnabled: varchar('view_online_enabled', { length: 10 }).notNull().default('true'),
    
    // Analytics
    downloadCount: integer('download_count').default(0),
    viewCount: integer('view_count').default(0),
    
    // Version control
    version: varchar('version', { length: 20 }).default('1.0'),
    parentResourceId: uuid('parent_resource_id'), // For versioning
    
    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Indexes for performance and querying
    courseIdx: index('resources_course_idx').on(table.courseId),
    uploaderIdx: index('resources_uploader_idx').on(table.uploadedBy),
    typeIdx: index('resources_type_idx').on(table.type),
    accessIdx: index('resources_access_idx').on(table.accessLevel),
    folderIdx: index('resources_folder_idx').on(table.folder),
    activeIdx: index('resources_active_idx').on(table.isActive),
    sortOrderIdx: index('resources_sort_order_idx').on(table.sortOrder),
  })
);

/**
 * Resource Downloads Table Schema
 * Tracks individual resource downloads for analytics
 */
export const resourceDownloads = pgTable(
  'resource_downloads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    resourceId: uuid('resource_id').notNull().references(() => resources.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // Null for anonymous
    
    // Download metadata
    ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
    userAgent: text('user_agent'),
    downloadSource: varchar('download_source', { length: 50 }).default('web'), // web, mobile, api
    
    // Timestamps
    downloadedAt: timestamp('downloaded_at').notNull().defaultNow(),
  },
  (table) => ({
    resourceIdx: index('resource_downloads_resource_idx').on(table.resourceId),
    userIdx: index('resource_downloads_user_idx').on(table.userId),
    downloadTimeIdx: index('resource_downloads_time_idx').on(table.downloadedAt),
  })
);

/**
 * Resource Views Table Schema
 * Tracks resource views/access for analytics (separate from downloads)
 */
export const resourceViews = pgTable(
  'resource_views',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    resourceId: uuid('resource_id').notNull().references(() => resources.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // Null for anonymous
    
    // View metadata
    viewDuration: integer('view_duration'), // Time spent viewing in seconds
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    
    // Timestamps
    viewedAt: timestamp('viewed_at').notNull().defaultNow(),
  },
  (table) => ({
    resourceIdx: index('resource_views_resource_idx').on(table.resourceId),
    userIdx: index('resource_views_user_idx').on(table.userId),
    viewTimeIdx: index('resource_views_time_idx').on(table.viewedAt),
  })
);

/**
 * Resources Relations
 */
export const resourcesRelations = relations(resources, ({ one, many }) => ({
  course: one(courses, {
    fields: [resources.courseId],
    references: [courses.id],
  }),
  uploader: one(users, {
    fields: [resources.uploadedBy],
    references: [users.id],
  }),
  downloads: many(resourceDownloads),
  views: many(resourceViews),
  // Self-referential for versioning
  parentResource: one(resources, {
    fields: [resources.parentResourceId],
    references: [resources.id],
  }),
}));

/**
 * Resource Downloads Relations
 */
export const resourceDownloadsRelations = relations(resourceDownloads, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceDownloads.resourceId],
    references: [resources.id],
  }),
  user: one(users, {
    fields: [resourceDownloads.userId],
    references: [users.id],
  }),
}));

/**
 * Resource Views Relations
 */
export const resourceViewsRelations = relations(resourceViews, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceViews.resourceId],
    references: [resources.id],
  }),
  user: one(users, {
    fields: [resourceViews.userId],
    references: [users.id],
  }),
}));

/**
 * Type inference for TypeScript
 */
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type ResourceDownload = typeof resourceDownloads.$inferSelect;
export type NewResourceDownload = typeof resourceDownloads.$inferInsert;
export type ResourceView = typeof resourceViews.$inferSelect;
export type NewResourceView = typeof resourceViews.$inferInsert;
