# Connection Testing Scripts

This directory contains scripts to test all external service connections for the SikshaPath platform.

## Available Scripts

### 1. Full Connection Test
```bash
pnpm test:connection
```
**Description**: Comprehensive test that actually connects to all services and performs operations.

**Tests performed**:
- **Database (PostgreSQL)**: Connects to Neon database and runs a test query
- **Redis**: Connects to Redis Cloud, performs set/get operations, verifies data integrity  
- **Supabase Storage**: Tests authentication and storage bucket access
- **Zoom API**: Obtains OAuth token and makes authenticated API calls
- **Performance**: Measures response times for all services

**Output**: Detailed results with response times, service versions, and connection details.

### 2. Quick Configuration Check
```bash
pnpm test:config
```
**Description**: Fast configuration validation without actual connections.

**Checks performed**:
- Verifies all required environment variables are present
- Displays service endpoints and configuration status
- No actual network connections made

**Output**: Configuration summary showing what's configured vs missing.

## Environment Variables Required

The scripts expect these environment variables to be configured in `.env`:

```env
# Database
DATABASE_URL=postgres://...

# Redis
REDIS_HOST=...
REDIS_PORT=...
REDIS_USERNAME=...
REDIS_PASSWORD=...

# Supabase
PROJECT_URL=...
ANON_KEY=...
SERVICE_ROLE_KEY=...
SUPABASE_BUCKET=...

# Zoom API
Account_ID=...
Client_ID=...
Client_Secret=...

# JWT
JWT_SECRET=...
```

## Usage Examples

### Before deployment
```bash
# Check configuration
pnpm test:config

# Test all connections
pnpm test:connection
```

### Continuous Integration
```bash
# In CI/CD pipeline
pnpm test:connection || exit 1
```

### Development workflow
```bash
# After environment setup
pnpm test:config && pnpm test:connection
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify network connectivity to Neon
   - Ensure database exists and user has permissions

2. **Redis Connection Failed**
   - Verify Redis Cloud credentials
   - Check if Redis instance is running
   - Validate network access to Redis Cloud

3. **Supabase Storage Failed**
   - Check PROJECT_URL and ANON_KEY
   - Verify storage bucket exists
   - Check service permissions

4. **Zoom API Failed**
   - Validate OAuth credentials (Account_ID, Client_ID, Client_Secret)
   - Check Zoom account status
   - Verify API permissions

### Exit Codes
- `0`: All tests passed
- `1`: One or more tests failed

## Adding New Service Tests

When integrating a new external service, use the provided template:

1. **Copy the template**:
```bash
cp scripts/service-test-template.ts scripts/test-[service-name].ts
```

2. **Update the template**:
- Replace `[SERVICE_NAME]` with actual service name
- Update environment variables section
- Implement actual connection logic
- Add service-specific test operations

3. **Add to package.json**:
```json
{
  "scripts": {
    "test:service-name": "ts-node scripts/test-service-name.ts"
  }
}
```

4. **Update main test suite**:
Add the new service test to `scripts/test-connections.ts`

## File Structure
```
scripts/
├── test-connections.ts        # Full TypeScript test suite
├── quick-test.js             # Fast configuration check
├── service-test-template.ts  # Template for new service tests
└── README.md                # This documentation
```
