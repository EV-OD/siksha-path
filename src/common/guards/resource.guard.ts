import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { courses } from '../../database/schemas/courses.schema';
import { enrollments } from '../../database/schemas/enrollments.schema';
import { UserRole } from '../../auth/dto/auth.dto';

export enum ResourceAction {
  OWN = 'own',           // User owns the resource
  ENROLLED = 'enrolled', // User is enrolled in the course
  ADMIN = 'admin',       // Admin override
  PUBLIC = 'public',     // Public access
}

@Injectable()
export class ResourceGuard implements CanActivate {
  private db;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    const pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });
    this.db = drizzle(pool);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if endpoint is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      'isPublic',
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true; // Public endpoints don't require authentication
    }

    const requiredActions = this.reflector.getAllAndOverride<ResourceAction[]>(
      'resourceActions',
      [context.getHandler(), context.getClass()],
    );

    // If no resource actions required, allow access
    if (!requiredActions || requiredActions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Extract resource ID from request
    const resourceId = this.extractResourceId(request, context);

    if (!resourceId) {
      throw new NotFoundException('Resource ID not found');
    }

    // Check if resource exists first
    const resourceExists = await this.checkResourceExists(resourceId);
    if (!resourceExists) {
      throw new NotFoundException('Resource not found');
    }

    // Admin override - always allow
    if (user.role === UserRole.ADMIN && requiredActions.includes(ResourceAction.ADMIN)) {
      return true;
    }

    // Check each required action
    for (const action of requiredActions) {
      switch (action) {
        case ResourceAction.OWN:
          if (await this.checkOwnership(resourceId, user.id)) {
            return true;
          }
          break;

        case ResourceAction.ENROLLED:
          if (await this.checkEnrollment(resourceId, user.id)) {
            return true;
          }
          break;

        case ResourceAction.PUBLIC:
          return true; // Public access always allowed

        case ResourceAction.ADMIN:
          // Already checked above
          break;
      }
    }

    // If no action matched, deny access
    throw new ForbiddenException(
      `Access denied. Required permissions: ${requiredActions.join(', ')}`,
    );
  }

  private extractResourceId(request: any, context: ExecutionContext): string | null {
    // Try different ways to extract resource ID

    // From route params (e.g., /courses/:id)
    const params = request.params;
    if (params.id) {
      return params.id;
    }

    // From route params with different names
    if (params.courseId) {
      return params.courseId;
    }

    // From body (for operations that might need course context)
    const body = request.body;
    if (body.courseId) {
      return body.courseId;
    }

    // From query params
    const query = request.query;
    if (query.courseId) {
      return query.courseId;
    }

    return null;
  }

  private async checkResourceExists(resourceId: string): Promise<boolean> {
    try {
      const course = await this.db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.id, resourceId))
        .limit(1);

      return course.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async checkOwnership(resourceId: string, userId: string): Promise<boolean> {
    try {
      const course = await this.db
        .select()
        .from(courses)
        .where(and(eq(courses.id, resourceId), eq(courses.teacherId, userId)))
        .limit(1);

      return course.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async checkEnrollment(resourceId: string, userId: string): Promise<boolean> {
    try {
      const enrollment = await this.db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.courseId, resourceId),
            eq(enrollments.studentId, userId),
            eq(enrollments.status, 'active'),
          ),
        )
        .limit(1);

      return enrollment.length > 0;
    } catch (error) {
      return false;
    }
  }
}