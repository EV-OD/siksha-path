# SikshaPath E-Learning Platform

<p align="center">
  <strong>A comprehensive e-learning platform built with NestJS, PostgreSQL, and modern web technologies</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

## 🚀 Features

- **Role-based Authentication** - Students, Teachers, and Admins
- **Course Management** - Create, manage, and sell courses
- **Live Classes** - Zoom integration for real-time sessions
- **Payment Integration** - Multiple payment gateways (eSewa, Khalti, Fonepay, Stripe)
- **File Storage** - Supabase integration for course materials
- **Real-time Chat** - Student-teacher communication
- **Performance Analytics** - Course progress and engagement tracking
- **Multi-language Support** - Built for Nepal market

## 🏗️ Architecture

- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis Cloud
- **Storage**: Supabase Storage
- **Authentication**: JWT-based with role management
- **Real-time**: WebSocket for chat and live features

## 📋 Progress Tracking

See [TASK_LIST.md](./TASK_LIST.md) for detailed development progress and task breakdown.

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v18+)
- pnpm
- PostgreSQL (or use Neon cloud database)
- Redis (or use Redis Cloud)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd siksha-path
pnpm install
```

2. **Environment Configuration**
Copy `.env.example` to `.env` and configure:
```bash
# Database
DATABASE_URL=postgres://...

# Redis
REDIS_HOST=...
REDIS_PORT=...
REDIS_USERNAME=...
REDIS_PASSWORD=...

# Supabase Storage
PROJECT_URL=...
ANON_KEY=...
SERVICE_ROLE_KEY=...
SUPABASE_BUCKET=...

# Zoom API
Account_ID=...
Client_ID=...
Client_Secret=...

# JWT Secret
JWT_SECRET=...
```

3. **Test Connections**
```bash
# Quick configuration check
pnpm test:config

# Full connection test
pnpm test:connection
```

4. **Database Setup**
```bash
# Generate migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Or push directly (development)
pnpm db:push
```

## 🚀 Development

### Running the Application
```bash
# Development mode with hot reload
pnpm start:dev

# Production mode
pnpm start:prod

# Debug mode
pnpm start:debug
```

### Database Operations
```bash
# Generate new migration
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema changes (development)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio

# Drop all tables (caution!)
pnpm db:drop
```

### Testing & Quality
```bash
# Run connection tests
pnpm test:connection

# Check configuration
pnpm test:config

# Run unit tests
pnpm test

# Watch mode testing
pnpm test:watch

# Coverage report
pnpm test:cov

# E2E tests
pnpm test:e2e

# Lint code
pnpm lint

# Format code
pnpm format
```

## 🧪 Connection Testing

The project includes comprehensive connection testing for all external services:

### Available Test Scripts
- `pnpm test:connection` - Full connection test with actual API calls
- `pnpm test:config` - Quick configuration validation

### Services Tested
- ✅ **PostgreSQL Database** - Connection and query execution
- ✅ **Redis Cache** - Connection and data operations  
- ✅ **Supabase Storage** - Authentication and bucket access
- ✅ **Zoom API** - OAuth token generation and API calls

See [scripts/README.md](./scripts/README.md) for detailed testing documentation.

## 📁 Project Structure

```
src/
├── database/
│   ├── schemas/          # Drizzle ORM schemas
│   └── migrations/       # Database migrations
├── redis/               # Redis configuration
├── config/              # App configuration
├── auth/                # Authentication module (planned)
├── courses/             # Course management (planned)
├── users/               # User management (planned)
└── payments/            # Payment integration (planned)

scripts/
├── test-connections.ts  # Comprehensive connection testing
├── quick-test.js       # Fast configuration check
└── README.md           # Testing documentation
```

## 🎯 Development Status

**Current Progress**: 10/89 tasks completed (11.2%)

**Completed**:
- ✅ Environment setup
- ✅ Database schema design (7 schemas)
- ✅ Redis integration
- ✅ Connection testing infrastructure

**Next**: JWT Authentication service implementation

## 🤝 Contributing

1. Follow the task list in `TASK_LIST.md`
2. Run `pnpm test:connection` before committing
3. Follow TypeScript and ESLint standards
4. Update progress in task list

## 📚 Documentation

- [Task List](./TASK_LIST.md) - Development roadmap and progress
- [Connection Testing](./scripts/README.md) - Service testing documentation
- [Database Schemas](./src/database/schemas/) - Data model documentation

## 🔗 External Services

- **Database**: [Neon PostgreSQL](https://neon.tech)
- **Caching**: [Redis Cloud](https://redis.com)
- **Storage**: [Supabase](https://supabase.com)
- **Video**: [Zoom API](https://zoom.us)
- **Payments**: eSewa, Khalti, Fonepay, Stripe
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
