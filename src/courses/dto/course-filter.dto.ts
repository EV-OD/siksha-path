import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Course Filter DTO
 * Used for filtering and searching courses
 */
export class CourseFilterDto {
  @ApiPropertyOptional({
    description: 'Search term for course title or description',
    example: 'mathematics',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
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
    example: 'mathematics',
  })
  @IsOptional()
  @IsEnum([
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
  ])
  category?: string;

  @ApiPropertyOptional({
    description: 'Course language',
    enum: ['nepali', 'english', 'hindi', 'mixed'],
    example: 'english',
  })
  @IsOptional()
  @IsEnum(['nepali', 'english', 'hindi', 'mixed'])
  language?: string;

  @ApiPropertyOptional({
    description: 'Course difficulty level',
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'beginner',
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Show only free courses',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isFree?: boolean;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['title', 'price', 'rating', 'enrollmentCount', 'createdAt'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['title', 'price', 'rating', 'enrollmentCount', 'createdAt'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
