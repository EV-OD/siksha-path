import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { users } from '../database/schemas/users.schema';
import { UpdateProfileDto, UpdateTeacherProfileDto, ProfileResponseDto } from './dto/profile.dto';

@Injectable()
export class UsersService {
  private db;
  
  constructor(private configService: ConfigService) {
    const pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });
    this.db = drizzle(pool);
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.db
      .select()
      .from(users)
      .where(and(
        eq(users.id, userId),
        eq(users.isActive, 'true')
      ))
      .limit(1);

    if (!user || user.length === 0) {
      throw new NotFoundException('User not found');
    }

    const userData = user[0];
    
    // Remove sensitive data
    const { password, ...profileData } = userData;
    
    return profileData as ProfileResponseDto;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<ProfileResponseDto> {
    // Check if user exists and is active
    const existingUser = await this.db
      .select()
      .from(users)
      .where(and(
        eq(users.id, userId),
        eq(users.isActive, 'true')
      ))
      .limit(1);

    if (!existingUser || existingUser.length === 0) {
      throw new NotFoundException('User not found');
    }

    // Update the user profile
    const updatedUser = await this.db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser || updatedUser.length === 0) {
      throw new BadRequestException('Failed to update profile');
    }

    const { password, ...profileData } = updatedUser[0];
    return profileData as ProfileResponseDto;
  }

  /**
   * Update teacher-specific profile fields
   */
  async updateTeacherProfile(userId: string, updateData: UpdateTeacherProfileDto): Promise<ProfileResponseDto> {
    // Check if user exists, is active, and is a teacher
    const existingUser = await this.db
      .select()
      .from(users)
      .where(and(
        eq(users.id, userId),
        eq(users.isActive, 'true'),
        eq(users.role, 'teacher')
      ))
      .limit(1);

    if (!existingUser || existingUser.length === 0) {
      throw new NotFoundException('Teacher not found');
    }

    // Update the teacher profile
    const updatedUser = await this.db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser || updatedUser.length === 0) {
      throw new BadRequestException('Failed to update teacher profile');
    }

    const { password, ...profileData } = updatedUser[0];
    return profileData as ProfileResponseDto;
  }

  /**
   * Get all users (admin only) with pagination
   */
  async getAllUsers(
    page: number = 1, 
    limit: number = 10, 
    role?: string, 
    search?: string
  ): Promise<{ users: ProfileResponseDto[], total: number, page: number, limit: number }> {
    const offset = (page - 1) * limit;
    
    let whereConditions = [eq(users.isActive, 'true')];
    
    if (role) {
      whereConditions.push(eq(users.role, role as any));
    }
    
    // For search, we'll do a simple implementation
    // In production, you might want to use full-text search
    const allUsers = await this.db
      .select()
      .from(users)
      .where(and(...whereConditions))
      .offset(offset)
      .limit(limit);

    // Remove passwords from all users
    const safeUsers = allUsers.map(user => {
      const { password, ...safeUser } = user;
      return safeUser as ProfileResponseDto;
    });

    // Get total count
    const totalResult = await this.db
      .select()
      .from(users)
      .where(and(...whereConditions));

    return {
      users: safeUsers,
      total: totalResult.length,
      page,
      limit
    };
  }

  /**
   * Deactivate user account (soft delete)
   */
  async deactivateUser(userId: string): Promise<{ message: string }> {
    const result = await this.db
      .update(users)
      .set({
        isActive: 'false',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!result || result.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User account deactivated successfully' };
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string): Promise<{ message: string }> {
    const result = await this.db
      .update(users)
      .set({
        isActive: 'true',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!result || result.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User account reactivated successfully' };
  }

  /**
   * Update teacher verification status (admin only)
   */
  async updateTeacherVerification(userId: string, isVerified: boolean): Promise<{ message: string }> {
    const result = await this.db
      .update(users)
      .set({
        teacherVerified: isVerified ? 'true' : 'false',
        updatedAt: new Date(),
      })
      .where(and(
        eq(users.id, userId),
        eq(users.role, 'teacher')
      ))
      .returning();

    if (!result || result.length === 0) {
      throw new NotFoundException('Teacher not found');
    }

    return { 
      message: `Teacher ${isVerified ? 'verified' : 'unverified'} successfully` 
    };
  }
}
