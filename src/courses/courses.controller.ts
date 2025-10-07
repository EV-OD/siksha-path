import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseFilterDto } from './dto/course-filter.dto';
import {
  CourseResponseDto,
  PaginatedCourseResponseDto,
  CourseDetailResponseDto,
} from './dto/course-response.dto';
import { Public } from '../auth/decorators/auth.decorators';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../auth/dto/auth.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResourceGuard } from '../common/guards/resource.guard';
import { OwnResource, PublicResource } from '../common/decorators/resource.decorators';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(ResourceGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * Get all courses with filtering, searching, and pagination
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'List all available courses',
    description:
      'Get a paginated list of published courses with optional filtering and searching',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved courses',
    type: PaginatedCourseResponseDto,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for course title or description',
    example: 'mathematics',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by course category',
    enum: [
      'mathematics',
      'science',
      'english',
      'nepali',
      'social_studies',
      'computer_science',
      'engineering',
      'medical',
      'business',
      'arts',
      'language',
      'other',
    ],
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Filter by course language',
    enum: ['nepali', 'english', 'hindi', 'mixed'],
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    description: 'Filter by difficulty level',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
    type: Number,
  })
  @ApiQuery({
    name: 'isFree',
    required: false,
    description: 'Show only free courses',
    type: Boolean,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field',
    enum: ['title', 'price', 'rating', 'enrollmentCount', 'createdAt'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filterDto: CourseFilterDto,
  ): Promise<PaginatedCourseResponseDto> {
    return this.coursesService.findAll(filterDto);
  }

  /**
   * Search courses by title or description
   */
  @Get('search')
  @Public()
  @ApiOperation({
    summary: 'Search courses',
    description: 'Search courses by title, description, or tags',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved search results',
    type: PaginatedCourseResponseDto,
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query',
    example: 'advanced mathematics',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  async search(
    @Query('q') searchQuery: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedCourseResponseDto> {
    const filterDto = new CourseFilterDto();
    filterDto.search = searchQuery;
    filterDto.page = page || 1;
    filterDto.limit = limit || 10;

    return this.coursesService.findAll(filterDto);
  }

  /**
   * Get popular courses
   */
  @Get('popular')
  @Public()
  @ApiOperation({
    summary: 'Get popular courses',
    description: 'Get courses sorted by enrollment count and rating',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved popular courses',
    type: [CourseResponseDto],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of courses to return',
    type: Number,
    example: 10,
  })
  async findPopular(
    @Query('limit') limit?: number,
  ): Promise<CourseResponseDto[]> {
    return this.coursesService.findPopular(limit);
  }

  /**
   * Filter courses by category
   */
  @Get('category/:category')
  @Public()
  @ApiOperation({
    summary: 'Get courses by category',
    description: 'Get all courses in a specific category',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved courses by category',
    type: PaginatedCourseResponseDto,
  })
  @ApiParam({
    name: 'category',
    description: 'Course category',
    enum: [
      'mathematics',
      'science',
      'english',
      'nepali',
      'social_studies',
      'computer_science',
      'engineering',
      'medical',
      'business',
      'arts',
      'language',
      'other',
    ],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  async findByCategory(
    @Param('category') category: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedCourseResponseDto> {
    const filterDto = new CourseFilterDto();
    filterDto.category = category;
    filterDto.page = page || 1;
    filterDto.limit = limit || 10;

    return this.coursesService.findAll(filterDto);
  }

  /**
   * Filter courses by language
   */
  @Get('language/:language')
  @Public()
  @ApiOperation({
    summary: 'Get courses by language',
    description: 'Get all courses in a specific language',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved courses by language',
    type: PaginatedCourseResponseDto,
  })
  @ApiParam({
    name: 'language',
    description: 'Course language',
    enum: ['nepali', 'english', 'hindi', 'mixed'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  async findByLanguage(
    @Param('language') language: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedCourseResponseDto> {
    const filterDto = new CourseFilterDto();
    filterDto.language = language;
    filterDto.page = page || 1;
    filterDto.limit = limit || 10;

    return this.coursesService.findAll(filterDto);
  }

  /**
   * Get free courses
   */
  @Get('free')
  @Public()
  @ApiOperation({
    summary: 'Get free courses',
    description: 'Get all free courses (price = 0)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved free courses',
    type: PaginatedCourseResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  async findFree(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedCourseResponseDto> {
    const filterDto = new CourseFilterDto();
    filterDto.isFree = true;
    filterDto.page = page || 1;
    filterDto.limit = limit || 10;

    return this.coursesService.findAll(filterDto);
  }

  /**
   * Get course details by ID
   */
  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get course details by ID',
    description: 'Get detailed information about a specific course',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved course details',
    type: CourseDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Course UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourseDetailResponseDto> {
    return this.coursesService.findOne(id);
  }

  /**
   * Get course details by slug
   */
  @Get('slug/:slug')
  @Public()
  @ApiOperation({
    summary: 'Get course details by slug',
    description:
      'Get detailed information about a specific course using its slug',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved course details',
    type: CourseDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiParam({
    name: 'slug',
    description: 'Course slug',
    example: 'advanced-mathematics-class-12',
  })
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<CourseDetailResponseDto> {
    return this.coursesService.findBySlug(slug);
  }

  /**
   * Create a new course (Teachers only)
   */
  @Post()
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new course',
    description: 'Create a new course as a teacher. Only users with teacher role can create courses.',
  })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teachers only',
  })
  async create(
    @Body(ValidationPipe) createCourseDto: CreateCourseDto,
    @CurrentUser() user: any,
  ): Promise<CourseDetailResponseDto> {
    return this.coursesService.create(createCourseDto, user.id);
  }

  /**
   * Update course (Teacher owner or Admin only)
   */
  @Put(':id')
  @OwnResource()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update course',
    description: 'Update course information. Only the course teacher or admin can update.',
  })
  @ApiParam({
    name: 'id',
    description: 'Course UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseDetailResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the course owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: any,
  ): Promise<CourseDetailResponseDto> {
    return this.coursesService.update(id, updateCourseDto, user.id);
  }

  /**
   * Delete course (Teacher owner or Admin only)
   */
  @Delete(':id')
  @OwnResource()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete course',
    description: 'Delete a course. Only the course teacher or admin can delete. Course must have zero enrollments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Course UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Course deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the course owner or course has enrollments',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    return this.coursesService.delete(id, user.id);
  }

  /**
   * Publish course (Teacher owner or Admin only)
   */
  @Post(':id/publish')
  @OwnResource()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Publish course',
    description: 'Publish a draft course to make it visible to students. Only the course teacher or admin can publish.',
  })
  @ApiParam({
    name: 'id',
    description: 'Course UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Course published successfully',
    type: CourseDetailResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the course owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<CourseDetailResponseDto> {
    return this.coursesService.publish(id, user.id);
  }

  /**
   * Unpublish course (Teacher owner or Admin only)
   */
  @Post(':id/unpublish')
  @OwnResource()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Unpublish course',
    description: 'Unpublish a course to hide it from students. Only the course teacher or admin can unpublish.',
  })
  @ApiParam({
    name: 'id',
    description: 'Course UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Course unpublished successfully',
    type: CourseDetailResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the course owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async unpublish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<CourseDetailResponseDto> {
    return this.coursesService.unpublish(id, user.id);
  }
}
