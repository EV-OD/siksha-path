📘 SikshaPath – Project Documentation
1. Introduction

SikshaPath is a Nepal-focused e-learning platform inspired by modern platforms like Unacademy.
It provides a digital path for students to learn, teachers to teach, and administrators to manage, all within a scalable and secure system.

The current phase of the project focuses on API-only development (backend first), with UI/UX implementation planned later.

2. Features
2.1 Student Features

Authentication & Profile

Login / Register (JWT-based authentication)

Update profile (name, bio, picture, contact info)

Change password / reset password

Course Management

Browse available courses

Purchase courses (via payment gateway: eSewa, Khalti, Fonepay, Stripe)

Enroll in free/paid courses

Leave a course and renew subscription

Course Interaction

Access live class schedules

Join live classes (Zoom API integration)

View/download resources (text, images, PDF, PPTX, DOCX)

Participate in group chat (text + image only)

2.2 Teacher Features

Authentication & Profile

Login / Register

Update profile, change password

Course Management

Create courses with detailed metadata (title, description, price, category, duration, language, etc.)

Edit course details anytime (even if students are enrolled)

Delete course (only if zero students subscribed)

Live Classes

Schedule live classes (with date, time, Zoom link)

Cancel live classes

Resources

Upload resources (text, images, PDFs, PPTX, DOCX)

Manage uploaded resources

Student Interaction

Group chat with enrolled students (text + image only)

Post resources in resource section (students can only view/download)

Earnings Dashboard

Track number of enrolled students

View income reports, payment history

2.3 Admin Features

User Management

Search/filter students (by name, course, activity, payment status)

View student profiles and enrolled courses

Search/filter teachers (by name, courses, income, activity)

View teacher profiles, course history, payment history

Platform Management

Manage users (suspend/reactivate accounts)

Monitor overall course statistics

View payment and income analytics

3. System Requirements
3.1 Functional Requirements

Secure authentication and authorization (JWT with role-based access control: Student / Teacher / Admin)

Payment gateway integration (local + global options)

Zoom API integration for live classes

File storage for resources (S3-compatible storage, e.g., Cloudflare R2 or AWS S3)

WebSocket-based chat system (group chat per course)

RESTful API (future-proof with GraphQL option)

Admin dashboard endpoints for user/course/payment management

3.2 Non-Functional Requirements

Scalability → Must support thousands of concurrent students in live sessions

Security → Role-based access, encrypted credentials, secure payments

Performance → API response time <300ms for most requests

Availability → 99.9% uptime target with managed database and hosting

Maintainability → Modular, testable backend with CI/CD pipeline

4. Tech Stack
4.1 Backend

Framework: NestJS (TypeScript)

ORM: Drizzle ORM (schema-safe, lightweight migrations)

Database: Supabase (Postgres managed service, used strictly as DB layer)

Authentication: JWT-based auth with role-based access control

Realtime Chat: NestJS WebSocket Gateway + Redis Pub/Sub (for scale)

Live Classes: Zoom API integration

File Storage: S3-compatible storage (Cloudflare R2)

Payments: eSewa / Khalti / Stripe / Fonepay

4.2 DevOps & Deployment

Hosting: Vercel (for frontend in future) + Railway/Render/DigitalOcean for backend

Database Hosting: Supabase managed Postgres

Caching/Realtime: Redis (managed via Upstash or Railway)

Monitoring: Sentry (error tracking), LogRocket (optional)

CI/CD: GitHub Actions