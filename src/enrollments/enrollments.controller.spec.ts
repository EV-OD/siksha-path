import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ResourceGuard } from '../common/guards/resource.guard';

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;
  let service: EnrollmentsService;

  const mockUser = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'student',
  };

  const mockEnrollment = {
    id: 'enrollment-1',
    studentId: 'user-1',
    courseId: 'course-1',
    type: 'free',
    status: 'active',
    amountPaid: 0,
    currency: 'NPR',
    progressPercentage: 25,
    accessGrantedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    course: {
      id: 'course-1',
      title: 'Test Course',
      thumbnailUrl: null,
      teacherName: 'Jane Smith',
    },
  };

  const mockEnrollmentsList = {
    enrollments: [mockEnrollment],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  const mockEnrollmentsService = {
    enrollStudent: jest.fn(),
    getStudentEnrollments: jest.fn(),
    getEnrollmentById: jest.fn(),
    updateProgress: jest.fn(),
    unenrollStudent: jest.fn(),
    getCourseEnrollments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [
        {
          provide: EnrollmentsService,
          useValue: mockEnrollmentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ResourceGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EnrollmentsController>(EnrollmentsController);
    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enrollInCourse', () => {
    it('should enroll a student in a course', async () => {
      const enrollDto = { courseId: 'course-1' };
      const mockRequest = { user: mockUser };

      mockEnrollmentsService.enrollStudent.mockResolvedValue(mockEnrollment);

      const result = await controller.enrollInCourse(mockRequest, enrollDto);

      expect(service.enrollStudent).toHaveBeenCalledWith('user-1', enrollDto);
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe('getMyEnrollments', () => {
    it('should return student enrollments', async () => {
      const mockRequest = { user: mockUser };
      const query = { page: 1, limit: 10, status: 'active' };

      mockEnrollmentsService.getStudentEnrollments.mockResolvedValue(mockEnrollmentsList);

      const result = await controller.getMyEnrollments(mockRequest, 1, 10, 'active');

      expect(service.getStudentEnrollments).toHaveBeenCalledWith('user-1', 1, 10, 'active');
      expect(result).toEqual(mockEnrollmentsList);
    });

    it('should use default pagination values', async () => {
      const mockRequest = { user: mockUser };

      mockEnrollmentsService.getStudentEnrollments.mockResolvedValue(mockEnrollmentsList);

      await controller.getMyEnrollments(mockRequest);

      expect(service.getStudentEnrollments).toHaveBeenCalledWith('user-1', 1, 10, undefined);
    });
  });

  describe('getEnrollment', () => {
    it('should return enrollment by id', async () => {
      mockEnrollmentsService.getEnrollmentById.mockResolvedValue(mockEnrollment);

      const result = await controller.getEnrollment('enrollment-1');

      expect(service.getEnrollmentById).toHaveBeenCalledWith('enrollment-1');
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe('updateProgress', () => {
    it('should update enrollment progress', async () => {
      const updateProgressDto = { progressPercentage: 75 };
      const mockRequest = { user: mockUser };

      mockEnrollmentsService.updateProgress.mockResolvedValue({
        ...mockEnrollment,
        progressPercentage: 75,
      });

      const result = await controller.updateProgress('enrollment-1', mockRequest, updateProgressDto);

      expect(service.updateProgress).toHaveBeenCalledWith('enrollment-1', 'user-1', updateProgressDto);
      expect(result.progressPercentage).toBe(75);
    });
  });

  describe('unenroll', () => {
    it('should unenroll student from course', async () => {
      const mockRequest = { user: mockUser };
      const expectedResult = { message: 'Successfully unenrolled from the course' };

      mockEnrollmentsService.unenrollStudent.mockResolvedValue(expectedResult);

      const result = await controller.unenroll('enrollment-1', mockRequest);

      expect(service.unenrollStudent).toHaveBeenCalledWith('enrollment-1', 'user-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getCourseEnrollments', () => {
    it('should return course enrollments for teacher', async () => {
      const mockRequest = { user: mockUser };

      mockEnrollmentsService.getCourseEnrollments.mockResolvedValue(mockEnrollmentsList);

      const result = await controller.getCourseEnrollments('course-1', mockRequest, 1, 10);

      expect(service.getCourseEnrollments).toHaveBeenCalledWith('course-1', 'user-1', 1, 10, 'John Doe');
      expect(result).toEqual(mockEnrollmentsList);
    });

    it('should construct teacher name from user object', async () => {
      const mockRequest = { user: mockUser };

      mockEnrollmentsService.getCourseEnrollments.mockResolvedValue(mockEnrollmentsList);

      await controller.getCourseEnrollments('course-1', mockRequest);

      expect(service.getCourseEnrollments).toHaveBeenCalledWith('course-1', 'user-1', 1, 10, 'John Doe');
    });
  });
});