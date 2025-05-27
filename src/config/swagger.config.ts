import { ApiResponseDto } from '@common/interfaces/api-response.interface';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Tender API')
    .setDescription('The Tender API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: 'Default JWT Authorization',
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'authorization',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Roles', 'User roles management endpoints')
    .addTag('Tenders', 'Tenders management endpoints')
    .addTag('Evaluation', 'Tenders evaluation endpoints')
    .addTag('File', 'Tenders file endpoints')
    .addTag('Proposals', 'Tenders proposals endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    extraModels: [ApiResponseDto],
  });

  // Customize Swagger UI
  const customOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Tender API Documentation',
  };

  SwaggerModule.setup('api/docs', app, document, customOptions);
}
