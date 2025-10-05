import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { DatabaseModule } from '../database/database.module';

/**
 * Courses Module
 *
 * Handles all course-related functionality including:
 * - Course browsing and listing
 * - Course filtering and searching
 * - Course details retrieval
 * - Popular courses
 *
 * This module provides public endpoints for course discovery
 * without requiring authentication.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService], // Export service for use in other modules
})
export class CoursesModule {}
