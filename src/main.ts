import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let cachedServer: any;

async function bootstrapServer() {
  if (!cachedServer) {
    const expressApp = express();

    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    /**
     * CORS
     */
    app.enableCors({
      origin: [process.env.FRONTEND_LOCAL_BARBESHOP],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    /**
     * Validation
     */
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    /**
     * Swagger
     *
     * Swagger somente em desenvolvimento.
     * Em produção a rota /docs não será registrada.
     */
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Barbershop API')
        .setDescription(
          'API para gerenciamento de autenticação, perfis, entidades, membros, clientes, planos e assinaturas.',
        )
        .setVersion('1.0.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Informe o Access Token JWT.',
          },
          'access-token',
        )
        .addTag('Auth', 'Autenticação e gerenciamento de acesso')
        .addTag('MFA', 'Autenticação multifator')
        .addTag('Profile', 'Gerenciamento de perfil')
        .addTag('Entity', 'Gerenciamento de entidades')
        .addTag('Entity Membership', 'Gerenciamento de membros das entidades')
        .addTag('Entity Customer', 'Gerenciamento de clientes das entidades')
        .addTag('Plan', 'Gerenciamento de planos')
        .addTag('Subscription', 'Gerenciamento de assinaturas')
        .build();

      const document = SwaggerModule.createDocument(app, config);

      SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'Barbershop API',
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
      });
    }

    await app.init();

    cachedServer = serverless(expressApp);
  }

  return cachedServer;
}

export const handler = async (event: any, context: any) => {
  const server = await bootstrapServer();

  return server(event, context);
};
