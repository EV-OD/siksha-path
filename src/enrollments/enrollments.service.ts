import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, or, desc, count, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { enrollments } from '../database/schemas/enrollments.schema';
import { courses } from '../database/schemas/courses.schema';
import { users } from '../database/schemas/users.schema';
import {
  EnrollInCourseDto,
  EnrollmentResponseDto,
  EnrollmentListResponseDto,
  UpdateProgressDto,
} from './dto/enrollment.dto';

@Injectable()
export class EnrollmentsService {
  private db;

  constructor(private configService: ConfigService) {
    const pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });
    this.db = drizzle(pool);
  }

  /**
   * Enroll a student in a course
   */
  async enrollStudent(
    studentId: string,
    enrollDto: EnrollInCourseDto,
  ): Promise<EnrollmentResponseDto> {
    const { courseId } = enrollDto;

    // Check if course exists and is published
    const course = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.status, 'published')))
      .limit(1);

    if (course.length === 0) {
      throw new NotFoundException('Course not found or not available for enrollment');
    }

    const foundCourse = course[0];

    // Check if student is already enrolled
    const existingEnrollment = await this.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.courseId, courseId),
          or(
            eq(enrollments.status, 'active'),
            eq(enrollments.status, 'completed'),
          ),
        ),
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      throw new ConflictException('Student is already enrolled in this course');
    }

    // Determine enrollment type and handle payment
    const enrollmentType = foundCourse.price > 0 ? 'paid' : 'free';
    let amountPaid = 0;
    let paymentId = null;

    if (enrollmentType === 'paid') {
      // TODO: Integrate with payment system (PAYMENT-001)
      // For now, we'll allow enrollment but mark as unpaid
      // This should be replaced with actual payment processing
      throw new BadRequestException(
        'Paid course enrollment requires payment integration. Please use free courses for now.',
      );
    }

    // Create enrollment
    const newEnrollment = await this.db
      .insert(enrollments)
      .values({
        studentId,
        courseId,
        type: enrollmentType,
        status: 'active',
        amountPaid: amountPaid.toString(),
        currency: 'NPR',
        paymentId,
        accessGrantedAt: new Date(),
      })
      .returning();

    // Update course enrollment count
    await this.db
      .update(courses)
      .set({
        enrollmentCount: sql`${courses.enrollmentCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId));

    return this.getEnrollmentById(newEnrollment[0].id);
  }

  /**
   * Get student's enrollments
   */
  async getStudentEnrollments(
    studentId: string,
    page: number = 1,
    limit: number = 10,
    status?: 'active' | 'inactive' | 'expired' | 'cancelled' | 'completed',
  ): Promise<EnrollmentListResponseDto> {
    const offset = (page - 1) * limit;

    // Build where condition
    const whereCondition = status
      ? and(eq(enrollments.studentId, studentId), eq(enrollments.status, status))
      : eq(enrollments.studentId, studentId);

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(enrollments)
      .where(whereCondition);

    const total = totalResult.count;

    // Get enrollments with course and teacher info
    const enrollmentsData = await this.db
      .select({
        // Enrollment fields
        id: enrollments.id,
        studentId: enrollments.studentId,
        courseId: enrollments.courseId,
        type: enrollments.type,
        status: enrollments.status,
        amountPaid: enrollments.amountPaid,
        currency: enrollments.currency,
        progressPercentage: enrollments.progressPercentage,
        accessGrantedAt: enrollments.accessGrantedAt,
        accessExpiresAt: enrollments.accessExpiresAt,
        lastAccessedAt: enrollments.lastAccessedAt,
        completedAt: enrollments.completedAt,
        createdAt: enrollments.createdAt,
        updatedAt: enrollments.updatedAt,
        // Course fields
        courseTitle: courses.title,
        courseThumbnailUrl: courses.thumbnailUrl,
        // Teacher fields
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .innerJoin(users, eq(courses.teacherId, users.id))
      .where(whereCondition)
      .orderBy(desc(enrollments.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform to DTOs
    const enrollmentResponses: EnrollmentResponseDto[] = enrollmentsData.map(
      (enrollment) => ({
        id: enrollment.id,
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        type: enrollment.type,
        status: enrollment.status,
        amountPaid: enrollment.amountPaid ? parseFloat(enrollment.amountPaid) : 0,
        currency: enrollment.currency,
        progressPercentage: enrollment.progressPercentage
          ? parseFloat(enrollment.progressPercentage)
          : 0,
        accessGrantedAt: enrollment.accessGrantedAt,
        accessExpiresAt: enrollment.accessExpiresAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        completedAt: enrollment.completedAt,
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt,
        course: {
          id: enrollment.courseId,
          title: enrollment.courseTitle,
          thumbnailUrl: enrollment.courseThumbnailUrl,
          teacherName: `${enrollment.teacherFirstName} ${enrollment.teacherLastName}`,
        },
      }),
    );

    return {
      enrollments: enrollmentResponses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(id: string): Promise<EnrollmentResponseDto> {
    const enrollmentData = await this.db
      .select({
        // Enrollment fields
        id: enrollments.id,
        studentId: enrollments.studentId,
        courseId: enrollments.courseId,
        type: enrollments.type,
        status: enrollments.status,
        amountPaid: enrollments.amountPaid,
        currency: enrollments.currency,
        progressPercentage: enrollments.progressPercentage,
        accessGrantedAt: enrollments.accessGrantedAt,
        accessExpiresAt: enrollments.accessExpiresAt,
        lastAccessedAt: enrollments.lastAccessedAt,
        completedAt: enrollments.completedAt,
        createdAt: enrollments.createdAt,
        updatedAt: enrollments.updatedAt,
        // Course fields
        courseTitle: courses.title,
        courseThumbnailUrl: courses.thumbnailUrl,
        // Teacher fields
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .innerJoin(users, eq(courses.teacherId, users.id))
      .where(eq(enrollments.id, id))
      .limit(1);

    if (enrollmentData.length === 0) {
      throw new NotFoundException('Enrollment not found');
    }

    const enrollment = enrollmentData[0];

    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      type: enrollment.type,
      status: enrollment.status,
      amountPaid: enrollment.amountPaid ? parseFloat(enrollment.amountPaid) : 0,
      currency: enrollment.currency,
      progressPercentage: enrollment.progressPercentage
        ? parseFloat(enrollment.progressPercentage)
        : 0,
      accessGrantedAt: enrollment.accessGrantedAt,
      accessExpiresAt: enrollment.accessExpiresAt,
      lastAccessedAt: enrollment.lastAccessedAt,
      completedAt: enrollment.completedAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      course: {
        id: enrollment.courseId,
        title: enrollment.courseTitle,
        thumbnailUrl: enrollment.courseThumbnailUrl,
        teacherName: `${enrollment.teacherFirstName} ${enrollment.teacherLastName}`,
      },
    };
  }

  /**
   * Update enrollment progress
   */
  async updateProgress(
    enrollmentId: string,
    studentId: string,
    updateProgressDto: UpdateProgressDto,
  ): Promise<EnrollmentResponseDto> {
    // Check if enrollment exists and belongs to student
    const enrollment = await this.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.id, enrollmentId),
          eq(enrollments.studentId, studentId),
          eq(enrollments.status, 'active'),
        ),
      )
      .limit(1);

    if (enrollment.length === 0) {
      throw new NotFoundException('Enrollment not found or not accessible');
    }

    // Update progress
    const { progressPercentage } = updateProgressDto;
    const updateData: any = {
      progressPercentage: progressPercentage.toString(),
      lastAccessedAt: new Date(),
      updatedAt: new Date(),
    };

    // Mark as completed if progress is 100%
    if (progressPercentage >= 100) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
    }

    await this.db
      .update(enrollments)
      .set(updateData)
      .where(eq(enrollments.id, enrollmentId));

    return this.getEnrollmentById(enrollmentId);
  }

  /**
   * Unenroll from a course
   */
  async unenrollStudent(enrollmentId: string, studentId: string): Promise<{ message: string }> {
    // Check if enrollment exists and belongs to student
    const enrollment = await this.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.id, enrollmentId),
          eq(enrollments.studentId, studentId),
        ),
      )
      .limit(1);

    if (enrollment.length === 0) {
      throw new NotFoundException('Enrollment not found');
    }

    const foundEnrollment = enrollment[0];

    // Check if course is completed - don't allow unenrollment
    if (foundEnrollment.status === 'completed') {
      throw new BadRequestException('Cannot unenroll from a completed course');
    }

    // Update enrollment status
    await this.db
      .update(enrollments)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(enrollments.id, enrollmentId));

    // Decrease course enrollment count
    await this.db
      .update(courses)
      .set({
        enrollmentCount: sql`${courses.enrollmentCount} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, foundEnrollment.courseId));

    return { message: 'Successfully unenrolled from the course' };
  }

  /**
   * Check if student is enrolled in a course
   */
  async isStudentEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.courseId, courseId),
          eq(enrollments.status, 'active'),
        ),
      )
      .limit(1);

    return enrollment.length > 0;
  }

  /**
   * Get course enrollments (for teachers/admins)
   */
  async getCourseEnrollments(
    courseId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
    teacherName?: string,
  ): Promise<EnrollmentListResponseDto> {
    // Check if user owns the course or is admin
    const course = await this.db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (course.length === 0) {
      throw new NotFoundException('Course not found');
    }

    // TODO: Add role checking for admin access
    // For now, only course owner can see enrollments
    if (course[0].teacherId !== userId) {
      throw new ForbiddenException('You can only view enrollments for your own courses');
    }

    const offset = (page - 1) * limit;

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));

    const total = totalResult.count;

    // Get enrollments with student info
    const enrollmentsData = await this.db
      .select({
        // Enrollment fields
        id: enrollments.id,
        studentId: enrollments.studentId,
        courseId: enrollments.courseId,
        type: enrollments.type,
        status: enrollments.status,
        amountPaid: enrollments.amountPaid,
        currency: enrollments.currency,
        progressPercentage: enrollments.progressPercentage,
        accessGrantedAt: enrollments.accessGrantedAt,
        accessExpiresAt: enrollments.accessExpiresAt,
        lastAccessedAt: enrollments.lastAccessedAt,
        completedAt: enrollments.completedAt,
        createdAt: enrollments.createdAt,
        updatedAt: enrollments.updatedAt,
        // Student fields
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        studentEmail: users.email,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .where(eq(enrollments.courseId, courseId))
      .orderBy(desc(enrollments.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform to DTOs
    const enrollmentResponses: EnrollmentResponseDto[] = enrollmentsData.map(
      (enrollment) => ({
        id: enrollment.id,
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        type: enrollment.type,
        status: enrollment.status,
        amountPaid: enrollment.amountPaid ? parseFloat(enrollment.amountPaid) : 0,
        currency: enrollment.currency,
        progressPercentage: enrollment.progressPercentage
          ? parseFloat(enrollment.progressPercentage)
          : 0,
        accessGrantedAt: enrollment.accessGrantedAt,
        accessExpiresAt: enrollment.accessExpiresAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        completedAt: enrollment.completedAt,
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt,
        course: {
          id: enrollment.courseId,
          title: course[0].title,
          thumbnailUrl: course[0].thumbnailUrl,
          teacherName: teacherName || 'Unknown Teacher',
        },
      }),
    );

    return {
      enrollments: enrollmentResponses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }
}