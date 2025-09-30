import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseFilterDto } from './dto/course-filter.dto';
import {
  CourseResponseDto,
  PaginatedCourseResponseDto,
  CourseDetailResponseDto,
} from './dto/course-response.dto';
import { Public } from '../auth/decorators/auth.decorators';

@ApiTags('Courses')
@Controller('courses')
@Public() // Make all course browsing endpoints public
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * Get all courses with filtering, searching, and pagination
   */
  @Get()
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
}
