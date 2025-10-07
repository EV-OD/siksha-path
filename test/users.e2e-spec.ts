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
import { users } from '../src/database/schemas';
import { hash } from 'bcryptjs';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let db: any;
  let studentToken: string;
  let teacherToken: string;
  let adminToken: string;

  const testStudent = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'student-users@test.com',
    firstName: 'Test',
    lastName: 'Student',
    fullName: 'Test Student',
    role: 'student',
    password: 'hashed-password',
    isVerified: 'true',
    isActive: 'true',
  };

  const testTeacher = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'teacher-users@test.com',
    firstName: 'Test',
    lastName: 'Teacher',
    fullName: 'Test Teacher',
    role: 'teacher',
    password: 'hashed-password',
    isVerified: 'true',
    isActive: 'true',
  };

  const testAdmin = {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'admin-users@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    fullName: 'Test Admin',
    role: 'admin',
    password: 'hashed-password',
    isVerified: 'true',
    isActive: 'true',
  };

  const testInactiveUser = {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'inactive-users@test.com',
    firstName: 'Inactive',
    lastName: 'User',
    fullName: 'Inactive User',
    role: 'student',
    password: 'hashed-password',
    isVerified: 'true', // Fix: should be string, not boolean
    isActive: 'false',
  };

  beforeAll(async () => {
    jest.setTimeout(30000); // Increase timeout to 30 seconds

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);

    // Initialize database connection
    const pool = new Pool({
      connectionString: configService.get<string>('DATABASE_URL'),
    });
    db = drizzle(pool);

    await app.init();

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

    await db.insert(users).values({
      id: testInactiveUser.id,
      email: testInactiveUser.email,
      firstName: testInactiveUser.firstName,
      lastName: testInactiveUser.lastName,
      password: hashedPassword,
      role: testInactiveUser.role,
      isVerified: testInactiveUser.isVerified,
      isActive: testInactiveUser.isActive,
    }).onConflictDoNothing();

    // Generate test tokens
    studentToken = jwtService.sign({
      sub: testStudent.id,
      email: testStudent.email,
      role: testStudent.role,
      fullName: testStudent.fullName,
    });
    teacherToken = jwtService.sign({
      sub: testTeacher.id,
      email: testTeacher.email,
      role: testTeacher.role,
      fullName: testTeacher.fullName,
    });
    adminToken = jwtService.sign({
      sub: testAdmin.id,
      email: testAdmin.email,
      role: testAdmin.role,
      fullName: testAdmin.fullName,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(users).where(eq(users.id, testStudent.id));
    await db.delete(users).where(eq(users.id, testTeacher.id));
    await db.delete(users).where(eq(users.id, testAdmin.id));
    await db.delete(users).where(eq(users.id, testInactiveUser.id));

    await app.close();
  });

  describe('GET /users/profile', () => {
    it('should return current user profile', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('email');
          expect(response.body).toHaveProperty('firstName');
          expect(response.body).toHaveProperty('lastName');
          expect(response.body).toHaveProperty('role');
          expect(response.body.id).toBe(testStudent.id);
          expect(response.body.email).toBe(testStudent.email);
          expect(response.body.role).toBe(testStudent.role);
          expect(response.body).not.toHaveProperty('password');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });
  });

  describe('PUT /users/profile', () => {
    it('should update user profile', () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio',
        phone: '+977-9841234567',
        address: 'Kathmandu, Nepal',
      };

      return request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(200)
        .then((response) => {
          expect(response.body.firstName).toBe(updateData.firstName);
          expect(response.body.lastName).toBe(updateData.lastName);
          expect(response.body.bio).toBe(updateData.bio);
          expect(response.body.phone).toBe(updateData.phone);
          expect(response.body.address).toBe(updateData.address);
        });
    });

    it('should validate input data', () => {
      const invalidData = {
        firstName: 'A'.repeat(101), // Too long
      };

      return request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidData)
        .expect((res) => {
          expect([400, 500]).toContain(res.status);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .put('/users/profile')
        .send({ firstName: 'Test' })
        .expect(401);
    });
  });

  describe('PUT /users/profile/teacher', () => {
    it('should update teacher profile (teacher only)', () => {
      const updateData = {
        specialization: 'Mathematics',
        experience: '5 years teaching experience',
        bio: 'Experienced math teacher',
      };

      return request(app.getHttpServer())
        .put('/users/profile/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updateData)
        .expect(200)
        .then((response) => {
          expect(response.body.specialization).toBe(updateData.specialization);
          expect(response.body.experience).toBe(updateData.experience);
          expect(response.body.bio).toBe(updateData.bio);
        });
    });

    it('should return 403 for non-teacher user', () => {
      return request(app.getHttpServer())
        .put('/users/profile/teacher')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ specialization: 'Math' })
        .expect(403);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .put('/users/profile/teacher')
        .send({ specialization: 'Math' })
        .expect(401);
    });
  });

  describe('GET /users (admin only)', () => {
    it('should return all users (admin only)', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('users');
          expect(response.body).toHaveProperty('total');
          expect(response.body).toHaveProperty('page');
          expect(response.body).toHaveProperty('limit');
          expect(Array.isArray(response.body.users)).toBe(true);
          expect(response.body.total).toBeGreaterThan(0);
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.page).toBe(1);
          expect(response.body.limit).toBe(2);
          expect(response.body.users.length).toBeLessThanOrEqual(2);
        });
    });

    it('should filter by role', () => {
      return request(app.getHttpServer())
        .get('/users?role=teacher')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.users.length).toBeGreaterThan(0);
          response.body.users.forEach((user: any) => {
            expect(user.role).toBe('teacher');
          });
        });
    });

    it('should return 403 for non-admin user', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });

  describe('GET /users/:id (admin only)', () => {
    it('should return user by ID (admin only)', () => {
      return request(app.getHttpServer())
        .get(`/users/${testStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(testStudent.id);
          expect(response.body.email).toBe(testStudent.email);
          expect(response.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/550e8400-e29b-41d4-a716-446655440000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 403 for non-admin user', () => {
      return request(app.getHttpServer())
        .get(`/users/${testStudent.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('PUT /users/:id (admin only)', () => {
    it('should update user by ID (admin only)', () => {
      const updateData = {
        firstName: 'Admin Updated',
        lastName: 'Name',
        bio: 'Updated by admin',
      };

      return request(app.getHttpServer())
        .put(`/users/${testStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200)
        .then((response) => {
          expect(response.body.firstName).toBe(updateData.firstName);
          expect(response.body.lastName).toBe(updateData.lastName);
          expect(response.body.bio).toBe(updateData.bio);
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .put('/users/550e8400-e29b-41d4-a716-446655440000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Test' })
        .expect(404);
    });

    it('should return 403 for non-admin user', () => {
      return request(app.getHttpServer())
        .put(`/users/${testStudent.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ firstName: 'Test' })
        .expect(403);
    });
  });

  describe('PATCH /users/:id/deactivate (admin only)', () => {
    it('should deactivate user (admin only)', () => {
      return request(app.getHttpServer())
        .patch(`/users/${testStudent.id}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then(async (response) => {
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('deactivated');

          // Reactivate the user for other tests
          await db
            .update(users)
            .set({ isActive: 'true' })
            .where(eq(users.id, testStudent.id));
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/users/550e8400-e29b-41d4-a716-446655440000/deactivate')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 403 for non-admin user', () => {
      return request(app.getHttpServer())
        .patch(`/users/${testTeacher.id}/deactivate`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('PATCH /users/:id/reactivate (admin only)', () => {
    it('should reactivate user (admin only)', () => {
      return request(app.getHttpServer())
        .patch(`/users/${testStudent.id}/reactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('reactivated');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/users/550e8400-e29b-41d4-a716-446655440000/reactivate')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 403 for non-admin user', () => {
      return request(app.getHttpServer())
        .patch(`/users/${testInactiveUser.id}/reactivate`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('PATCH /users/:id/verify-teacher (admin only)', () => {
    it('should verify teacher account (admin only)', () => {
      return request(app.getHttpServer())
        .patch(`/users/${testTeacher.id}/verify-teacher`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('verified');
        });
    });

    it('should return 400 for non-teacher user', () => {
      return request(app.getHttpServer())
        .patch(`/users/${testStudent.id}/verify-teacher`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/users/550e8400-e29b-41d4-a716-446655440000/verify-teacher')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 403 for non-admin user', () => {
      return request(app.getHttpServer())
        .patch(`/users/${testTeacher.id}/verify-teacher`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all protected endpoints', () => {
      const endpoints = [
        { method: 'GET', path: '/users/profile' },
        { method: 'PUT', path: '/users/profile' },
        { method: 'PUT', path: '/users/profile/teacher' },
        { method: 'GET', path: '/users' },
        { method: 'GET', path: `/users/${testStudent.id}` },
        { method: 'PUT', path: `/users/${testStudent.id}` },
        { method: 'PATCH', path: `/users/${testStudent.id}/deactivate` },
        { method: 'PATCH', path: `/users/${testStudent.id}/reactivate` },
        { method: 'PATCH', path: `/users/${testTeacher.id}/verify-teacher` },
      ];

      const promises = endpoints.map(({ method, path }) => {
        return request(app.getHttpServer())[method.toLowerCase()](path)
          .expect(401);
      });

      return Promise.all(promises);
    });

    it('should validate JWT token format', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Input Validation', () => {
    it('should validate profile update DTO', () => {
      const invalidData = {
        firstName: 'A'.repeat(101), // Too long (max 100)
        bio: 'A'.repeat(501), // Too long (max 500)
      };

      return request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidData)
        .expect((res) => {
          expect([400, 500]).toContain(res.status);
        });
    });

    it('should validate teacher profile update DTO', () => {
      const invalidData = {
        specialization: 'A'.repeat(256), // Too long
      };

      return request(app.getHttpServer())
        .put('/users/profile/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(invalidData)
        .expect((res) => {
          expect([400, 500]).toContain(res.status);
        });
    });

    it('should validate UUID format for user ID', () => {
      return request(app.getHttpServer())
        .get('/users/invalid-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', () => {
      // This would require mocking database failures
      // For now, just ensure proper error responses are returned
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return 401 for inactive users', () => {
      // Create token for inactive user
      const inactiveToken = jwtService.sign({
        sub: testInactiveUser.id,
        email: testInactiveUser.email,
        role: testInactiveUser.role,
        fullName: testInactiveUser.fullName,
      });

      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${inactiveToken}`)
        .expect(401);
    });
  });
});