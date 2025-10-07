import { SetMetadata } from '@nestjs/common';
import { ResourceAction } from '../guards/resource.guard';

/**
 * Decorator to specify required resource-level permissions
 * @param actions Array of required actions for accessing the resource
 */
export const ResourceAccess = (...actions: ResourceAction[]) =>
  SetMetadata('resourceActions', actions);

/**
 * Decorator for teacher-owned resources (courses they created)
 * Teachers can access their own courses, admins can access all
 */
export const OwnResource = () =>
  ResourceAccess(ResourceAction.OWN, ResourceAction.ADMIN);

/**
 * Decorator for enrolled student access
 * Students can access courses they're enrolled in, teachers own the course, admins can access all
 */
export const EnrolledOrOwnResource = () =>
  ResourceAccess(ResourceAction.ENROLLED, ResourceAction.OWN, ResourceAction.ADMIN);

/**
 * Decorator for public resources with admin override
 */
export const PublicResource = () =>
  ResourceAccess(ResourceAction.PUBLIC, ResourceAction.ADMIN);

/**
 * Decorator for admin-only resources
 */
export const AdminResource = () =>
  ResourceAccess(ResourceAction.ADMIN);