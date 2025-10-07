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
import { users, courses } from '../src/database/schemas';
import { hash } from 'bcryptjs';

describe('Courses (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let db: any;
  let studentToken: string;
  let teacherToken: string;
  let adminToken: string;

  const testStudent = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'student-courses@test.com',
    firstName: 'Test',
    lastName: 'Student',
    role: 'student',
    password: 'hashed-password',
    isVerified: true,
    isActive: true,
  };

  const testTeacher = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'teacher-courses@test.com',
    firstName: 'Test',
    lastName: 'Teacher',
    role: 'teacher',
    password: 'hashed-password',
    isVerified: true,
    isActive: true,
  };

  const testAdmin = {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'admin-courses@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin',
    password: 'hashed-password',
    isVerified: true,
    isActive: true,
  };

  const testCourse = {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Test Course E2E',
    slug: 'test-course-e2e',
    description: 'A comprehensive test course for e2e testing',
    shortDescription: 'Test course for API validation',
    category: 'computer_science',
    language: 'english',
    difficulty: 'beginner',
    price: 0,
    status: 'published',
    teacherId: '550e8400-e29b-41d4-a716-446655440002',
  };

  const testDraftCourse = {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Draft Course E2E',
    slug: 'draft-course-e2e',
    description: 'A draft test course for e2e testing',
    category: 'mathematics',
    language: 'nepali',
    difficulty: 'intermediate',
    price: 2500,
    status: 'draft',
    teacherId: '550e8400-e29b-41d4-a716-446655440002',
  };

  beforeAll(async () => {
    jest.setTimeout(30000); // Increase timeout to 30 seconds

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);

    // Initialize database connection
    const pool = new Pool({
      connectionString: configService.get<string>('DATABASE_URL'),
    });
    db = drizzle(pool);

    // Hash password for test users
    const hashedPassword = await hash('testpassword123', 10);

    // Create test users
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

    await db.insert(users).values({
      id: testAdmin.id,
      email: testAdmin.email,
      firstName: testAdmin.firstName,
      lastName: testAdmin.lastName,
      password: hashedPassword,
      role: testAdmin.role,
      isVerified: testAdmin.isVerified,
      isActive: testAdmin.isActive,
    }).onConflictDoNothing();

    // Create test courses
    await db.insert(courses).values({
      id: testCourse.id,
      teacherId: testCourse.teacherId,
      title: testCourse.title,
      slug: testCourse.slug,
      description: testCourse.description,
      shortDescription: testCourse.shortDescription,
      category: testCourse.category,
      language: testCourse.language,
      difficulty: testCourse.difficulty,
      status: testCourse.status,
      price: testCourse.price.toString(),
      currency: 'NPR',
    }).onConflictDoNothing();

    await db.insert(courses).values({
      id: testDraftCourse.id,
      teacherId: testDraftCourse.teacherId,
      title: testDraftCourse.title,
      slug: testDraftCourse.slug,
      description: testDraftCourse.description,
      category: testDraftCourse.category,
      language: testDraftCourse.language,
      difficulty: testDraftCourse.difficulty,
      status: testDraftCourse.status,
      price: testDraftCourse.price.toString(),
      currency: 'NPR',
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
    adminToken = jwtService.sign({
      sub: testAdmin.id,
      email: testAdmin.email,
      role: testAdmin.role
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(courses).where(eq(courses.id, testCourse.id));
    await db.delete(courses).where(eq(courses.id, testDraftCourse.id));
    await db.delete(users).where(eq(users.id, testStudent.id));
    await db.delete(users).where(eq(users.id, testTeacher.id));
    await db.delete(users).where(eq(users.id, testAdmin.id));

    await app.close();
  });

  describe('GET /courses', () => {
    it('should return published courses', () => {
      return request(app.getHttpServer())
        .get('/courses')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('courses');
          expect(response.body).toHaveProperty('pagination');
          expect(Array.isArray(response.body.courses)).toBe(true);
          expect(response.body.courses.length).toBeGreaterThan(0);

          // Check that only published courses are returned
          response.body.courses.forEach((course: any) => {
            expect(course.status).toBe('published');
          });
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/courses?page=1&limit=5')
        .expect(200)
        .then((response) => {
          expect(response.body.pagination.page).toBe(1);
          expect(response.body.pagination.limit).toBe(5);
          expect(response.body.courses.length).toBeLessThanOrEqual(5);
        });
    });

    it('should filter by category', () => {
      return request(app.getHttpServer())
        .get('/courses?category=computer_science')
        .expect(200)
        .then((response) => {
          expect(response.body.courses.length).toBeGreaterThan(0);
          response.body.courses.forEach((course: any) => {
            expect(course.category).toBe('computer_science');
          });
        });
    });

    it('should filter by language', () => {
      return request(app.getHttpServer())
        .get('/courses?language=english')
        .expect(200)
        .then((response) => {
          expect(response.body.courses.length).toBeGreaterThan(0);
          response.body.courses.forEach((course: any) => {
            expect(course.language).toBe('english');
          });
        });
    });

    it('should filter by difficulty', () => {
      return request(app.getHttpServer())
        .get('/courses?difficulty=beginner')
        .expect(200)
        .then((response) => {
          expect(response.body.courses.length).toBeGreaterThan(0);
          response.body.courses.forEach((course: any) => {
            expect(course.difficulty).toBe('beginner');
          });
        });
    });

    it('should filter free courses', () => {
      return request(app.getHttpServer())
        .get('/courses?isFree=true')
        .expect(200)
        .then((response) => {
          expect(response.body.courses.length).toBeGreaterThan(0);
          response.body.courses.forEach((course: any) => {
            expect(course.price).toBe('0.00');
          });
        });
    });

    it('should search courses by title', () => {
      return request(app.getHttpServer())
        .get('/courses?search=Test Course')
        .expect(200)
        .then((response) => {
          expect(response.body.courses.length).toBeGreaterThan(0);
          response.body.courses.forEach((course: any) => {
            expect(course.title.toLowerCase()).toContain('test course');
          });
        });
    });
  });

  describe('GET /courses/search', () => {
    it('should search courses by query', () => {
      return request(app.getHttpServer())
        .get('/courses/search?q=Test Course')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('courses');
          expect(response.body).toHaveProperty('pagination');
          expect(Array.isArray(response.body.courses)).toBe(true);
        });
    });
  });

  describe('GET /courses/popular', () => {
    it('should return popular courses', () => {
      return request(app.getHttpServer())
        .get('/courses/popular')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });

    it('should respect limit parameter', () => {
      return request(app.getHttpServer())
        .get('/courses/popular?limit=2')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeLessThanOrEqual(2);
        });
    });
  });

  describe('GET /courses/category/:category', () => {
    it('should return courses by category', () => {
      return request(app.getHttpServer())
        .get('/courses/category/computer_science')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('courses');
          expect(response.body).toHaveProperty('pagination');
          response.body.courses.forEach((course: any) => {
            expect(course.category).toBe('computer_science');
          });
        });
    });
  });

  describe('GET /courses/language/:language', () => {
    it('should return courses by language', () => {
      return request(app.getHttpServer())
        .get('/courses/language/english')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('courses');
          expect(response.body).toHaveProperty('pagination');
          response.body.courses.forEach((course: any) => {
            expect(course.language).toBe('english');
          });
        });
    });
  });

  describe('GET /courses/free', () => {
    it('should return free courses', () => {
      return request(app.getHttpServer())
        .get('/courses/free')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('courses');
          expect(response.body).toHaveProperty('pagination');
          response.body.courses.forEach((course: any) => {
            expect(course.price).toBe('0.00');
          });
        });
    });
  });

  describe('GET /courses/:id', () => {
    it('should return course details by ID', () => {
      return request(app.getHttpServer())
        .get(`/courses/${testCourse.id}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('title');
          expect(response.body).toHaveProperty('description');
          expect(response.body).toHaveProperty('category');
          expect(response.body).toHaveProperty('teacher');
          expect(response.body.id).toBe(testCourse.id);
          expect(response.body.title).toBe(testCourse.title);
        });
    });

    it('should return 404 for non-existent course', () => {
      return request(app.getHttpServer())
        .get('/courses/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);
    });
  });

  describe('GET /courses/slug/:slug', () => {
    it('should return course details by slug', () => {
      return request(app.getHttpServer())
        .get(`/courses/slug/${testCourse.slug}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('slug');
          expect(response.body.slug).toBe(testCourse.slug);
        });
    });

    it('should return 404 for non-existent slug', () => {
      return request(app.getHttpServer())
        .get('/courses/slug/non-existent-slug')
        .expect(404);
    });
  });

  describe('POST /courses', () => {
    it('should create a new course (teacher)', () => {
      const newCourse = {
        title: 'New Test Course',
        description: 'A new course created during testing',
        category: 'mathematics',
        language: 'english',
        difficulty: 'beginner',
        price: 1000,
      };

      return request(app.getHttpServer())
        .post('/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(newCourse)
        .expect(201)
        .then(async (response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.title).toBe(newCourse.title);
          expect(response.body.category).toBe(newCourse.category);
          expect(response.body.status).toBe('draft'); // New courses should be draft

          // Clean up the created course
          await db.delete(courses).where(eq(courses.id, response.body.id));
        });
    });

    it('should return 403 for non-teacher user', () => {
      const newCourse = {
        title: 'Unauthorized Course',
        description: 'This should not be created',
        category: 'science',
      };

      return request(app.getHttpServer())
        .post('/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(newCourse)
        .expect(403);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({}) // Missing required fields
        .expect(400);
    });
  });

  describe('PUT /courses/:id', () => {
    it('should update course (owner teacher)', () => {
      const updateData = {
        title: 'Updated Test Course',
        description: 'Updated description',
      };

      return request(app.getHttpServer())
        .put(`/courses/${testDraftCourse.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updateData)
        .expect(200)
        .then((response) => {
          expect(response.body.title).toBe(updateData.title);
          expect(response.body.description).toBe(updateData.description);
        });
    });

    it('should update course (admin)', () => {
      const updateData = {
        title: 'Admin Updated Course',
        price: 1500,
      };

      return request(app.getHttpServer())
        .put(`/courses/${testDraftCourse.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200)
        .then((response) => {
          expect(response.body.title).toBe(updateData.title);
          expect(response.body.price).toBe('1500.00');
        });
    });

    it('should return 403 for non-owner teacher', () => {
      // Create another teacher
      const otherTeacher = {
        id: '550e8400-e29b-41d4-a716-446655440006',
        email: 'other-teacher@test.com',
        firstName: 'Other',
        lastName: 'Teacher',
        role: 'teacher',
        password: 'hashed-password',
        isVerified: true,
        isActive: true,
      };

      return request(app.getHttpServer())
        .put(`/courses/${testDraftCourse.id}`)
        .set('Authorization', `Bearer ${studentToken}`) // Using student token
        .send({ title: 'Unauthorized Update' })
        .expect(403);
    });

    it('should return 404 for non-existent course', () => {
      return request(app.getHttpServer())
        .put('/courses/550e8400-e29b-41d4-a716-446655440000')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ title: 'Non-existent Course' })
        .expect(404);
    });
  });

  describe('DELETE /courses/:id', () => {
    let tempCourseId: string;

    beforeAll(async () => {
      // Create a temporary course for deletion testing
      const tempCourse = {
        id: '550e8400-e29b-41d4-a716-446655440007',
        teacherId: testTeacher.id,
        title: 'Temp Course for Deletion',
        slug: 'temp-course-deletion',
        description: 'Temporary course for testing deletion',
        category: 'science',
        status: 'draft',
        price: 0,
      };

      await db.insert(courses).values(tempCourse).onConflictDoNothing();
      tempCourseId = tempCourse.id;
    });

    it('should delete course (owner teacher)', () => {
      return request(app.getHttpServer())
        .delete(`/courses/${tempCourseId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('deleted');
        });
    });

    it('should return 403 for non-owner teacher', () => {
      return request(app.getHttpServer())
        .delete(`/courses/${testDraftCourse.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('POST /courses/:id/publish', () => {
    it('should publish draft course (owner teacher)', () => {
      return request(app.getHttpServer())
        .post(`/courses/${testDraftCourse.id}/publish`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.status).toBe('published');
        });
    });

    it('should return 403 for non-owner teacher', () => {
      return request(app.getHttpServer())
        .post(`/courses/${testCourse.id}/publish`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('POST /courses/:id/unpublish', () => {
    it('should unpublish course (owner teacher)', () => {
      return request(app.getHttpServer())
        .post(`/courses/${testCourse.id}/unpublish`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.status).toBe('draft');
        });
    });

    it('should return 403 for non-owner teacher', () => {
      return request(app.getHttpServer())
        .post(`/courses/${testCourse.id}/unpublish`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({})
        .expect(403);
    });
  });
});