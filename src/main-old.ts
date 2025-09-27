import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transform: true, // Transform payloads to DTO instances
      disableErrorMessages: false, // Show detailed validation errors
    }),
  );

  // CORS configuration for API access
  app.enableCors({
    origin: process.env.FRONTEND_URL || true, // Allow all origins in development
    credentials: true,
  });

  // Enhanced Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('🎓 SikshaPath API')
    .setDescription(`
      <div style="margin-bottom: 20px;">
        <h2>🎓 Nepal's Premier E-Learning Platform API</h2>
        <p><strong>Version:</strong> 1.0.0 | <strong>Environment:</strong> Development</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>🚀 Quick Start Guide</h3>
        <ol>
          <li><strong>Register:</strong> Create account with <code>POST /auth/register</code></li>
          <li><strong>Login:</strong> Get JWT token with <code>POST /auth/login</code></li>
          <li><strong>Authorize:</strong> Click 🔒 "Authorize" button and paste your token</li>
          <li><strong>Explore:</strong> Try protected endpoints with your token</li>
        </ol>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin: 20px 0;">
        <div style="background: #e3f2fd; padding: 12px; border-radius: 6px;">
          <h4>🔐 Authentication & Security</h4>
          <p>JWT-based authentication with role-based access control (Student, Teacher, Admin)</p>
        </div>
        <div style="background: #f3e5f5; padding: 12px; border-radius: 6px;">
          <h4>👥 User Management</h4>
          <p>Complete profile management with admin controls and teacher verification</p>
        </div>
        <div style="background: #e8f5e8; padding: 12px; border-radius: 6px;">
          <h4>📚 Course System</h4>
          <p>Course creation, enrollment, progress tracking, and resource management</p>
        </div>
        <div style="background: #fff3e0; padding: 12px; border-radius: 6px;">
          <h4>💰 Payment Integration</h4>
          <p>Secure payment processing for course purchases and teacher revenue</p>
        </div>
      </div>
      
      <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
        <h4>� Documentation Features</h4>
        <ul>
          <li><strong>Interactive Testing:</strong> Try all endpoints directly in the browser</li>
          <li><strong>Auto-Authorization:</strong> Token persistence across requests</li>
          <li><strong>Real Examples:</strong> Sample requests and responses with actual data</li>
          <li><strong>Schema Validation:</strong> Complete data type definitions</li>
        </ul>
      </div>
      
      <p><strong>Base URL:</strong> <code>http://localhost:${process.env.PORT || 3000}</code></p>
    `)
    .setVersion('1.0.0')
    .setContact('SikshaPath Development Team', 'https://siksha-path.com', 'dev@siksha-path.com')
    .setLicense('MIT License', 'https://opensource.org/licenses/MIT')
    .addServer(`http://localhost:${process.env.PORT || 3000}`, '🔧 Development Server')
    .addServer('https://api.siksha-path.com', '🚀 Production Server (Coming Soon)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT-Auth',
        description: 'Enter your JWT access token (get it from /auth/login)',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('🔐 Authentication', 'User registration, login, logout, and password management')
    .addTag('👥 User Management', 'Profile management, admin operations, and role-based features')
    .addTag('📚 Course Management', 'Course CRUD, enrollment, and progress tracking')
    .addTag('💰 Payment System', 'Payment processing, transactions, and revenue management')
    .addTag('🎥 Live Classes', 'Zoom integration, scheduling, and virtual classroom management')
    .addTag('💬 Real-time Chat', 'Course discussions, messaging, and notifications')
    .addTag('📁 Resource Management', 'File uploads, downloads, and content organization')
    .addTag('📊 Analytics', 'Platform statistics, user activity, and performance metrics')
    .build();

  const document = SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup('api/docs', app as any, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      displayOperationId: false,
      tryItOutEnabled: true,
      requestInterceptor: `(req) => {
        req.headers['X-API-Version'] = '1.0.0';
        return req;
      }`,
    },
    customSiteTitle: '🎓 SikshaPath API - Interactive Documentation',
    customfavIcon: '/favicon.ico',
    customCssUrl: [],
    customJs: [],
    customCss: `
      /* Modern, clean styling for SikshaPath API documentation */
      
      /* Hide default topbar */
      .swagger-ui .topbar { display: none; }
      
      /* Custom header with branding */
      .swagger-ui::before {
        content: "";
        display: block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        height: 4px;
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;
      }
      
      /* Main container styling */
      .swagger-ui {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: #fafbfc;
        min-height: 100vh;
        padding-top: 20px;
      }
      
      /* Info section styling */
      .swagger-ui .info {
        margin-bottom: 30px;
        padding: 25px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid #e1e8ed;
      }
      
      .swagger-ui .info .title {
        color: #1a202c;
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 15px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .swagger-ui .info .description {
        color: #4a5568;
        line-height: 1.6;
        font-size: 14px;
      }
      
      /* Operation tags */
      .swagger-ui .opblock-tag {
        background: white;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        margin: 15px 0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .swagger-ui .opblock-tag-section h3 {
        color: #2d3748;
        font-weight: 600;
        padding: 15px 20px;
        margin: 0;
        background: #f7fafc;
        border-radius: 8px 8px 0 0;
        border-bottom: 1px solid #e2e8f0;
      }
      
      /* HTTP method colors */
      .swagger-ui .opblock.opblock-get .opblock-summary-method {
        background: #48bb78;
        color: white;
      }
      
      .swagger-ui .opblock.opblock-post .opblock-summary-method {
        background: #4299e1;
        color: white;
      }
      
      .swagger-ui .opblock.opblock-put .opblock-summary-method {
        background: #ed8936;
        color: white;
      }
      
      .swagger-ui .opblock.opblock-patch .opblock-summary-method {
        background: #9f7aea;
        color: white;
      }
      
      .swagger-ui .opblock.opblock-delete .opblock-summary-method {
        background: #f56565;
        color: white;
      }
      
      /* Operation blocks */
      .swagger-ui .opblock {
        margin: 8px 0;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        background: white;
      }
      
      .swagger-ui .opblock-summary {
        padding: 12px 15px;
        background: #f8f9fa;
        border-radius: 6px 6px 0 0;
      }
      
      .swagger-ui .opblock-summary-path {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        color: #4a5568;
        font-weight: 500;
      }
      
      /* Authorization section */
      .swagger-ui .auth-wrapper {
        background: white;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        margin-bottom: 20px;
      }
      
      .swagger-ui .auth-btn-wrapper {
        text-align: center;
        margin: 20px 0;
      }
      
      .swagger-ui .btn.authorize {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
      }
      
      .swagger-ui .btn.authorize:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
      
      /* Try it out button */
      .swagger-ui .btn.try-out__btn {
        background: #48bb78;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
      
      /* Execute button */
      .swagger-ui .btn.execute {
        background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      /* Response section */
      .swagger-ui .responses-wrapper {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
        margin-top: 15px;
      }
      
      .swagger-ui .highlight-code {
        background: #1a202c;
        color: #e2e8f0;
        padding: 15px;
        border-radius: 6px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        line-height: 1.5;
      }
      
      /* Model section */
      .swagger-ui .model-box {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 15px;
      }
      
      /* Parameters section */
      .swagger-ui .parameters-col_description {
        color: #4a5568;
        font-size: 13px;
      }
      
      /* Custom scrollbar */
      .swagger-ui ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .swagger-ui ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      
      .swagger-ui ::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
      }
      
      .swagger-ui ::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
      
      /* Loading states */
      .swagger-ui .loading-container {
        padding: 40px;
        text-align: center;
        color: #4a5568;
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .swagger-ui {
          padding: 10px;
        }
        
        .swagger-ui .info {
          padding: 15px;
        }
        
        .swagger-ui .info .title {
          font-size: 1.8rem;
        }
      }
      
      /* Success/Error indicators */
      .swagger-ui .response.undocumented {
        background: #fed7d7;
        border-left: 4px solid #f56565;
      }
      
      .swagger-ui .response[data-code="200"] {
        background: #f0fff4;
        border-left: 4px solid #48bb78;
      }
      
      .swagger-ui .response[data-code="201"] {
        background: #f0fff4;
        border-left: 4px solid #48bb78;
      }
      
      .swagger-ui .response[data-code="400"] {
        background: #fef5e7;
        border-left: 4px solid #ed8936;
      }
      
      .swagger-ui .response[data-code="401"] {
        background: #fed7d7;
        border-left: 4px solid #f56565;
      }
      
      .swagger-ui .response[data-code="403"] {
        background: #fed7d7;
        border-left: 4px solid #f56565;
      }
      
      .swagger-ui .response[data-code="404"] {
        background: #fef5e7;
        border-left: 4px solid #ed8936;
      }
      
      .swagger-ui .response[data-code="500"] {
        background: #fed7d7;
        border-left: 4px solid #f56565;
      }
    `,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 SikshaPath API is running on: http://localhost:${port}`);
  console.log(`📚 Authentication endpoints available at: http://localhost:${port}/auth`);
  console.log(`� API Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
