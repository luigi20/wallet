import { Injectable } from '@nestjs/common';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ITransactionRepository } from './abstract_class/ITransaction-repository';
import { Transaction } from '../models/transaction';
import { TransactionMapper } from 'infra/database/mappers/TransactionMapper';

@Injectable()
class TransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Transaction): Promise<void> {
    const raw = TransactionMapper.toPrisma(data);
    await this.prisma.getPrismaClient().transaction.create({
      data: raw,
    });
  }

  async update(data: Transaction): Promise<void> {
    const raw = TransactionMapper.toPrisma(data);
    await this.prisma.getPrismaClient().transaction.update({
      data: raw,
      where: {
        id: raw.id,
      },
    });
  }

  async find_by_id(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma
      .getPrismaClient()
      .transaction.findUnique({
        where: {
          id: id,
        },
      });
    if (!transaction) return null;
    return TransactionMapper.toDomain(transaction);
  }
}

export { TransactionRepository };
