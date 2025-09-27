import { IsString, IsOptional, IsEmail, IsPhoneNumber, MaxLength } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User bio/description',
    example: 'Passionate learner interested in technology and education',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+977-9841234567'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'User address',
    example: 'Kathmandu, Nepal'
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateTeacherProfileDto extends UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  specialization?: string;

  @IsOptional()
  @IsString()
  experience?: string;
}

export class ProfileResponseDto {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  bio?: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
  isActive: string;
  isVerified: string;
  teacherVerified?: string;
  specialization?: string;
  experience?: string;
  createdAt: Date;
  updatedAt: Date;
}
