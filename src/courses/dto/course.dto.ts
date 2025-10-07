import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { courseCategoryEnum, courseDifficultyEnum, courseLanguageEnum } from '../../database/schemas/courses.schema';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Advanced Mathematics for Class 12',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Course description',
    example: 'Comprehensive mathematics course covering calculus, algebra, and geometry for grade 12 students',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional({
    description: 'Short description for course cards',
    example: 'Complete math preparation for SLC examinations',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiProperty({
    description: 'Course category',
    enum: courseCategoryEnum.enumValues,
    example: 'mathematics',
  })
  @IsEnum(courseCategoryEnum.enumValues)
  category: string;

  @ApiPropertyOptional({
    description: 'Course language',
    enum: courseLanguageEnum.enumValues,
    example: 'nepali',
  })
  @IsOptional()
  @IsEnum(courseLanguageEnum.enumValues)
  language?: string;

  @ApiPropertyOptional({
    description: 'Course difficulty level',
    enum: courseDifficultyEnum.enumValues,
    example: 'intermediate',
  })
  @IsOptional()
  @IsEnum(courseDifficultyEnum.enumValues)
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'Course price in NPR (0 for free courses)',
    example: 2500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Course thumbnail image URL',
    example: 'https://example.com/thumbnails/math-course.jpg',
  })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Course tags for better discoverability',
    example: ['mathematics', 'slc', 'calculus'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateCourseDto {
  @ApiPropertyOptional({
    description: 'Course title',
    example: 'Advanced Mathematics for Class 12 - Updated',
    minLength: 3,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Course description',
    example: 'Updated comprehensive mathematics course covering calculus, algebra, and geometry',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({
    description: 'Short description for course cards',
    example: 'Updated complete math preparation for SLC examinations',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiPropertyOptional({
    description: 'Course category',
    enum: courseCategoryEnum.enumValues,
    example: 'mathematics',
  })
  @IsOptional()
  @IsEnum(courseCategoryEnum.enumValues)
  category?: string;

  @ApiPropertyOptional({
    description: 'Course language',
    enum: courseLanguageEnum.enumValues,
    example: 'english',
  })
  @IsOptional()
  @IsEnum(courseLanguageEnum.enumValues)
  language?: string;

  @ApiPropertyOptional({
    description: 'Course difficulty level',
    enum: courseDifficultyEnum.enumValues,
    example: 'advanced',
  })
  @IsOptional()
  @IsEnum(courseDifficultyEnum.enumValues)
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'Course price in NPR (0 for free courses)',
    example: 3000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Course thumbnail image URL',
    example: 'https://example.com/thumbnails/updated-math-course.jpg',
  })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Course tags for better discoverability',
    example: ['mathematics', 'slc', 'calculus', 'updated'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}