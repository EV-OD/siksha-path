import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  });

  // Minimal Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('🎓 SikshaPath API')
    .setDescription(
      `**Nepal\'s E-Learning Platform API**
    
**Quick Start:** Register → Login → Authorize 🔒 → Test endpoints

**⚠️ Special Notes:**
• **Admin endpoints**: Require admin role (user management)  
• **Teacher endpoints**: Require teacher role (profile/teacher)
• **Authentication**: Most endpoints require valid JWT token`,
    )
    .setVersion('1.0.0')
    .addServer(`http://localhost:${process.env.PORT || 3000}`, 'Dev')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT-Auth',
        description: 'JWT token from /auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('🔐 Auth', 'Authentication & authorization')
    .addTag('👥 Users', 'User & profile management')
    .addTag('📚 Courses', 'Course operations')
    .addTag('💰 Payments', 'Payment processing')
    .addTag('🎥 Classes', 'Live class management')
    .addTag('💬 Chat', 'Messaging & notifications')
    .addTag('📁 Files', 'File & resource management')
    .build();

  const document = SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup('api/docs', app as any, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showExtensions: false,
      showCommonExtensions: false,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      displayOperationId: false,
      tryItOutEnabled: true,
    },
    customSiteTitle: '🎓 SikshaPath API',
    customCss: `
      .swagger-ui .topbar { display: none; }
      
      .swagger-ui {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #fafafa;
      }
      
      .swagger-ui .info {
        margin: 20px 0;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .swagger-ui .info .title {
        font-size: 2rem;
        font-weight: 600;
        color: #1a365d;
        margin-bottom: 10px;
      }
      
      .swagger-ui .opblock-tag {
        background: white;
        border-radius: 6px;
        margin: 10px 0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .swagger-ui .opblock {
        margin: 5px 0;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
      }
      
      .swagger-ui .btn.authorize {
        background: #3182ce;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 500;
      }
      
      .swagger-ui .btn.execute {
        background: #38a169;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 500;
      }
      
      .swagger-ui .btn.try-out__btn {
        background: #ed8936;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
      }
      
      .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #38a169; }
      .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #3182ce; }
      .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #ed8936; }
      .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #805ad5; }
      .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #e53e3e; }
    `,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API: http://localhost:${port}`);
  console.log(`📚 Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
