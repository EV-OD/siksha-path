import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Course Response DTO
 * Used for returning course data in API responses
 */
export class CourseResponseDto {
  @ApiProperty({
    description: 'Course unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Course title',
    example: 'Advanced Mathematics for Class 12',
  })
  title: string;

  @ApiProperty({
    description: 'Course URL slug',
    example: 'advanced-mathematics-class-12',
  })
  slug: string;

  @ApiProperty({
    description: 'Course description',
    example:
      'Comprehensive mathematics course covering calculus, algebra, and geometry',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Short course description',
    example: 'Master advanced mathematics concepts for Class 12',
  })
  shortDescription?: string;

  @ApiProperty({
    description: 'Course category',
    example: 'mathematics',
  })
  category: string;

  @ApiProperty({
    description: 'Course language',
    example: 'english',
  })
  language: string;

  @ApiProperty({
    description: 'Course difficulty level',
    example: 'intermediate',
  })
  difficulty: string;

  @ApiProperty({
    description: 'Course status',
    example: 'published',
  })
  status: string;

  @ApiProperty({
    description: 'Course price',
    example: '299.99',
  })
  price: string;

  @ApiPropertyOptional({
    description: 'Original price before discount',
    example: '399.99',
  })
  originalPrice?: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'NPR',
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'Total course duration in minutes',
    example: 1200,
  })
  totalDuration?: number;

  @ApiPropertyOptional({
    description: 'Total number of lessons',
    example: 24,
  })
  totalLessons?: number;

  @ApiPropertyOptional({
    description: 'Total number of resources',
    example: 15,
  })
  totalResources?: number;

  @ApiPropertyOptional({
    description: 'Course thumbnail URL',
    example: 'https://example.com/thumbnails/course-123.jpg',
  })
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Video preview URL',
    example: 'https://example.com/previews/course-123.mp4',
  })
  videoPreviewUrl?: string;

  @ApiPropertyOptional({
    description: 'Course tags',
    example: ['mathematics', 'calculus', 'algebra'],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Course prerequisites',
    example: 'Basic knowledge of algebra and trigonometry',
  })
  prerequisites?: string;

  @ApiPropertyOptional({
    description: 'Learning outcomes',
    example: ['Master calculus concepts', 'Solve complex algebraic equations'],
  })
  learningOutcomes?: string[];

  @ApiPropertyOptional({
    description: 'Target audience',
    example: 'Class 12 students preparing for board exams',
  })
  targetAudience?: string;

  @ApiProperty({
    description: 'Number of enrolled students',
    example: 156,
  })
  enrollmentCount: number;

  @ApiProperty({
    description: 'Course rating (0-5)',
    example: '4.5',
  })
  rating: string;

  @ApiProperty({
    description: 'Total number of ratings',
    example: 42,
  })
  totalRatings: number;

  @ApiProperty({
    description: 'Course creation date',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Course last update date',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Course publication date',
    example: '2024-01-16T09:00:00Z',
  })
  publishedAt?: Date;

  @ApiProperty({
    description: 'Course teacher information',
  })
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
}

/**
 * Paginated Course Response DTO
 * Used for paginated course listings
 */
export class PaginatedCourseResponseDto {
  @ApiProperty({
    description: 'Array of courses',
    type: [CourseResponseDto],
  })
  courses: CourseResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Course Detail Response DTO
 * Extended course information for detail view
 */
export class CourseDetailResponseDto extends CourseResponseDto {
  @ApiPropertyOptional({
    description: 'Detailed course content or syllabus',
    example: 'Week 1: Introduction to Calculus...',
  })
  detailedContent?: string;

  @ApiPropertyOptional({
    description: 'Course FAQ',
    example: [
      {
        question: 'What is the duration of this course?',
        answer: 'The course is 20 hours long with 24 lessons.',
      },
    ],
  })
  faq?: Array<{
    question: string;
    answer: string;
  }>;

  @ApiPropertyOptional({
    description: 'Course reviews/testimonials',
    example: [
      {
        studentName: 'Ram Sharma',
        rating: 5,
        comment: 'Excellent course with clear explanations.',
        date: '2024-01-10T10:00:00Z',
      },
    ],
  })
  reviews?: Array<{
    studentName: string;
    rating: number;
    comment: string;
    date: Date;
  }>;
}
