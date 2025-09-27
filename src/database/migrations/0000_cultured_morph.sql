CREATE TYPE "public"."message_status" AS ENUM('sent', 'delivered', 'read', 'failed', 'moderated');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'system', 'announcement', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."course_category" AS ENUM('mathematics', 'science', 'english', 'nepali', 'social_studies', 'computer_science', 'engineering', 'medical', 'business', 'arts', 'language', 'other');--> statement-breakpoint
CREATE TYPE "public"."course_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."course_language" AS ENUM('nepali', 'english', 'hindi', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."course_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'inactive', 'expired', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."enrollment_type" AS ENUM('free', 'paid');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('NPR', 'USD', 'INR');--> statement-breakpoint
CREATE TYPE "public"."live_class_status" AS ENUM('scheduled', 'ongoing', 'completed', 'cancelled', 'missed');--> statement-breakpoint
CREATE TYPE "public"."live_class_type" AS ENUM('lecture', 'discussion', 'workshop', 'exam', 'review');--> statement-breakpoint
CREATE TYPE "public"."payment_gateway" AS ENUM('esewa', 'khalti', 'fonepay', 'stripe', 'manual', 'free');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('wallet', 'bank_transfer', 'credit_card', 'debit_card', 'mobile_banking', 'cash', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'disputed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."resource_access" AS ENUM('public', 'enrolled', 'premium', 'teacher');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('pdf', 'pptx', 'docx', 'image', 'video', 'audio', 'text', 'link', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'teacher', 'admin');--> statement-breakpoint
CREATE TABLE "chat_message_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text,
	"type" "message_type" DEFAULT 'text' NOT NULL,
	"image_url" text,
	"image_file_name" varchar(255),
	"image_size" integer,
	"thumbnail_url" text,
	"status" "message_status" DEFAULT 'sent' NOT NULL,
	"is_edited" varchar(10) DEFAULT 'false' NOT NULL,
	"edited_at" timestamp,
	"is_deleted" varchar(10) DEFAULT 'false' NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"delete_reason" varchar(255),
	"parent_message_id" uuid,
	"thread_count" integer DEFAULT 0,
	"reactions" text,
	"client_message_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_room_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"is_muted" varchar(10) DEFAULT 'false' NOT NULL,
	"muted_until" timestamp,
	"can_send_messages" varchar(10) DEFAULT 'true' NOT NULL,
	"can_send_images" varchar(10) DEFAULT 'true' NOT NULL,
	"can_delete_own_messages" varchar(10) DEFAULT 'true' NOT NULL,
	"last_seen_at" timestamp DEFAULT now(),
	"last_message_at" timestamp,
	"message_count" integer DEFAULT 0,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"short_description" varchar(500),
	"category" "course_category" NOT NULL,
	"language" "course_language" DEFAULT 'nepali' NOT NULL,
	"difficulty" "course_difficulty" DEFAULT 'beginner' NOT NULL,
	"status" "course_status" DEFAULT 'draft' NOT NULL,
	"price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"original_price" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'NPR' NOT NULL,
	"total_duration" integer,
	"total_lessons" integer DEFAULT 0,
	"total_resources" integer DEFAULT 0,
	"thumbnail_url" text,
	"video_preview_url" text,
	"tags" text,
	"prerequisites" text,
	"learning_outcomes" text,
	"target_audience" text,
	"enrollment_count" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"total_ratings" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"type" "enrollment_type" NOT NULL,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"amount_paid" numeric(10, 2) DEFAULT '0.00',
	"currency" varchar(3) DEFAULT 'NPR',
	"payment_id" uuid,
	"access_granted_at" timestamp DEFAULT now(),
	"access_expires_at" timestamp,
	"progress_percentage" numeric(5, 2) DEFAULT '0.00',
	"last_accessed_at" timestamp,
	"completed_at" timestamp,
	"enrollment_source" varchar(50) DEFAULT 'web',
	"referral_code" varchar(50),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_class_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"live_class_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"joined_at" timestamp,
	"left_at" timestamp,
	"duration" integer,
	"attendance_status" varchar(20) DEFAULT 'absent' NOT NULL,
	"zoom_participant_id" varchar(100),
	"zoom_user_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "live_class_type" DEFAULT 'lecture' NOT NULL,
	"status" "live_class_status" DEFAULT 'scheduled' NOT NULL,
	"scheduled_start_time" timestamp NOT NULL,
	"scheduled_end_time" timestamp NOT NULL,
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"duration" integer,
	"timezone" varchar(50) DEFAULT 'Asia/Kathmandu' NOT NULL,
	"zoom_meeting_id" varchar(50),
	"zoom_join_url" text,
	"zoom_start_url" text,
	"zoom_password" varchar(50),
	"zoom_meeting_uuid" varchar(100),
	"recording_enabled" varchar(10) DEFAULT 'true' NOT NULL,
	"recording_url" text,
	"recording_password" varchar(50),
	"recording_size" integer,
	"max_attendees" integer DEFAULT 100,
	"attendee_count" integer DEFAULT 0,
	"reminder_sent" varchar(10) DEFAULT 'false' NOT NULL,
	"reminder_sent_at" timestamp,
	"agenda" text,
	"prerequisites" text,
	"materials" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"event" varchar(100) NOT NULL,
	"message" text,
	"data" text,
	"gateway_request" text,
	"gateway_response" text,
	"error_code" varchar(50),
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"enrollment_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"currency" "currency" DEFAULT 'NPR' NOT NULL,
	"gateway" "payment_gateway" NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"gateway_transaction_id" varchar(255),
	"gateway_payment_id" varchar(255),
	"gateway_order_id" varchar(255),
	"gateway_response" text,
	"description" text,
	"invoice_number" varchar(50),
	"payer_name" varchar(255),
	"payer_email" varchar(255),
	"payer_phone" varchar(20),
	"platform_fee" numeric(10, 2) DEFAULT '0.00',
	"gateway_fee" numeric(10, 2) DEFAULT '0.00',
	"teacher_amount" numeric(10, 2) NOT NULL,
	"refund_amount" numeric(10, 2) DEFAULT '0.00',
	"refunded_at" timestamp,
	"refund_reason" text,
	"refunded_by" uuid,
	"initiated_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"failed_at" timestamp,
	"ip_address" varchar(45),
	"user_agent" text,
	"device_fingerprint" varchar(255),
	"webhook_received" varchar(10) DEFAULT 'false',
	"webhook_received_at" timestamp,
	"callback_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" uuid NOT NULL,
	"user_id" uuid,
	"ip_address" varchar(45),
	"user_agent" text,
	"download_source" varchar(50) DEFAULT 'web',
	"downloaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" uuid NOT NULL,
	"user_id" uuid,
	"view_duration" integer,
	"ip_address" varchar(45),
	"user_agent" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "resource_type" NOT NULL,
	"access_level" "resource_access" DEFAULT 'enrolled' NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_file_name" varchar(255) NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"file_extension" varchar(10),
	"storage_url" text NOT NULL,
	"storage_path" text NOT NULL,
	"bucket_name" varchar(100),
	"folder" varchar(255) DEFAULT 'general',
	"sort_order" integer DEFAULT 0,
	"tags" text,
	"thumbnail_url" text,
	"duration" integer,
	"page_count" integer,
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"download_enabled" varchar(10) DEFAULT 'true' NOT NULL,
	"view_online_enabled" varchar(10) DEFAULT 'true' NOT NULL,
	"download_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"version" varchar(20) DEFAULT '1.0',
	"parent_resource_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"gross_amount" numeric(10, 2) NOT NULL,
	"platform_commission" numeric(10, 2) NOT NULL,
	"net_amount" numeric(10, 2) NOT NULL,
	"currency" "currency" DEFAULT 'NPR' NOT NULL,
	"payout_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payout_amount" numeric(10, 2),
	"payout_date" timestamp,
	"payout_method" varchar(50),
	"payout_reference" varchar(255),
	"earned_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"bio" text,
	"profile_picture" text,
	"phone" varchar(20),
	"address" text,
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"is_verified" varchar(10) DEFAULT 'false' NOT NULL,
	"teacher_verified" varchar(10) DEFAULT 'false',
	"specialization" varchar(255),
	"experience" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_parent_message_id_chat_messages_id_fk" FOREIGN KEY ("parent_message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_class_attendance" ADD CONSTRAINT "live_class_attendance_live_class_id_live_classes_id_fk" FOREIGN KEY ("live_class_id") REFERENCES "public"."live_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_class_attendance" ADD CONSTRAINT "live_class_attendance_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_refunded_by_users_id_fk" FOREIGN KEY ("refunded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_downloads" ADD CONSTRAINT "resource_downloads_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_downloads" ADD CONSTRAINT "resource_downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_views" ADD CONSTRAINT "resource_views_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_views" ADD CONSTRAINT "resource_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_earnings" ADD CONSTRAINT "teacher_earnings_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_earnings" ADD CONSTRAINT "teacher_earnings_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_earnings" ADD CONSTRAINT "teacher_earnings_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_message_reads_message_user_idx" ON "chat_message_reads" USING btree ("message_id","user_id");--> statement-breakpoint
CREATE INDEX "chat_message_reads_user_course_idx" ON "chat_message_reads" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "chat_message_reads_course_idx" ON "chat_message_reads" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "chat_messages_course_time_idx" ON "chat_messages" USING btree ("course_id","created_at");--> statement-breakpoint
CREATE INDEX "chat_messages_sender_idx" ON "chat_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "chat_messages_status_idx" ON "chat_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "chat_messages_deleted_idx" ON "chat_messages" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "chat_messages_parent_idx" ON "chat_messages" USING btree ("parent_message_id");--> statement-breakpoint
CREATE INDEX "chat_messages_client_idx" ON "chat_messages" USING btree ("client_message_id");--> statement-breakpoint
CREATE INDEX "chat_room_members_course_user_idx" ON "chat_room_members" USING btree ("course_id","user_id");--> statement-breakpoint
CREATE INDEX "chat_room_members_user_idx" ON "chat_room_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_room_members_active_idx" ON "chat_room_members" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "chat_room_members_last_seen_idx" ON "chat_room_members" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "courses_teacher_idx" ON "courses" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "courses_category_idx" ON "courses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "courses_status_idx" ON "courses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "courses_price_idx" ON "courses" USING btree ("price");--> statement-breakpoint
CREATE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "courses_enrollment_idx" ON "courses" USING btree ("enrollment_count");--> statement-breakpoint
CREATE INDEX "courses_rating_idx" ON "courses" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "enrollments_student_course_idx" ON "enrollments" USING btree ("student_id","course_id");--> statement-breakpoint
CREATE INDEX "enrollments_student_idx" ON "enrollments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "enrollments_course_idx" ON "enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "enrollments_status_idx" ON "enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enrollments_type_idx" ON "enrollments" USING btree ("type");--> statement-breakpoint
CREATE INDEX "enrollments_access_expiry_idx" ON "enrollments" USING btree ("access_expires_at");--> statement-breakpoint
CREATE INDEX "enrollments_progress_idx" ON "enrollments" USING btree ("progress_percentage");--> statement-breakpoint
CREATE INDEX "live_class_attendance_class_student_idx" ON "live_class_attendance" USING btree ("live_class_id","student_id");--> statement-breakpoint
CREATE INDEX "live_class_attendance_class_idx" ON "live_class_attendance" USING btree ("live_class_id");--> statement-breakpoint
CREATE INDEX "live_class_attendance_student_idx" ON "live_class_attendance" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "live_classes_course_idx" ON "live_classes" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "live_classes_teacher_idx" ON "live_classes" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "live_classes_status_idx" ON "live_classes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "live_classes_scheduled_time_idx" ON "live_classes" USING btree ("scheduled_start_time");--> statement-breakpoint
CREATE INDEX "live_classes_zoom_meeting_idx" ON "live_classes" USING btree ("zoom_meeting_id");--> statement-breakpoint
CREATE INDEX "payment_logs_payment_idx" ON "payment_logs" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "payment_logs_event_idx" ON "payment_logs" USING btree ("event");--> statement-breakpoint
CREATE INDEX "payment_logs_created_at_idx" ON "payment_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_user_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_course_idx" ON "payments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_gateway_idx" ON "payments" USING btree ("gateway");--> statement-breakpoint
CREATE INDEX "payments_gateway_transaction_idx" ON "payments" USING btree ("gateway_transaction_id");--> statement-breakpoint
CREATE INDEX "payments_completed_at_idx" ON "payments" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "payments_invoice_idx" ON "payments" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "resource_downloads_resource_idx" ON "resource_downloads" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "resource_downloads_user_idx" ON "resource_downloads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resource_downloads_time_idx" ON "resource_downloads" USING btree ("downloaded_at");--> statement-breakpoint
CREATE INDEX "resource_views_resource_idx" ON "resource_views" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "resource_views_user_idx" ON "resource_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resource_views_time_idx" ON "resource_views" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX "resources_course_idx" ON "resources" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "resources_uploader_idx" ON "resources" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "resources_type_idx" ON "resources" USING btree ("type");--> statement-breakpoint
CREATE INDEX "resources_access_idx" ON "resources" USING btree ("access_level");--> statement-breakpoint
CREATE INDEX "resources_folder_idx" ON "resources" USING btree ("folder");--> statement-breakpoint
CREATE INDEX "resources_active_idx" ON "resources" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "resources_sort_order_idx" ON "resources" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "teacher_earnings_teacher_idx" ON "teacher_earnings" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "teacher_earnings_payment_idx" ON "teacher_earnings" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "teacher_earnings_course_idx" ON "teacher_earnings" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "teacher_earnings_payout_status_idx" ON "teacher_earnings" USING btree ("payout_status");--> statement-breakpoint
CREATE INDEX "teacher_earnings_earned_at_idx" ON "teacher_earnings" USING btree ("earned_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_active_idx" ON "users" USING btree ("is_active");