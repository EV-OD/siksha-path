import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  index,
  numeric,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { courses } from './courses.schema';
import { enrollments } from './enrollments.schema';

/**
 * Payment Gateway Enum
 * Supported payment providers
 */
export const paymentGatewayEnum = pgEnum('payment_gateway', [
  'esewa', // Local Nepal payment gateway
  'khalti', // Popular Nepal digital wallet
  'fonepay', // Nepal fintech payment solution
  'stripe', // International card processing
  'manual', // Manual/offline payments
  'free', // Free course enrollment
]);

/**
 * Payment Status Enum
 * Lifecycle of payment transactions
 */
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending', // Payment initiated but not completed
  'processing', // Payment being processed by gateway
  'completed', // Payment successful and confirmed
  'failed', // Payment failed or declined
  'cancelled', // Payment cancelled by user
  'refunded', // Payment refunded to user
  'disputed', // Payment under dispute/chargeback
  'expired', // Payment link/session expired
]);

/**
 * Payment Method Enum
 * Different payment methods within gateways
 */
export const paymentMethodEnum = pgEnum('payment_method', [
  'wallet', // Digital wallet (eSewa, Khalti)
  'bank_transfer', // Direct bank transfer
  'credit_card', // Credit card (via Stripe)
  'debit_card', // Debit card (via Stripe)
  'mobile_banking', // Mobile banking
  'cash', // Cash payment (manual)
  'other', // Other methods
]);

/**
 * Currency Enum
 * Supported currencies
 */
export const currencyEnum = pgEnum('currency', ['NPR', 'USD', 'INR']);

/**
 * Payments Table Schema
 * Central payment transaction management
 *
 * Design principles:
 * - Multi-gateway support with unified interface
 * - Complete transaction audit trail
 * - Support for refunds and disputes
 * - Revenue tracking for teachers
 * - Compliance with financial regulations
 * - Webhook and callback handling
 */
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    enrollmentId: uuid('enrollment_id').references(() => enrollments.id, {
      onDelete: 'set null',
    }),

    // Payment details
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: currencyEnum('currency').notNull().default('NPR'),
    gateway: paymentGatewayEnum('gateway').notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    status: paymentStatusEnum('status').notNull().default('pending'),

    // Gateway-specific information
    gatewayTransactionId: varchar('gateway_transaction_id', { length: 255 }),
    gatewayPaymentId: varchar('gateway_payment_id', { length: 255 }),
    gatewayOrderId: varchar('gateway_order_id', { length: 255 }),
    gatewayResponse: text('gateway_response'), // JSON response from gateway

    // Payment metadata
    description: text('description'),
    invoiceNumber: varchar('invoice_number', { length: 50 }),

    // User information at time of payment
    payerName: varchar('payer_name', { length: 255 }),
    payerEmail: varchar('payer_email', { length: 255 }),
    payerPhone: varchar('payer_phone', { length: 20 }),

    // Fee and commission calculation
    platformFee: numeric('platform_fee', { precision: 10, scale: 2 }).default(
      '0.00',
    ),
    gatewayFee: numeric('gateway_fee', { precision: 10, scale: 2 }).default(
      '0.00',
    ),
    teacherAmount: numeric('teacher_amount', {
      precision: 10,
      scale: 2,
    }).notNull(),

    // Refund information
    refundAmount: numeric('refund_amount', { precision: 10, scale: 2 }).default(
      '0.00',
    ),
    refundedAt: timestamp('refunded_at'),
    refundReason: text('refund_reason'),
    refundedBy: uuid('refunded_by').references(() => users.id),

    // Payment flow tracking
    initiatedAt: timestamp('initiated_at').defaultNow(),
    completedAt: timestamp('completed_at'),
    failedAt: timestamp('failed_at'),

    // Security and fraud prevention
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    deviceFingerprint: varchar('device_fingerprint', { length: 255 }),

    // Webhook and callback tracking
    webhookReceived: varchar('webhook_received', { length: 10 }).default(
      'false',
    ),
    webhookReceivedAt: timestamp('webhook_received_at'),
    callbackUrl: text('callback_url'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Indexes for performance and querying
    userIdx: index('payments_user_idx').on(table.userId),
    courseIdx: index('payments_course_idx').on(table.courseId),
    statusIdx: index('payments_status_idx').on(table.status),
    gatewayIdx: index('payments_gateway_idx').on(table.gateway),
    gatewayTransactionIdx: index('payments_gateway_transaction_idx').on(
      table.gatewayTransactionId,
    ),
    completedAtIdx: index('payments_completed_at_idx').on(table.completedAt),
    invoiceIdx: index('payments_invoice_idx').on(table.invoiceNumber),
  }),
);

