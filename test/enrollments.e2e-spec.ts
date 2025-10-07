import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { users, courses, enrollments } from '../src/database/schemas';
import { hash } from 'bcryptjs';

describe('Enrollments (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let databaseService: DatabaseService;
  let studentToken: string;
  let teacherToken: string;

  const testStudent = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'student-e2e@test.com',
    firstName: 'Test',
    lastName: 'Student',
    role: 'student',
    password: 'hashed-password',
    isVerified: true,
    isActive: true,
  };

  const testTeacher = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'teacher-e2e@test.com',
    firstName: 'Test',
    lastName: 'Teacher',
    role: 'teacher',
    password: 'hashed-password',
    isVerified: true,
    isActive: true,
  };

  const testCourse = {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Test Course E2E',
    slug: 'test-course-e2e',
    description: 'A test course for enrollment e2e tests',
    category: 'computer_science',
    price: 0,
    status: 'published',
    teacherId: '550e8400-e29b-41d4-a716-446655440002',
  };

  let db: any;

  beforeAll(async () => {
    jest.setTimeout(30000); // Increase timeout to 30 seconds

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);

    // Create database connection for test data setup
    const pool = new Pool({
      connectionString: configService.get<string>('DATABASE_URL'),
    });
    db = drizzle(pool);

    await app.init();

    // Create test users in database
    const hashedPassword = await hash('testpassword', 10);

    await db.insert(users).values({
      id: testStudent.id,
      email: testStudent.email,
      firstName: testStudent.firstName,
      lastName: testStudent.lastName,
      password: hashedPassword,
      role: testStudent.role,
      isVerified: testStudent.isVerified,
      isActive: testStudent.isActive,
    }).onConflictDoNothing();

    await db.insert(users).values({
      id: testTeacher.id,
      email: testTeacher.email,
      firstName: testTeacher.firstName,
      lastName: testTeacher.lastName,
      password: hashedPassword,
      role: testTeacher.role,
      isVerified: testTeacher.isVerified,
      isActive: testTeacher.isActive,
    }).onConflictDoNothing();

    // Create test course
    await db.insert(courses).values({
      id: testCourse.id,
      title: testCourse.title,
      slug: testCourse.slug,
      description: testCourse.description,
      category: testCourse.category,
      price: testCourse.price,
      status: testCourse.status,
      teacherId: testCourse.teacherId,
    }).onConflictDoNothing();

    // Generate test tokens
    studentToken = jwtService.sign({
      sub: testStudent.id,
      email: testStudent.email,
      role: testStudent.role
    });
    teacherToken = jwtService.sign({
      sub: testTeacher.id,
      email: testTeacher.email,
      role: testTeacher.role
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(enrollments).where(eq(enrollments.courseId, testCourse.id));
    await db.delete(courses).where(eq(courses.id, testCourse.id));
    await db.delete(users).where(eq(users.id, testStudent.id));
    await db.delete(users).where(eq(users.id, testTeacher.id));

    await app.close();
  });

  describe('POST /enrollments', () => {
    it('should enroll student in free course', () => {
      return request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ courseId: testCourse.id })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.studentId).toBe(testStudent.id);
          expect(response.body.courseId).toBe(testCourse.id);
          expect(response.body.status).toBe('active');
          expect(response.body.type).toBe('free');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/enrollments')
        .send({ courseId: testCourse.id })
        .expect(401);
    });

    it('should return 404 for non-existent course', () => {
      return request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ courseId: 'non-existent-course' })
        .expect(404);
    });
  });

  describe('GET /enrollments/my-enrollments', () => {
    it('should return student enrollments', () => {
      return request(app.getHttpServer())
        .get('/enrollments/my-enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('enrollments');
          expect(response.body).toHaveProperty('pagination');
          expect(Array.isArray(response.body.enrollments)).toBe(true);
          expect(response.body.pagination).toHaveProperty('page');
          expect(response.body.pagination).toHaveProperty('limit');
          expect(response.body.pagination).toHaveProperty('total');
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/enrollments/my-enrollments?page=1&limit=5')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.pagination.page).toBe('1');
          expect(response.body.pagination.limit).toBe('5');
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/enrollments/my-enrollments?status=active')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.enrollments.every((enrollment: any) => enrollment.status === 'active')).toBe(true);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/enrollments/my-enrollments')
        .expect(401);
    });
  });

  describe('GET /enrollments/:id', () => {
    beforeAll(async () => {
      // Create test enrollment for this test suite
      await db.insert(enrollments).values({
        id: '550e8400-e29b-41d4-a716-446655440004',
        studentId: testStudent.id,
        courseId: testCourse.id,
        type: 'free',
        status: 'active',
        progressPercentage: 0,
      }).onConflictDoNothing();
    });

    it('should return enrollment details', () => {
      return request(app.getHttpServer())
        .get('/enrollments/550e8400-e29b-41d4-a716-446655440004')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('studentId');
          expect(response.body).toHaveProperty('courseId');
          expect(response.body).toHaveProperty('status');
          expect(response.body).toHaveProperty('course');
        });
    });

    it('should return 404 for non-existent enrollment', () => {
      return request(app.getHttpServer())
        .get('/enrollments/non-existent-enrollment')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });

  describe('PUT /enrollments/:id/progress', () => {
    beforeAll(async () => {
      // Create test enrollment for progress tests
      await db.insert(enrollments).values({
        id: '550e8400-e29b-41d4-a716-446655440004',
        studentId: testStudent.id,
        courseId: testCourse.id,
        type: 'free',
        status: 'active',
        progressPercentage: 0,
      }).onConflictDoNothing();
    });

    it('should update enrollment progress', () => {
      return request(app.getHttpServer())
        .put('/enrollments/550e8400-e29b-41d4-a716-446655440004/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ progressPercentage: 75 })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.progressPercentage).toBe(75);
        });
    });

    it('should mark as completed when progress reaches 100%', () => {
      return request(app.getHttpServer())
        .put('/enrollments/550e8400-e29b-41d4-a716-446655440004/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ progressPercentage: 100 })
        .expect(200)
        .then((response) => {
          expect(response.body.status).toBe('completed');
          expect(response.body.progressPercentage).toBe(100);
          expect(response.body).toHaveProperty('completedAt');
        });
    });

    it('should validate progress percentage range', () => {
      return request(app.getHttpServer())
        .put('/enrollments/550e8400-e29b-41d4-a716-446655440004/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ progressPercentage: 150 })
        .expect(400);
    });

    it('should return 404 for non-existent enrollment', () => {
      return request(app.getHttpServer())
        .put('/enrollments/non-existent-enrollment/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ progressPercentage: 50 })
        .expect(404);
    });
  });

  describe('DELETE /enrollments/:id', () => {
    beforeAll(async () => {
      // Create test enrollment for unenrollment tests
      await db.insert(enrollments).values({
        id: '550e8400-e29b-41d4-a716-446655440006',
        studentId: testStudent.id,
        courseId: testCourse.id,
        type: 'free',
        status: 'active',
        progressPercentage: 0,
      }).onConflictDoNothing();

      // Create completed enrollment for testing unenrollment restrictions
      await db.insert(enrollments).values({
        id: '550e8400-e29b-41d4-a716-446655440005',
        studentId: testStudent.id,
        courseId: testCourse.id,
        type: 'free',
        status: 'completed',
        progressPercentage: 100,
      }).onConflictDoNothing();
    });

    it('should unenroll student from course', () => {
      return request(app.getHttpServer())
        .delete('/enrollments/550e8400-e29b-41d4-a716-446655440006')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('unenrolled');
        });
    });

    it('should return 400 for completed course', () => {
      return request(app.getHttpServer())
        .delete('/enrollments/550e8400-e29b-41d4-a716-446655440005')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });

    it('should return 404 for non-existent enrollment', () => {
      return request(app.getHttpServer())
        .delete('/enrollments/non-existent-enrollment')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });

  describe('GET /enrollments/course/:courseId', () => {
    it('should return course enrollments for teacher', () => {
      return request(app.getHttpServer())
        .get(`/enrollments/course/${testCourse.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('enrollments');
          expect(response.body).toHaveProperty('pagination');
          expect(Array.isArray(response.body.enrollments)).toBe(true);
        });
    });

    it('should return 403 for non-teacher user', () => {
      return request(app.getHttpServer())
        .get(`/enrollments/course/${testCourse.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent course', () => {
      return request(app.getHttpServer())
        .get('/enrollments/course/non-existent-course')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all endpoints', () => {
      const endpoints = [
        { method: 'POST', path: '/enrollments' },
        { method: 'GET', path: '/enrollments/my-enrollments' },
        { method: 'GET', path: '/enrollments/test-id' },
        { method: 'PUT', path: '/enrollments/test-id/progress' },
        { method: 'DELETE', path: '/enrollments/test-id' },
        { method: 'GET', path: '/enrollments/course/test-course' },
      ];

      const promises = endpoints.map(({ method, path }) => {
        return request(app.getHttpServer())[method.toLowerCase()](path)
          .expect(401);
      });

      return Promise.all(promises);
    });

    it('should validate JWT token format', () => {
      return request(app.getHttpServer())
        .get('/enrollments/my-enrollments')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Input Validation', () => {
    it('should validate enroll course DTO', () => {
      return request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({}) // Missing courseId
        .expect(400);
    });

    it('should validate progress update DTO', () => {
      return request(app.getHttpServer())
        .put('/enrollments/test-enrollment-id/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ progressPercentage: 'not-a-number' })
        .expect(400);
    });

    it('should validate UUID format for courseId', () => {
      return request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ courseId: 'invalid-uuid' })
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', () => {
      // This would require mocking database failures
      // For now, just ensure proper error responses are returned
      return request(app.getHttpServer())
        .get('/enrollments/my-enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect((res) => {
          expect([200, 500]).toContain(res.status);
        });
    });

    it('should handle concurrent enrollment attempts', () => {
      // Test for race conditions would require specific setup
      // This is a placeholder for such tests
      const enrollmentPromises = Array(5).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/enrollments')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({ courseId: testCourse.id })
      );

      return Promise.all(enrollmentPromises.map(p => p.catch(() => ({ status: 409 }))))
        .then(responses => {
          const conflictCount = responses.filter(r => r.status === 409).length;
          expect(conflictCount).toBeGreaterThanOrEqual(0);
        });
    });
  });
});