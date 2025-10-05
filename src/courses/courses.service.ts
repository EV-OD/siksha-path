import { Injectable, NotFoundException } from '@nestjs/common';
import {
  eq,
  and,
  or,
  ilike,
  gte,
  lte,
  desc,
  asc,
  count,
  sql,
  like,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { courses } from '../database/schemas/courses.schema';
import { users } from '../database/schemas/users.schema';
import { CourseFilterDto } from './dto/course-filter.dto';
import {
  CourseResponseDto,
  PaginatedCourseResponseDto,
  CourseDetailResponseDto,
} from './dto/course-response.dto';

@Injectable()
export class CoursesService {
  private db;

  constructor(private configService: ConfigService) {
    const pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });
    this.db = drizzle(pool);
  }

  /**
   * Get all courses with filtering, searching, and pagination
   */
  async findAll(
    filterDto: CourseFilterDto,
  ): Promise<PaginatedCourseResponseDto> {
    const {
      search,
      category,
      language,
      difficulty,
      minPrice,
      maxPrice,
      isFree,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filterDto;

    // Build where conditions
    const conditions = [
      eq(courses.status, 'published'), // Only show published courses
    ];

    // Search in title and description
    if (search) {
      conditions.push(
        sql`(${courses.title} ILIKE ${`%${search}%`} OR ${courses.description} ILIKE ${`%${search}%`})`,
      );
    }

    // Category filter
    if (category) {
      conditions.push(eq(courses.category, category as any));
    }

    // Language filter
    if (language) {
      conditions.push(eq(courses.language, language as any));
    }

    // Difficulty filter
    if (difficulty) {
      conditions.push(eq(courses.difficulty, difficulty as any));
    }

    // Price filters
    if (isFree) {
      conditions.push(eq(courses.price, '0.00'));
    } else {
      if (minPrice !== undefined) {
        conditions.push(gte(courses.price, minPrice.toString()));
      }
      if (maxPrice !== undefined) {
        conditions.push(lte(courses.price, maxPrice.toString()));
      }
    }

    // Build sort order
    let sortColumn;
    switch (sortBy) {
      case 'title':
        sortColumn = courses.title;
        break;
      case 'price':
        sortColumn = courses.price;
        break;
      case 'rating':
        sortColumn = courses.rating;
        break;
      case 'enrollmentCount':
        sortColumn = courses.enrollmentCount;
        break;
      case 'createdAt':
      default:
        sortColumn = courses.createdAt;
        break;
    }
    const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(courses)
      .where(and(...conditions));

    const total = totalResult.count;

    // Get courses with teacher information
    const coursesData = await this.db
      .select({
        // Course fields
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        shortDescription: courses.shortDescription,
        category: courses.category,
        language: courses.language,
        difficulty: courses.difficulty,
        status: courses.status,
        price: courses.price,
        originalPrice: courses.originalPrice,
        currency: courses.currency,
        totalDuration: courses.totalDuration,
        totalLessons: courses.totalLessons,
        totalResources: courses.totalResources,
        thumbnailUrl: courses.thumbnailUrl,
        videoPreviewUrl: courses.videoPreviewUrl,
        tags: courses.tags,
        prerequisites: courses.prerequisites,
        learningOutcomes: courses.learningOutcomes,
        targetAudience: courses.targetAudience,
        enrollmentCount: courses.enrollmentCount,
        rating: courses.rating,
        totalRatings: courses.totalRatings,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        publishedAt: courses.publishedAt,
        // Teacher fields
        teacherId: users.id,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
        teacherEmail: users.email,
        teacherProfilePicture: users.profilePicture,
      })
      .from(courses)
      .innerJoin(users, eq(courses.teacherId, users.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Transform data to DTOs
    const courseResponses: CourseResponseDto[] = coursesData.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      category: course.category,
      language: course.language,
      difficulty: course.difficulty,
      status: course.status,
      price: course.price,
      originalPrice: course.originalPrice,
      currency: course.currency,
      totalDuration: course.totalDuration,
      totalLessons: course.totalLessons,
      totalResources: course.totalResources,
      thumbnailUrl: course.thumbnailUrl,
      videoPreviewUrl: course.videoPreviewUrl,
      tags: course.tags ? JSON.parse(course.tags) : [],
      prerequisites: course.prerequisites,
      learningOutcomes: course.learningOutcomes
        ? JSON.parse(course.learningOutcomes)
        : [],
      targetAudience: course.targetAudience,
      enrollmentCount: course.enrollmentCount,
      rating: course.rating,
      totalRatings: course.totalRatings,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      publishedAt: course.publishedAt,
      teacher: {
        id: course.teacherId,
        firstName: course.teacherFirstName,
        lastName: course.teacherLastName,
        email: course.teacherEmail,
        profilePicture: course.teacherProfilePicture,
      },
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      courses: courseResponses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  /**
   * Get course by ID with detailed information
   */
  async findOne(id: string): Promise<CourseDetailResponseDto> {
    const courseData = await this.db
      .select({
        // Course fields
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        shortDescription: courses.shortDescription,
        category: courses.category,
        language: courses.language,
        difficulty: courses.difficulty,
        status: courses.status,
        price: courses.price,
        originalPrice: courses.originalPrice,
        currency: courses.currency,
        totalDuration: courses.totalDuration,
        totalLessons: courses.totalLessons,
        totalResources: courses.totalResources,
        thumbnailUrl: courses.thumbnailUrl,
        videoPreviewUrl: courses.videoPreviewUrl,
        tags: courses.tags,
        prerequisites: courses.prerequisites,
        learningOutcomes: courses.learningOutcomes,
        targetAudience: courses.targetAudience,
        enrollmentCount: courses.enrollmentCount,
        rating: courses.rating,
        totalRatings: courses.totalRatings,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        publishedAt: courses.publishedAt,
        // Teacher fields
        teacherId: users.id,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
        teacherEmail: users.email,
        teacherProfilePicture: users.profilePicture,
      })
      .from(courses)
      .innerJoin(users, eq(courses.teacherId, users.id))
      .where(and(eq(courses.id, id), eq(courses.status, 'published')))
      .limit(1);

    if (!courseData.length) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const course = courseData[0];

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      category: course.category,
      language: course.language,
      difficulty: course.difficulty,
      status: course.status,
      price: course.price,
      originalPrice: course.originalPrice,
      currency: course.currency,
      totalDuration: course.totalDuration,
      totalLessons: course.totalLessons,
      totalResources: course.totalResources,
      thumbnailUrl: course.thumbnailUrl,
      videoPreviewUrl: course.videoPreviewUrl,
      tags: course.tags ? JSON.parse(course.tags) : [],
      prerequisites: course.prerequisites,
      learningOutcomes: course.learningOutcomes
        ? JSON.parse(course.learningOutcomes)
        : [],
      targetAudience: course.targetAudience,
      enrollmentCount: course.enrollmentCount,
      rating: course.rating,
      totalRatings: course.totalRatings,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      publishedAt: course.publishedAt,
      teacher: {
        id: course.teacherId,
        firstName: course.teacherFirstName,
        lastName: course.teacherLastName,
        email: course.teacherEmail,
        profilePicture: course.teacherProfilePicture,
      },
      // Extended fields for detail view
      detailedContent: undefined, // Can be added later when we have lesson content
      faq: [], // Can be populated from a separate FAQ table
      reviews: [], // Can be populated from a reviews table
    };
  }

  /**
   * Get course by slug with detailed information
   */
  async findBySlug(slug: string): Promise<CourseDetailResponseDto> {
    const courseData = await this.db
      .select({
        // Course fields
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        shortDescription: courses.shortDescription,
        category: courses.category,
        language: courses.language,
        difficulty: courses.difficulty,
        status: courses.status,
        price: courses.price,
        originalPrice: courses.originalPrice,
        currency: courses.currency,
        totalDuration: courses.totalDuration,
        totalLessons: courses.totalLessons,
        totalResources: courses.totalResources,
        thumbnailUrl: courses.thumbnailUrl,
        videoPreviewUrl: courses.videoPreviewUrl,
        tags: courses.tags,
        prerequisites: courses.prerequisites,
        learningOutcomes: courses.learningOutcomes,
        targetAudience: courses.targetAudience,
        enrollmentCount: courses.enrollmentCount,
        rating: courses.rating,
        totalRatings: courses.totalRatings,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        publishedAt: courses.publishedAt,
        // Teacher fields
        teacherId: users.id,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
        teacherEmail: users.email,
        teacherProfilePicture: users.profilePicture,
      })
      .from(courses)
      .innerJoin(users, eq(courses.teacherId, users.id))
      .where(and(eq(courses.slug, slug), eq(courses.status, 'published')))
      .limit(1);

    if (!courseData.length) {
      throw new NotFoundException(`Course with slug ${slug} not found`);
    }

    const course = courseData[0];

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      category: course.category,
      language: course.language,
      difficulty: course.difficulty,
      status: course.status,
      price: course.price,
      originalPrice: course.originalPrice,
      currency: course.currency,
      totalDuration: course.totalDuration,
      totalLessons: course.totalLessons,
      totalResources: course.totalResources,
      thumbnailUrl: course.thumbnailUrl,
      videoPreviewUrl: course.videoPreviewUrl,
      tags: course.tags ? JSON.parse(course.tags) : [],
      prerequisites: course.prerequisites,
      learningOutcomes: course.learningOutcomes
        ? JSON.parse(course.learningOutcomes)
        : [],
      targetAudience: course.targetAudience,
      enrollmentCount: course.enrollmentCount,
      rating: course.rating,
      totalRatings: course.totalRatings,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      publishedAt: course.publishedAt,
      teacher: {
        id: course.teacherId,
        firstName: course.teacherFirstName,
        lastName: course.teacherLastName,
        email: course.teacherEmail,
        profilePicture: course.teacherProfilePicture,
      },
      // Extended fields for detail view
      detailedContent: undefined, // Can be added later when we have lesson content
      faq: [], // Can be populated from a separate FAQ table
      reviews: [], // Can be populated from a reviews table
    };
  }

  /**
   * Get popular courses (high enrollment or rating)
   */
  async findPopular(limit: number = 10): Promise<CourseResponseDto[]> {
    const coursesData = await this.db
      .select({
        // Course fields
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        shortDescription: courses.shortDescription,
        category: courses.category,
        language: courses.language,
        difficulty: courses.difficulty,
        status: courses.status,
        price: courses.price,
        originalPrice: courses.originalPrice,
        currency: courses.currency,
        totalDuration: courses.totalDuration,
        totalLessons: courses.totalLessons,
        totalResources: courses.totalResources,
        thumbnailUrl: courses.thumbnailUrl,
        videoPreviewUrl: courses.videoPreviewUrl,
        tags: courses.tags,
        prerequisites: courses.prerequisites,
        learningOutcomes: courses.learningOutcomes,
        targetAudience: courses.targetAudience,
        enrollmentCount: courses.enrollmentCount,
        rating: courses.rating,
        totalRatings: courses.totalRatings,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        publishedAt: courses.publishedAt,
        // Teacher fields
        teacherId: users.id,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
        teacherEmail: users.email,
        teacherProfilePicture: users.profilePicture,
      })
      .from(courses)
      .innerJoin(users, eq(courses.teacherId, users.id))
      .where(eq(courses.status, 'published'))
      .orderBy(desc(courses.enrollmentCount), desc(courses.rating))
      .limit(limit);

    return coursesData.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      category: course.category,
      language: course.language,
      difficulty: course.difficulty,
      status: course.status,
      price: course.price,
      originalPrice: course.originalPrice,
      currency: course.currency,
      totalDuration: course.totalDuration,
      totalLessons: course.totalLessons,
      totalResources: course.totalResources,
      thumbnailUrl: course.thumbnailUrl,
      videoPreviewUrl: course.videoPreviewUrl,
      tags: course.tags ? JSON.parse(course.tags) : [],
      prerequisites: course.prerequisites,
      learningOutcomes: course.learningOutcomes
        ? JSON.parse(course.learningOutcomes)
        : [],
      targetAudience: course.targetAudience,
      enrollmentCount: course.enrollmentCount,
      rating: course.rating,
      totalRatings: course.totalRatings,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      publishedAt: course.publishedAt,
      teacher: {
        id: course.teacherId,
        firstName: course.teacherFirstName,
        lastName: course.teacherLastName,
        email: course.teacherEmail,
        profilePicture: course.teacherProfilePicture,
      },
    }));
  }
}