/**
 * Payment Logs Table Schema
 * Detailed audit trail of payment events and gateway communications
 */
export const paymentLogs = pgTable(
  'payment_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    paymentId: uuid('payment_id')
      .notNull()
      .references(() => payments.id, { onDelete: 'cascade' }),

    // Log details
    event: varchar('event', { length: 100 }).notNull(), // initiated, processing, completed, failed, etc.
    message: text('message'),
    data: text('data'), // JSON data associated with the event

    // Gateway interaction
    gatewayRequest: text('gateway_request'), // Request sent to gateway
    gatewayResponse: text('gateway_response'), // Response from gateway

    // Error information
    errorCode: varchar('error_code', { length: 50 }),
    errorMessage: text('error_message'),

    // Timestamp
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    paymentIdx: index('payment_logs_payment_idx').on(table.paymentId),
    eventIdx: index('payment_logs_event_idx').on(table.event),
    createdAtIdx: index('payment_logs_created_at_idx').on(table.createdAt),
  }),
);

/**
 * Teacher Earnings Table Schema
 * Tracks earnings and payouts for teachers
 */
export const teacherEarnings = pgTable(
  'teacher_earnings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    paymentId: uuid('payment_id')
      .notNull()
      .references(() => payments.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),

    // Earnings calculation
    grossAmount: numeric('gross_amount', { precision: 10, scale: 2 }).notNull(),
    platformCommission: numeric('platform_commission', {
      precision: 10,
      scale: 2,
    }).notNull(),
    netAmount: numeric('net_amount', { precision: 10, scale: 2 }).notNull(),
    currency: currencyEnum('currency').notNull().default('NPR'),

    // Payout tracking
    payoutStatus: varchar('payout_status', { length: 20 })
      .notNull()
      .default('pending'), // pending, paid, held
    payoutAmount: numeric('payout_amount', { precision: 10, scale: 2 }),
    payoutDate: timestamp('payout_date'),
    payoutMethod: varchar('payout_method', { length: 50 }),
    payoutReference: varchar('payout_reference', { length: 255 }),

    // Timestamps
    earnedAt: timestamp('earned_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    teacherIdx: index('teacher_earnings_teacher_idx').on(table.teacherId),
    paymentIdx: index('teacher_earnings_payment_idx').on(table.paymentId),
    courseIdx: index('teacher_earnings_course_idx').on(table.courseId),
    payoutStatusIdx: index('teacher_earnings_payout_status_idx').on(
      table.payoutStatus,
    ),
    earnedAtIdx: index('teacher_earnings_earned_at_idx').on(table.earnedAt),
  }),
);

/**
 * Payment Relations
 */
export const paymentsRelations = relations(payments, ({ one, many }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [payments.courseId],
    references: [courses.id],
  }),
  enrollment: one(enrollments, {
    fields: [payments.enrollmentId],
    references: [enrollments.id],
  }),
  refundedByUser: one(users, {
    fields: [payments.refundedBy],
    references: [users.id],
  }),
  logs: many(paymentLogs),
  teacherEarnings: many(teacherEarnings),
}));

/**
 * Payment Logs Relations
 */
export const paymentLogsRelations = relations(paymentLogs, ({ one }) => ({
  payment: one(payments, {
    fields: [paymentLogs.paymentId],
    references: [payments.id],
  }),
}));

/**
 * Teacher Earnings Relations
 */
export const teacherEarningsRelations = relations(
  teacherEarnings,
  ({ one }) => ({
    teacher: one(users, {
      fields: [teacherEarnings.teacherId],
      references: [users.id],
    }),
    payment: one(payments, {
      fields: [teacherEarnings.paymentId],
      references: [payments.id],
    }),
    course: one(courses, {
      fields: [teacherEarnings.courseId],
      references: [courses.id],
    }),
  }),
);

/**
 * Type inference for TypeScript
 */
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type PaymentLog = typeof paymentLogs.$inferSelect;
export type NewPaymentLog = typeof paymentLogs.$inferInsert;
export type TeacherEarning = typeof teacherEarnings.$inferSelect;
export type NewTeacherEarning = typeof teacherEarnings.$inferInsert;
