import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  Param, 
  UseGuards, 
  Query, 
  Patch,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/dto/auth.dto';
import { UsersService } from './users.service';
import { UpdateProfileDto, UpdateTeacherProfileDto, ProfileResponseDto } from './dto/profile.dto';

@ApiTags('👥 Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async getMyProfile(@CurrentUser() user: any): Promise<ProfileResponseDto> {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<ProfileResponseDto> {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Put('profile/teacher')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Update teacher profile (teachers only)' })
  @ApiBody({ type: UpdateTeacherProfileDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Teacher profile updated successfully',
    type: ProfileResponseDto,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'teacher@siksha.com',
      role: 'teacher',
      firstName: 'Sita',
      lastName: 'Sharma',
      bio: 'Experienced full-stack developer and educator',
      specialization: 'Full-Stack Web Development',
      experience: '8 years in software development...',
      teacherVerified: 'true',
      isActive: 'true',
      createdAt: '2025-09-27T10:00:00.000Z',
      updatedAt: '2025-09-27T12:00:00.000Z'
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Only teachers can access this endpoint',
    example: {
      message: 'Insufficient permissions',
      error: 'Forbidden',
      statusCode: 403
    }
  })
  async updateTeacherProfile(
    @CurrentUser() user: any,
    @Body() updateTeacherProfileDto: UpdateTeacherProfileDto
  ): Promise<ProfileResponseDto> {
    return this.usersService.updateTeacherProfile(user.id, updateTeacherProfileDto);
  }

  // Admin-only endpoints

  /**
   * Get all users with pagination and filters (admin only)
   */
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get all users (Admin)',
    description: 'Retrieve paginated list of all users with optional filtering by role and search. Admin access required.' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number (default: 1)',
    example: 1 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Items per page (default: 10, max: 50)',
    example: 10 
  })
  @ApiQuery({ 
    name: 'role', 
    required: false, 
    enum: ['student', 'teacher', 'admin'], 
    description: 'Filter users by role' 
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    type: String, 
    description: 'Search in names and emails',
    example: 'john'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully',
    example: {
      users: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'student@siksha.com',
          role: 'student',
          firstName: 'Ramesh',
          lastName: 'Sharma',
          isActive: 'true',
          isVerified: 'false',
          createdAt: '2025-09-27T10:00:00.000Z'
        },
        {
          id: '456e7890-e89b-12d3-a456-426614174000',
          email: 'teacher@siksha.com',
          role: 'teacher',
          firstName: 'Sita',
          lastName: 'Devi',
          specialization: 'Computer Science',
          teacherVerified: 'true',
          isActive: 'true',
          createdAt: '2025-09-26T15:30:00.000Z'
        }
      ],
      total: 247,
      page: 1,
      limit: 10
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin access required',
    example: {
      message: 'Insufficient permissions',
      error: 'Forbidden',
      statusCode: 403
    }
  })
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('role') role?: string,
    @Query('search') search?: string
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    
    return this.usersService.getAllUsers(pageNumber, limitNumber, role, search);
  }

  /**
   * Get specific user profile (admin only)
   */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  async getUserProfile(
    @Param('id', ParseUUIDPipe) userId: string
  ): Promise<ProfileResponseDto> {
    return this.usersService.getProfile(userId);
  }

  /**
   * Update specific user profile (admin only)
   */
  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateUserProfile(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<ProfileResponseDto> {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  /**
   * Deactivate user account (admin only)
   */
  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deactivateUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.usersService.deactivateUser(userId);
  }

  /**
   * Reactivate user account (admin only)
   */
  @Patch(':id/reactivate')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async reactivateUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.usersService.reactivateUser(userId);
  }

  /**
   * Update teacher verification status (admin only)
   */
  @Patch(':id/verify-teacher')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify/Unverify teacher (Admin)',
    description: 'Update teacher verification status. Verified teachers get enhanced platform privileges and credibility badges.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Teacher user ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    description: 'Teacher verification data',
    examples: {
      verify: {
        summary: 'Verify Teacher',
        value: { isVerified: true }
      },
      unverify: {
        summary: 'Remove Verification',
        value: { isVerified: false }
      }
    },
    schema: {
      type: 'object',
      properties: {
        isVerified: {
          type: 'boolean',
          description: 'Whether to verify (true) or unverify (false) the teacher'
        }
      },
      required: ['isVerified']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Teacher verification status updated successfully',
    example: {
      message: 'Teacher verified successfully'
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Teacher not found',
    example: {
      message: 'Teacher not found',
      error: 'Not Found',
      statusCode: 404
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin access required' 
  })
  async verifyTeacher(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() body: { isVerified: boolean }
  ) {
    return this.usersService.updateTeacherVerification(userId, body.isVerified);
  }
}
