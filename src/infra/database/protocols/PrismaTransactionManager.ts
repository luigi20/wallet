// src/modules/infra/database/prisma-transaction-manager.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Prisma, PrismaClient } from '@prisma/client';
import { ITransactionManager } from './ITransaction-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaTransactionManager implements ITransactionManager {
  private static storage = new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.prisma.getPrismaClient().$transaction(async (tx) => {
      return PrismaTransactionManager.storage.run(tx, async () => {
        return await fn();
      });
    });
  }

  static getClient(
    defaultClient: PrismaService,
  ): Prisma.TransactionClient | PrismaClient {
    return (
      PrismaTransactionManager.storage.getStore() ||
      defaultClient.getPrismaClient()
    );
  }
}
