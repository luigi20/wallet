import { Module } from '@nestjs/common';
import { HealthController } from './controller/health.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [],
  exports: [],
})
export class HealthModule {}
