import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { enrollmentStatusEnum, enrollmentTypeEnum } from '../../database/schemas/enrollments.schema';

export class EnrollInCourseDto {
  @ApiProperty({
    description: 'Course ID to enroll in',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  courseId: string;
}

export class EnrollmentResponseDto {
  @ApiProperty({
    description: 'Enrollment ID',
    example: '456e7890-e89b-12d3-a456-426614174001',
  })
  id: string;

  @ApiProperty({
    description: 'Student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  studentId: string;

  @ApiProperty({
    description: 'Course ID',
    example: '789e0123-e89b-12d3-a456-426614174002',
  })
  courseId: string;

  @ApiProperty({
    description: 'Enrollment type',
    enum: enrollmentTypeEnum.enumValues,
    example: 'free',
  })
  type: string;

  @ApiProperty({
    description: 'Enrollment status',
    enum: enrollmentStatusEnum.enumValues,
    example: 'active',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Amount paid for the course',
    example: 2500,
  })
  amountPaid?: number;

  @ApiPropertyOptional({
    description: 'Currency of payment',
    example: 'NPR',
  })
  currency?: string;

  @ApiPropertyOptional({
    description: 'Progress percentage (0-100)',
    example: 25.5,
  })
  progressPercentage?: number;

  @ApiPropertyOptional({
    description: 'When access was granted',
  })
  accessGrantedAt?: Date;

  @ApiPropertyOptional({
    description: 'When access expires',
  })
  accessExpiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Last accessed timestamp',
  })
  lastAccessedAt?: Date;

  @ApiPropertyOptional({
    description: 'Completion timestamp',
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Course information',
  })
  course?: {
    id: string;
    title: string;
    thumbnailUrl?: string;
    teacherName: string;
  };

  @ApiProperty({
    description: 'Enrollment creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}

export class EnrollmentListResponseDto {
  @ApiProperty({
    description: 'List of enrollments',
    type: [EnrollmentResponseDto],
  })
  enrollments: EnrollmentResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
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

export class UpdateProgressDto {
  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 75.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage: number;
}