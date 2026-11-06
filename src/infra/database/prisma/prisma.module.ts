import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaTransactionManager } from '../protocols/PrismaTransactionManager';
import { ITransactionManager } from '../protocols/ITransaction-manager';

@Global()
@Module({
  exports: [PrismaService, ITransactionManager],
  providers: [
    PrismaService,
    {
      provide: ITransactionManager,
      useClass: PrismaTransactionManager,
    },
  ],
})
export class PrismaModule {}
