# SikshaPath Development Guidelines

## Overview
This document outlines the development practices and standards for the SikshaPath educational platform. These guidelines ensure code quality, maintainability, and consistency across the project.

## Development Workflow

### 1. Feature Development Process
- **Plan First**: Break down features into small, manageable tasks
- **Implement**: Write clean, modular code following NestJS best practices
- **Test**: Add comprehensive tests for new functionality
- **Commit**: Follow proper git commit conventions
- **Review**: Ensure code meets all standards before merging

### 2. Git Commit Guidelines
- **Atomic Commits**: Each commit should contain a single, complete change
- **Descriptive Messages**: Use clear, concise commit messages
- **Conventional Commits**: Follow the format: `type(scope): description`

#### Commit Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples:
```
feat(auth): add JWT authentication with refresh tokens
fix(users): resolve profile update validation error
test(users): add e2e tests for user management
docs: update API documentation for enrollments
```

### 3. Testing Requirements

#### Test Coverage
- **Unit Tests**: Required for all service methods and utilities
- **Integration Tests**: Required for database operations and external APIs
- **E2E Tests**: Required for all API endpoints and user workflows
- **Coverage Threshold**: Maintain >80% code coverage

#### Testing Rules
- **Test First**: Write tests before implementing features (TDD approach)
- **Test After**: Always add tests when fixing bugs or adding features
- **Test Data**: Use realistic test data and proper cleanup
- **Edge Cases**: Cover error scenarios, validation, and boundary conditions

#### Test Organization
```
test/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/           # End-to-end tests
```

### 4. NestJS Best Practices

#### Project Structure
```
src/
├── modules/        # Feature modules
│   ├── auth/       # Authentication module
│   ├── users/      # User management
│   └── enrollments/# Course enrollments
├── shared/         # Shared utilities
│   ├── dto/        # Data transfer objects
│   ├── entities/   # Database entities
│   ├── guards/     # Route guards
│   └── interceptors/# Response interceptors
├── config/         # Configuration files
└── database/       # Database schemas and migrations
```

#### Module Organization
- **Single Responsibility**: Each module handles one domain
- **Dependency Injection**: Use NestJS DI container properly
- **Separation of Concerns**: Keep business logic in services, validation in DTOs

#### Controllers
- **RESTful Design**: Follow REST conventions
- **Validation**: Use class-validator for input validation
- **Documentation**: Use Swagger decorators for API docs
- **Error Handling**: Proper HTTP status codes and error responses

#### Services
- **Business Logic**: Keep domain logic in services
- **Database Operations**: Use repository pattern
- **Error Handling**: Throw appropriate exceptions
- **Async/Await**: Use async operations properly

#### DTOs (Data Transfer Objects)
- **Validation**: Use class-validator decorators
- **Documentation**: Use Swagger decorators
- **Type Safety**: Define interfaces for complex objects
- **Transformation**: Use class-transformer for data mapping

### 5. Code Quality Standards

#### TypeScript Guidelines
- **Strict Mode**: Enable strict TypeScript settings
- **Type Safety**: Avoid `any` type, use proper interfaces
- **Null Safety**: Handle null/undefined values properly
- **Generics**: Use generics for reusable components

#### Naming Conventions
- **PascalCase**: Classes, Interfaces, Enums
- **camelCase**: Variables, methods, functions
- **kebab-case**: Files and directories
- **UPPER_CASE**: Constants and environment variables

#### Code Style
- **ESLint**: Follow configured linting rules
- **Prettier**: Use consistent code formatting
- **Imports**: Group imports (external, internal, types)
- **Comments**: Add JSDoc for public APIs

### 6. Database Guidelines

#### Schema Design
- **Normalization**: Proper database normalization
- **Indexing**: Add indexes for frequently queried fields
- **Constraints**: Use foreign keys and check constraints
- **Migrations**: Version control database schema changes

#### ORM Usage
- **Drizzle ORM**: Use Drizzle for type-safe queries
- **Repository Pattern**: Abstract database operations
- **Transactions**: Use transactions for multi-step operations
- **Connection Pooling**: Proper connection management

### 7. Security Practices

#### Authentication & Authorization
- **JWT Tokens**: Use secure JWT implementation
- **Password Hashing**: Use bcrypt with appropriate rounds
- **Role-Based Access**: Implement proper RBAC
- **Token Blacklisting**: Handle token revocation

#### Input Validation
- **Sanitization**: Sanitize all user inputs
- **SQL Injection**: Use parameterized queries
- **XSS Protection**: Escape HTML content
- **Rate Limiting**: Implement API rate limiting

#### API Security
- **CORS**: Configure proper CORS policies
- **Helmet**: Use security headers
- **HTTPS**: Enforce HTTPS in production
- **API Versioning**: Version APIs properly

### 8. Performance Optimization

#### Database
- **Query Optimization**: Use efficient queries
- **Caching**: Implement Redis caching for frequently accessed data
- **Pagination**: Use cursor-based pagination for large datasets
- **Indexing**: Optimize database indexes

#### Application
- **Lazy Loading**: Load modules on demand
- **Compression**: Enable response compression
- **Caching**: Cache expensive operations
- **Monitoring**: Add performance monitoring

### 9. Error Handling

#### Global Exception Filters
- **Custom Exceptions**: Create domain-specific exceptions
- **Logging**: Log errors with appropriate levels
- **User-Friendly Messages**: Return safe error messages
- **Stack Traces**: Include stack traces in development only

#### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": ["field is required"]
}
```

### 10. Documentation

#### API Documentation
- **Swagger/OpenAPI**: Complete API documentation
- **Examples**: Include request/response examples
- **Authentication**: Document auth requirements
- **Error Codes**: List possible error responses

#### Code Documentation
- **JSDoc**: Document public methods and classes
- **README**: Update project documentation
- **Changelogs**: Maintain changelog for releases
- **Architecture**: Document system architecture

### 11. Deployment & DevOps

#### Environment Configuration
- **Environment Variables**: Use .env files
- **Configuration Module**: Centralized configuration
- **Validation**: Validate required environment variables
- **Secrets**: Secure handling of sensitive data

#### CI/CD Pipeline
- **Automated Testing**: Run tests on every push
- **Linting**: Code quality checks
- **Security Scanning**: Vulnerability checks
- **Deployment**: Automated deployment process

### 12. Monitoring & Logging

#### Application Monitoring
- **Health Checks**: Implement health endpoints
- **Metrics**: Collect application metrics
- **Alerts**: Set up alerting for critical issues
- **Tracing**: Implement distributed tracing

#### Logging
- **Structured Logging**: Use consistent log format
- **Log Levels**: Appropriate log levels (ERROR, WARN, INFO, DEBUG)
- **Context**: Include request context in logs
- **Retention**: Proper log retention policies

## Checklist for Feature Implementation

### Before Starting
- [ ] Feature requirements documented
- [ ] Acceptance criteria defined
- [ ] Design review completed
- [ ] Database schema changes planned

### During Development
- [ ] Follow NestJS module structure
- [ ] Implement proper error handling
- [ ] Add input validation
- [ ] Write unit tests
- [ ] Update API documentation

### Before Committing
- [ ] Code passes linting
- [ ] All tests pass
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Database migrations created

### After Deployment
- [ ] Monitor application logs
- [ ] Verify feature functionality
- [ ] Update user documentation
- [ ] Plan for future improvements

## Contact & Support

For questions about these guidelines or development practices, please reach out to the development team or create an issue in the project repository.