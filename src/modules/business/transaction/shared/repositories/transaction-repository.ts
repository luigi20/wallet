import { Injectable } from '@nestjs/common';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { ITransactionRepository } from './abstract_class/ITransaction-repository';
import { Transaction } from '../models/transaction';
import { TransactionMapper } from 'infra/database/mappers/TransactionMapper';
import { PrismaTransactionManager } from 'infra/database/protocols/PrismaTransactionManager';

@Injectable()
class TransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaService) {}

  private getClient() {
    return PrismaTransactionManager.getClient(this.prisma);
  }

  async update_status_conditional(
    id: string,
    current_status: string,
    new_status: string,
  ): Promise<Transaction> {
    const result = await this.getClient().transaction.update({
      where: {
        id: id,
        status: current_status,
      },
      data: {
        status: new_status,
      },
    });
    return TransactionMapper.toDomain(result);
  }

  async create(data: Transaction): Promise<void> {
    const raw = TransactionMapper.toPrisma(data);
    await this.getClient().transaction.create({
      data: raw,
    });
  }

  async update(data: Transaction): Promise<void> {
    const raw = TransactionMapper.toPrisma(data);
    await this.getClient().transaction.update({
      data: raw,
      where: {
        id: raw.id,
      },
    });
  }

  async find_by_id(id: string): Promise<Transaction | null> {
    const transaction = await this.getClient().transaction.findUnique({
      where: {
        id: id,
      },
    });
    if (!transaction) return null;
    return TransactionMapper.toDomain(transaction);
  }

  async find_by_wallet_id(wallet_id: string): Promise<Transaction[]> {
    const transactions = await this.getClient().transaction.findMany({
      where: {
        OR: [
          {
            sender_wallet_id: wallet_id,
          },
          { receiver_wallet_id: wallet_id },
          { receiver_wallet_id: wallet_id },
        ],
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return transactions.map((item) => TransactionMapper.toDomain(item));
  }
}
export { TransactionRepository };
