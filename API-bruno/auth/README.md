# 🔐 Auth Module API Tests

This Bruno collection contains API tests for the Authentication module of SikshaPath.

## 📋 Available Endpoints

1. **Register User** - Register a new user account
2. **Login User** - Authenticate and get JWT tokens
3. **Refresh Token** - Refresh expired access tokens
4. **Logout User** - Logout and invalidate tokens
5. **Change Password** - Update user password
6. **Forgot Password** - Request password reset email
7. **Reset Password** - Reset password with token
8. **Get Profile** - Get current user profile
9. **Check Authentication** - Verify authentication status

## 🚀 Getting Started

1. **Start the API server:**
   ```bash
   pnpm run start
   ```

2. **Open Bruno and load this collection**

3. **Set environment variables:**
   - `base_url`: `http://localhost:3000`
   - `access_token`: (will be set after login)
   - `refresh_token`: (will be set after login)

4. **Test Flow:**
   - Start with **Register User** or **Login User**
   - Copy the `accessToken` from login response and set it as `access_token` variable
   - Copy the `refreshToken` from login response and set it as `refresh_token` variable
   - Test other authenticated endpoints

## 📝 Test Data

**Student Registration:**
```json
{
  "email": "student@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "role": "student"
}
```

**Teacher Registration:**
```json
{
  "email": "teacher@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "password123",
  "role": "teacher"
}
```

## 🔧 Environment Variables

- `base_url`: API base URL (default: http://localhost:3000)
- `access_token`: JWT access token for authenticated requests
- `refresh_token`: JWT refresh token for token renewal

## 📚 API Documentation

For detailed API documentation, visit: http://localhost:3000/api/docs