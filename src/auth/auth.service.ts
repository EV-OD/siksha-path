import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';

import { users } from '../database/schemas/users.schema';
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UserRole,
} from './dto/auth.dto';
import {
  LoginResponseDto,
  JwtPayload,
  RefreshTokenDto,
  AuthSuccessDto,
} from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly db;
  private readonly jwtAccessExpiresIn = '1h';
  private readonly jwtRefreshExpiresIn = '7d';
  private readonly resetTokenExpiresIn = '1h';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    // Initialize database connection
    const connectionString = this.configService.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }
    const client = postgres(connectionString);
    this.db = drizzle(client);
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthSuccessDto> {
    const { email, password, fullName, role, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('User with this email already exists');
    }

    // Split fullName into firstName and lastName
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await this.db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || UserRole.STUDENT,
        phone: phone || null,
        isVerified: 'false', // String value as per schema
        isActive: 'true', // String value as per schema
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      });

    return {
      message: 'User registered successfully',
      success: true,
    };
  }

  /**
   * Login user and return JWT tokens
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const foundUser = user[0];

    // Check if user is active
    if (foundUser.isActive !== 'true') {
      throw new UnauthorizedException('Account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const fullName = `${foundUser.firstName} ${foundUser.lastName}`.trim();
    const payload: JwtPayload = {
      sub: foundUser.id,
      email: foundUser.email,
      role: foundUser.role as UserRole,
      fullName: fullName,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.jwtAccessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.jwtRefreshExpiresIn,
    });

    // Store refresh token in cache
    await this.cacheManager.set(
      `refresh_token:${foundUser.id}`,
      refreshToken,
      7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hour in seconds
      user: {
        id: foundUser.id,
        email: foundUser.email,
        fullName: fullName,
        role: foundUser.role as UserRole,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken);

      // Check if refresh token exists in cache
      const storedToken = await this.cacheManager.get(
        `refresh_token:${payload.sub}`,
      );
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user data
      const user = await this.validateUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role as UserRole,
        fullName: user.fullName,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: this.jwtAccessExpiresIn,
      });

      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: this.jwtRefreshExpiresIn,
      });

      // Update refresh token in cache
      await this.cacheManager.set(
        `refresh_token:${user.id}`,
        newRefreshToken,
        7 * 24 * 60 * 60 * 1000,
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role as UserRole,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user by blacklisting token
   */
  async logout(userId: string): Promise<AuthSuccessDto> {
    // Remove refresh token from cache
    await this.cacheManager.del(`refresh_token:${userId}`);

    // Add to blacklist with current timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    await this.cacheManager.set(
      `blacklist:${userId}`,
      timestamp,
      24 * 60 * 60 * 1000, // 24 hours
    );

    return {
      message: 'Logged out successfully',
      success: true,
    };
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<AuthSuccessDto> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Get user
    const user = await this.validateUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.db
      .update(users)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Invalidate all existing tokens for security
    await this.cacheManager.del(`refresh_token:${userId}`);

    return {
      message: 'Password changed successfully',
      success: true,
    };
  }

  /**
   * Initiate password reset process
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<AuthSuccessDto> {
    const { email } = forgotPasswordDto;

    // Find user
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      // Don't reveal if email exists or not
      return {
        message: 'If the email exists, a password reset link has been sent',
        success: true,
      };
    }

    const foundUser = user[0];

    // Generate reset token
    const resetPayload = {
      sub: foundUser.id,
      email: foundUser.email,
      type: 'reset',
    };

    const resetToken = await this.jwtService.signAsync(resetPayload, {
      expiresIn: this.resetTokenExpiresIn,
    });

    // Store reset token in cache
    await this.cacheManager.set(
      `reset_token:${foundUser.id}`,
      resetToken,
      60 * 60 * 1000, // 1 hour
    );

    // TODO: Send email with reset link
    // await this.emailService.sendPasswordResetEmail(foundUser.email, resetToken);

    return {
      message: 'If the email exists, a password reset link has been sent',
      success: true,
    };
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<AuthSuccessDto> {
    const { resetToken, newPassword } = resetPasswordDto;

    try {
      // Verify reset token
      const payload = await this.jwtService.verifyAsync(resetToken);

      if (payload.type !== 'reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      // Check if reset token exists in cache
      const storedToken = await this.cacheManager.get(
        `reset_token:${payload.sub}`,
      );
      if (!storedToken || storedToken !== resetToken) {
        throw new UnauthorizedException(
          'Reset token has expired or is invalid',
        );
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, payload.sub));

      // Clean up reset token
      await this.cacheManager.del(`reset_token:${payload.sub}`);

      // Invalidate all existing refresh tokens
      await this.cacheManager.del(`refresh_token:${payload.sub}`);

      return {
        message: 'Password reset successfully',
        success: true,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  /**
   * Validate user by ID (used by JWT strategy)
   */
  async validateUserById(userId: string) {
    const user = await this.db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isVerified: users.isVerified,
        isActive: users.isActive,
        password: users.password,
      })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.isActive, 'true')))
      .limit(1);

    if (user.length === 0) return null;

    const userData = user[0];
    return {
      ...userData,
      fullName: `${userData.firstName} ${userData.lastName}`.trim(),
    };
  }

  /**
   * Check if token is blacklisted (used by JWT strategy)
   */
  async isTokenBlacklisted(
    userId: string,
    tokenIssuedAt: number,
  ): Promise<boolean> {
    // For simplicity, we'll use a single blacklist key per user with timestamp
    // In production, consider using a more sophisticated approach
    const blacklistKey = `blacklist:${userId}`;
    const blacklistData = await this.cacheManager.get(blacklistKey);

    if (blacklistData) {
      const timestamp =
        typeof blacklistData === 'string'
          ? parseInt(blacklistData)
          : (blacklistData as number);
      return timestamp >= tokenIssuedAt;
    }

    return false;
  }
}
