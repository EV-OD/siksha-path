import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';

// Mock the database completely
jest.mock('drizzle-orm/node-postgres', () => ({
  drizzle: jest.fn(() => ({})),
}));

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({})),
}));

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let mockDb: any;

  beforeEach(async () => {
    // Mock all database operations
    mockDb = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Create a mock service instance with mocked db
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'DATABASE_URL') return 'postgresql://test:test@localhost:5432/test';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    // Replace the db instance with our mock
    (service as any).db = mockDb;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enrollStudent', () => {
    it('should successfully enroll a student in a free course', async () => {
      // Mock course exists and is published
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              id: 'course-1',
              title: 'Test Course',
              price: 0,
              status: 'published',
              teacherId: 'teacher-1',
            }]),
          }),
        }),
      });

      // Mock no existing enrollment
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Mock enrollment creation
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{
            id: 'enrollment-1',
            studentId: 'user-1',
            courseId: 'course-1',
            type: 'free',
            status: 'active',
          }]),
        }),
      });

      // Mock course enrollment count update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      // Mock getEnrollmentById
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([{
                  id: 'enrollment-1',
                  studentId: 'user-1',
                  courseId: 'course-1',
                  type: 'free',
                  status: 'active',
                  courseTitle: 'Test Course',
                  teacherFirstName: 'Jane',
                  teacherLastName: 'Smith',
                }]),
              }),
            }),
          }),
        }),
      });

      const result = await service.enrollStudent('user-1', { courseId: 'course-1' });

      expect(result).toBeDefined();
      expect(result.studentId).toBe('user-1');
      expect(result.courseId).toBe('course-1');
      expect(result.status).toBe('active');
      expect(result.type).toBe('free');
    });

    it('should throw NotFoundException if course does not exist', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.enrollStudent('user-1', { courseId: 'course-1' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if student is already enrolled', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{
                id: 'course-1',
                price: 0,
                status: 'published',
              }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{
                id: 'enrollment-1',
                status: 'active',
              }]),
            }),
          }),
        });

      await expect(service.enrollStudent('user-1', { courseId: 'course-1' }))
        .rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for paid courses', async () => {
      // Mock course lookup - paid course
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              id: 'course-2',
              price: 100,
              status: 'published',
            }]),
          }),
        }),
      });

      // Mock existing enrollment check - no existing enrollment
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.enrollStudent('user-1', { courseId: 'course-2' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getStudentEnrollments', () => {
    it('should return paginated enrollments for a student', async () => {
      // Mock total count
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ count: 1 }]),
        }),
      });

      // Mock enrollments data
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    offset: jest.fn().mockResolvedValue([{
                      id: 'enrollment-1',
                      studentId: 'user-1',
                      courseId: 'course-1',
                      status: 'active',
                      type: 'free',
                      progressPercentage: '50.00',
                      courseTitle: 'Test Course',
                      teacherFirstName: 'Jane',
                      teacherLastName: 'Smith',
                    }]),
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await service.getStudentEnrollments('user-1', 1, 10);

      expect(result).toBeDefined();
      expect(result.enrollments).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('updateProgress', () => {
    it('should update enrollment progress', async () => {
      // Mock enrollment exists
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              id: 'enrollment-1',
              status: 'active',
            }]),
          }),
        }),
      });

      // Mock update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      // Mock getEnrollmentById
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([{
                  id: 'enrollment-1',
                  progressPercentage: '75.00',
                  courseTitle: 'Test Course',
                  teacherFirstName: 'Jane',
                  teacherLastName: 'Smith',
                }]),
              }),
            }),
          }),
        }),
      });

      const result = await service.updateProgress('enrollment-1', 'user-1', { progressPercentage: 75 });

      expect(result.progressPercentage).toBe(75);
    });

    it('should throw NotFoundException if enrollment does not exist', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.updateProgress('nonexistent-id', 'user-1', { progressPercentage: 50 }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('unenrollStudent', () => {
    it('should successfully unenroll a student', async () => {
      // Mock enrollment exists
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              id: 'enrollment-1',
              status: 'active',
              courseId: 'course-1',
            }]),
          }),
        }),
      });

      // Mock updates
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await service.unenrollStudent('enrollment-1', 'user-1');

      expect(result.message).toBe('Successfully unenrolled from the course');
    });

    it('should throw BadRequestException if course is completed', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              id: 'enrollment-1',
              status: 'completed',
            }]),
          }),
        }),
      });

      await expect(service.unenrollStudent('enrollment-1', 'user-1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('isStudentEnrolled', () => {
    it('should return true if student is enrolled', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              id: 'enrollment-1',
            }]),
          }),
        }),
      });

      const result = await service.isStudentEnrolled('user-1', 'course-1');

      expect(result).toBe(true);
    });

    it('should return false if student is not enrolled', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await service.isStudentEnrolled('user-1', 'course-1');

      expect(result).toBe(false);
    });
  });
});