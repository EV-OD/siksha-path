# 🧪 SikshaPath API Testing with Bruno

This directory contains Bruno API testing collections organized by modules for the SikshaPath e-learning platform.

## 📁 Folder Structure

```
API-bruno/
├── auth/           # Authentication endpoints
├── users/          # User management endpoints
├── courses/        # Course management endpoints
├── enrollments/    # Enrollment management endpoints
└── README.md       # This file
```

## 🚀 Getting Started

1. **Install Bruno**: Download from [bruno.app](https://www.usebruno.com/)

2. **Start the API server:**
   ```bash
   pnpm run start
   ```

3. **Open Bruno and import collections:**
   - Open Bruno application
   - Import each module folder as a collection
   - Set environment variables for each collection

4. **Test Flow:**
   - Start with **auth** collection to get authentication tokens
   - Use tokens in other collections for authenticated requests
   - Test endpoints in logical order (auth → users → courses → enrollments)

## 🔐 Authentication

Most endpoints require JWT authentication. After logging in via the auth collection:

1. Copy the `accessToken` from login response
2. Set it as the `access_token` environment variable in each collection
3. Copy the `refreshToken` for token refresh operations

## 📚 API Documentation

- **Swagger UI**: http://localhost:3000/api/docs
- **Collection READMEs**: Each module has detailed documentation

## 🧪 Testing Strategy

- **Unit Tests**: `pnpm run test:unit`
- **E2E Tests**: `pnpm run test:e2e`
- **API Tests**: Use Bruno collections for manual/integration testing

## 📋 Available Collections

### 🔐 Auth Module
- User registration and login
- Token refresh and logout
- Password management
- Profile and authentication checks

### 👤 Users Module
- Profile management
- User administration (admin only)
- Teacher verification

### 📚 Courses Module
- Course CRUD operations
- Course search and filtering
- Publishing/unpublishing courses

### 🎓 Enrollments Module
- Course enrollment
- Progress tracking
- Enrollment management

## 🔧 Environment Setup

Each collection has environment files for different deployment stages:
- `local.bru`: Local development
- Add more environments as needed (staging, production)

## 📝 Contributing

When adding new endpoints:
1. Create numbered `.bru` files (e.g., `01-endpoint-name.bru`)
2. Update collection `README.md`
3. Test thoroughly before committing
4. Follow the existing naming conventions

## 🐛 Issues & Support

- Check API logs for server-side errors
- Verify environment variables are set correctly
- Ensure the API server is running on the correct port
- Check network connectivity and CORS settings