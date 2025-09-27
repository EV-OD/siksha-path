## Guidelines

### 1. Project Structure
- Use **feature-based modules**: each feature has its own module folder with `controller`, `service`, `dto`, and `entity` (if database-related).  
- Include a `common/` folder for reusable utilities, guards, interceptors, filters, pipes, and constants.  
- `config/` folder for environment variables and app configuration.  
- `main.ts` should be clean and only handle app bootstrap and global middleware setup.  

### 2. Modularity
- Each module should be **self-contained** and able to be imported independently.  
- Services should encapsulate **business logic** only.  
- Controllers should **only handle request/response and validation**, no business logic.  
- DTOs define the **shape of incoming/outgoing data**, using class-validator for validation.  

### 3. Dependency Management
- Use NestJS **Dependency Injection** for all services, repositories, and providers.  
- Avoid tight coupling between modules; interact via interfaces or shared modules when needed.  

### 4. Database & Entities (if applicable)
- Use **ORM or database layer** in a separate folder or module.  
- Define **entities clearly** with proper relationships.  
- Keep database operations in services/repositories, not controllers.  

### 5. Standard Practices
- Use **RESTful naming conventions** for controllers and routes.  
- Return **consistent HTTP responses** with proper status codes.  
- Handle errors using **global exception filters**.  
- Logging and configuration should be centralized.  

### 6. Extensibility
- Code should be easy to extend: adding a new feature means **creating a new module** without modifying existing modules.  
- Encourage **reusable helpers** in `common/`.  
- Use **interfaces and abstract classes** for contracts between modules.  

### 7. Testing & Quality Assurance
- **Connection Testing**: Always create comprehensive test scripts for external service connections (database, Redis, third-party APIs).
- **Configuration Validation**: Include quick configuration check scripts that validate environment variables without making network calls.
- **Service Integration Tests**: Test all critical integrations (payment gateways, file storage, video APIs) with actual service calls.
- **Performance Monitoring**: Include response time measurements and service health checks in test scripts.
- **CI/CD Integration**: Ensure test scripts can run in automated pipelines with proper exit codes.

#### Testing Script Standards:
- **Comprehensive Tests** (`test:connection`): Full service validation with actual API calls, performance metrics, and detailed reporting.
- **Quick Validation** (`test:config`): Fast environment variable checks without network calls, suitable for CI/CD.
- **Error Handling**: Provide clear, actionable error messages with troubleshooting hints.
- **Documentation**: Include README files for test scripts with usage examples and troubleshooting guides.
- **Exit Codes**: Use proper exit codes (0 for success, 1 for failure) for automation compatibility.

#### External Service Testing Requirements:
- **Database**: Connection validation, query execution, migration status checks.
- **Cache/Redis**: Connection, set/get operations, data integrity verification.
- **Storage Services**: Authentication, bucket access, file operations testing.
- **Third-party APIs**: OAuth flows, API call validation, rate limit awareness.
- **Payment Gateways**: Sandbox testing, credential validation, webhook verification.

### 8. Script Organization
- Create `scripts/` directory for all testing and utility scripts.
- Use TypeScript for complex test scripts with type safety.
- Provide both TypeScript (comprehensive) and JavaScript (quick) versions when needed.
- Include progress indicators, colored output, and summary reports.
- Add scripts to `package.json` with clear, descriptive names.

### 9. Output Style
- Provide **folder structure** + **example code snippets** for controllers, services, and DTOs.  
- Include comments explaining **why modules/services are separated**, and **how DI is used**.  
- Demonstrate **best-practice patterns** like Providers, Guards, and Interceptors.
- **Testing Examples**: Show how to create connection tests, configuration validators, and service health checks.

## SikshaPath Specific Guidelines

### 1. Service Testing Requirements
For the SikshaPath e-learning platform, always implement these testing patterns:

#### Database Testing (PostgreSQL/Neon)
```typescript
// Test database connection, schema validation, and query performance
await testDatabaseConnection();
await validateSchemaIntegrity(); 
await measureQueryPerformance();
```

