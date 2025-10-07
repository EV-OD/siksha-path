import { IsString, IsNotEmpty } from 'class-validator';
import { UserRole } from './auth.dto';
import { ApiProperty } from '@nestjs/swagger';


export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  fullName: string;
  iat?: number; // Issued at
  exp?: number; // Expires at
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token obtained from login',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class AuthSuccessDto {
  message: string;
  success: boolean;
}
