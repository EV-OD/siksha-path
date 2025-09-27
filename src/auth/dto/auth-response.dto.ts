import { UserRole } from './auth.dto';

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
  refreshToken: string;
}

export class AuthSuccessDto {
  message: string;
  success: boolean;
}
