import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from 'infra/interceptors/logging.interceptor';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';

let cachedServer: any;

async function bootstrapServer() {
  if (!cachedServer) {
    const expressApp = express();

    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    const winstonInstance = app.get(WINSTON_MODULE_PROVIDER);
    app.useLogger(new WinstonLogger(winstonInstance));
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.enableCors({
      origin: [process.env.FRONTEND_LOCAL],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Transaction Wallet API')
        .setDescription(
          'API para gerenciamento de autenticação e transferências.',
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
        .addTag('Transaction', 'Operações para transações de carteira')
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'Transaction Wallet API',
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