#### Redis Cache Testing
```typescript  
// Test Redis connection, cache operations, and pub/sub functionality
await testRedisConnection();
await testCacheOperations(); // set/get/delete with TTL
await testPubSubChannels(); // for real-time features
```

#### Supabase Storage Testing
```typescript
// Test file upload, download, and bucket access
await testSupabaseAuth();
await testBucketAccess();
await testFileOperations();
```

#### Zoom API Testing
```typescript
// Test OAuth flow, meeting creation, and webhook endpoints
await testZoomOAuth();
await testMeetingCreation();
await testWebhookEndpoints();
```

### 2. Payment Gateway Testing Standards
Each payment integration must include:
- **Sandbox Environment**: Test with sandbox credentials
- **Webhook Validation**: Verify signature verification
- **Transaction Flow**: Test complete payment cycle
- **Error Scenarios**: Handle failed payments gracefully

```bash
# Required test scripts for payment gateways
pnpm test:payment:esewa
pnpm test:payment:khalti  
pnpm test:payment:fonepay
pnpm test:payment:stripe
```

### 3. Environment Configuration Standards
- Always validate required environment variables on startup
- Provide clear error messages for missing configurations
- Include example `.env.example` file with all required variables
- Use type-safe configuration with validation schemas

### 4. Monitoring & Health Checks
Implement health check endpoints that test:
```typescript
@Get('/health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await this.testDatabaseHealth(),
      redis: await this.testRedisHealth(), 
      supabase: await this.testSupabaseHealth(),
      zoom: await this.testZoomHealth()
    }
  };
}
```

### 5. Development Workflow Integration
Before any major development phase:
1. Run `pnpm test:config` - Validate environment setup
2. Run `pnpm test:connection` - Test all service connections  
3. Check `TASK_LIST.md` - Verify prerequisites are met
4. Update progress tracking after completion

This ensures a robust, testable, and maintainable e-learning platform architecture.

## Example Implementation

### Creating a New Service Test Script

When adding a new external service integration, follow this pattern:

1. **Add to package.json scripts**:
```json
{
  "scripts": {
    "test:service-name": "ts-node scripts/test-service-name.ts"
  }
}
```

2. **Create comprehensive test script**:
```typescript
// scripts/test-service-name.ts
import { config } from 'dotenv';
config();

interface TestResult {
  service: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  responseTime?: number;
  details?: any;
}

class ServiceTester {
  async testServiceConnection(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      // Actual service testing logic
      const result = await this.connectToService();
      return {
        service: 'Service Name',
        status: 'SUCCESS', 
        message: 'Connected successfully',
        responseTime: Date.now() - startTime,
        details: result
      };
    } catch (error) {
      return {
        service: 'Service Name',
        status: 'FAILED',
        message: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }
}
```

3. **Update connection test suite**:
Add the new service test to the main `scripts/test-connections.ts` file.

4. **Document in README**:
Update service documentation with connection details and troubleshooting.

### Current SikshaPath Test Scripts

Our established testing infrastructure includes:

```bash
# Configuration & Connection Testing
pnpm test:config          # Quick environment validation
pnpm test:connection      # Full service connection testing

# Individual Service Testing (future)
pnpm test:database        # Database-specific testing  
pnpm test:redis           # Redis cache testing
pnpm test:storage         # Supabase storage testing
pnpm test:zoom            # Zoom API testing

# Payment Gateway Testing (planned)
pnpm test:payment:esewa   # eSewa integration
pnpm test:payment:khalti  # Khalti integration  
pnpm test:payment:fonepay # Fonepay integration
pnpm test:payment:stripe  # Stripe integration

# Performance & Health Monitoring
pnpm test:performance     # Load testing (planned)
pnpm test:health          # Health check endpoints (planned)
```

This comprehensive testing approach ensures service reliability and easier debugging during development and deployment.
