import { pgTable, uuid, varchar, text, timestamp, pgEnum, index, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { courses } from './courses.schema';

/**
 * Message Type Enum
 * Different types of messages in the chat system
 */
export const messageTypeEnum = pgEnum('message_type', [
  'text',       // Plain text message
  'image',      // Image attachment
  'system',     // System-generated messages (user joined, etc.)
  'announcement', // Teacher announcements
  'deleted'     // Deleted message (soft delete)
]);

/**
 * Message Status Enum
 * Delivery and read status of messages
 */
export const messageStatusEnum = pgEnum('message_status', [
  'sent',       // Message sent successfully
  'delivered',  // Message delivered to recipients
  'read',       // Message read by recipients
  'failed',     // Message failed to send
  'moderated'   // Message held for moderation
]);

/**
 * Chat Messages Table Schema
 * Manages group chat functionality for each course
 * 
 * Design principles:
 * - Course-based group chat rooms
 * - Support for text and image messages
 * - Message history and pagination
 * - Moderation capabilities for teachers/admins
 * - Real-time delivery status tracking
 * - Soft delete for message management
 */
export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    
    // Message content
    content: text('content'), // Text content or image caption
    type: messageTypeEnum('type').notNull().default('text'),
    
    // Image/attachment information
    imageUrl: text('image_url'), // S3 URL for image messages
    imageFileName: varchar('image_file_name', { length: 255 }),
    imageSize: integer('image_size'), // Size in bytes
    thumbnailUrl: text('thumbnail_url'), // Compressed thumbnail
    
    // Message metadata
    status: messageStatusEnum('status').notNull().default('sent'),
    isEdited: varchar('is_edited', { length: 10 }).notNull().default('false'),
    editedAt: timestamp('edited_at'),
    
    // Moderation
    isDeleted: varchar('is_deleted', { length: 10 }).notNull().default('false'),
    deletedAt: timestamp('deleted_at'),
    deletedBy: uuid('deleted_by').references(() => users.id), // Who deleted the message
    deleteReason: varchar('delete_reason', { length: 255 }),
    
    // Threading (future feature)
    parentMessageId: uuid('parent_message_id').references(() => chatMessages.id),
    threadCount: integer('thread_count').default(0),
    
    // Reactions (future feature - stored as JSON)
    reactions: text('reactions'), // JSON object: {"👍": ["userId1", "userId2"], "❤️": ["userId3"]}
    
    // Client-side message ID for deduplication
    clientMessageId: varchar('client_message_id', { length: 100 }),
    
    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Indexes for performance and chat functionality
    courseTimeIdx: index('chat_messages_course_time_idx').on(table.courseId, table.createdAt),
    senderIdx: index('chat_messages_sender_idx').on(table.senderId),
    statusIdx: index('chat_messages_status_idx').on(table.status),
    deletedIdx: index('chat_messages_deleted_idx').on(table.isDeleted),
    parentMessageIdx: index('chat_messages_parent_idx').on(table.parentMessageId),
    clientMessageIdx: index('chat_messages_client_idx').on(table.clientMessageId),
  })
);

/**
 * Chat Message Reads Table Schema
 * Tracks read status of messages by individual users
 * Enables read receipts and unread message counts
 */
export const chatMessageReads = pgTable(
  'chat_message_reads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    messageId: uuid('message_id').notNull().references(() => chatMessages.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    
    // Read tracking
    readAt: timestamp('read_at').notNull().defaultNow(),
    
    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    // Unique constraint: one read record per user per message
    messageUserIdx: index('chat_message_reads_message_user_idx').on(table.messageId, table.userId),
    userCourseIdx: index('chat_message_reads_user_course_idx').on(table.userId, table.courseId),
    courseIdx: index('chat_message_reads_course_idx').on(table.courseId),
  })
);

/**
 * Chat Room Members Table Schema
 * Tracks active members in each course chat room
 * Enables online status and member management
 */
export const chatRoomMembers = pgTable(
  'chat_room_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    
    // Member status
    isActive: varchar('is_active', { length: 10 }).notNull().default('true'),
    isMuted: varchar('is_muted', { length: 10 }).notNull().default('false'), // User muted by teacher/admin
    mutedUntil: timestamp('muted_until'), // Temporary muting
    
    // Permissions
    canSendMessages: varchar('can_send_messages', { length: 10 }).notNull().default('true'),
    canSendImages: varchar('can_send_images', { length: 10 }).notNull().default('true'),
    canDeleteOwnMessages: varchar('can_delete_own_messages', { length: 10 }).notNull().default('true'),
    
    // Activity tracking
    lastSeenAt: timestamp('last_seen_at').defaultNow(),
    lastMessageAt: timestamp('last_message_at'),
    messageCount: integer('message_count').default(0),
    
    // Timestamps
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Unique constraint: one membership per user per course
    courseUserIdx: index('chat_room_members_course_user_idx').on(table.courseId, table.userId),
    userIdx: index('chat_room_members_user_idx').on(table.userId),
    activeIdx: index('chat_room_members_active_idx').on(table.isActive),
    lastSeenIdx: index('chat_room_members_last_seen_idx').on(table.lastSeenAt),
  })
);

/**
 * Chat Messages Relations
 */
export const chatMessagesRelations = relations(chatMessages, ({ one, many }) => ({
  course: one(courses, {
    fields: [chatMessages.courseId],
    references: [courses.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
  deletedByUser: one(users, {
    fields: [chatMessages.deletedBy],
    references: [users.id],
  }),
  parentMessage: one(chatMessages, {
    fields: [chatMessages.parentMessageId],
    references: [chatMessages.id],
  }),
  reads: many(chatMessageReads),
}));

/**
 * Chat Message Reads Relations
 */
export const chatMessageReadsRelations = relations(chatMessageReads, ({ one }) => ({
  message: one(chatMessages, {
    fields: [chatMessageReads.messageId],
    references: [chatMessages.id],
  }),
  user: one(users, {
    fields: [chatMessageReads.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [chatMessageReads.courseId],
    references: [courses.id],
  }),
}));

/**
 * Chat Room Members Relations
 */
export const chatRoomMembersRelations = relations(chatRoomMembers, ({ one }) => ({
  course: one(courses, {
    fields: [chatRoomMembers.courseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [chatRoomMembers.userId],
    references: [users.id],
  }),
}));

/**
 * Type inference for TypeScript
 */
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessageRead = typeof chatMessageReads.$inferSelect;
export type NewChatMessageRead = typeof chatMessageReads.$inferInsert;
export type ChatRoomMember = typeof chatRoomMembers.$inferSelect;
export type NewChatRoomMember = typeof chatRoomMembers.$inferInsert;
