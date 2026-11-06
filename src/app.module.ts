import { AuthModule } from '@modules/auth/use_cases/auth.module';
import { BusinessModule } from '@modules/business/use_cases/business.module';
import { HealthModule } from '@modules/health/health.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'infra/database/prisma/prisma.module';
import { WinstonModule, utilities as nestWinstonUtilities } from 'nest-winston';
import * as winston from 'winston';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Janela de tempo de 1 minuto
        limit: 100, // Máximo de 100 pedidos por IP por minuto globalmente
      },
    ]),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonUtilities.format.nestLike('Wallet API', {
              colors: true, // Mantém as cores padrão do NestJS no terminal
            }),
          ),
        }),
        // Opcional: Guardar logs de erro num ficheiro local
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          level: 'info', // Regista tudo (info, warn, error)
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    AuthModule,
    PrismaModule,
    BusinessModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Aplica o limite de tráfego globalmente
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {}
}
