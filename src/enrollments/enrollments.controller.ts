import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ResourceGuard } from '../common/guards/resource.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { OwnResource } from '../common/decorators/resource.decorators';
import { EnrollmentsService } from './enrollments.service';
import {
  EnrollInCourseDto,
  EnrollmentResponseDto,
  EnrollmentListResponseDto,
  UpdateProgressDto,
} from './dto/enrollment.dto';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiResponse({
    status: 201,
    description: 'Successfully enrolled in the course',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'Already enrolled' })
  async enrollInCourse(
    @Request() req,
    @Body() enrollDto: EnrollInCourseDto,
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.enrollStudent(req.user.id, enrollDto);
  }

  @Get('my-enrollments')
  @ApiOperation({ summary: 'Get my enrollments' })
  @ApiResponse({
    status: 200,
    description: 'List of student enrollments',
    type: EnrollmentListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'expired', 'cancelled', 'completed'],
  })
  async getMyEnrollments(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: 'active' | 'inactive' | 'expired' | 'cancelled' | 'completed',
  ): Promise<EnrollmentListResponseDto> {
    return this.enrollmentsService.getStudentEnrollments(
      req.user.id,
      page,
      limit,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment details',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async getEnrollment(
    @Param('id') id: string,
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.getEnrollmentById(id);
  }

  @Put(':id/progress')
  @ApiOperation({ summary: 'Update enrollment progress' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async updateProgress(
    @Param('id') id: string,
    @Request() req,
    @Body() updateProgressDto: UpdateProgressDto,
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.updateProgress(
      id,
      req.user.id,
      updateProgressDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Unenroll from a course' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully unenrolled',
  })
  @ApiResponse({ status: 400, description: 'Cannot unenroll from completed course' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @HttpCode(HttpStatus.OK)
  async unenroll(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    return this.enrollmentsService.unenrollStudent(id, req.user.id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get course enrollments (for teachers)' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'List of course enrollments',
    type: EnrollmentListResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - not course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCourseEnrollments(
    @Param('courseId') courseId: string,
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<EnrollmentListResponseDto> {
    const teacherName = `${req.user.firstName} ${req.user.lastName}`;
    return this.enrollmentsService.getCourseEnrollments(
      courseId,
      req.user.id,
      page,
      limit,
      teacherName,
    );
  }
}