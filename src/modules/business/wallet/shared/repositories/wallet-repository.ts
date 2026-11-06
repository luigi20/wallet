import { Injectable } from '@nestjs/common';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { IWalletRepository } from './abstract_class/IWallet-repository';
import { WalletMapper } from 'infra/database/mappers/WalletMapper';
import { Wallet } from '../models/wallet';
import { PrismaTransactionManager } from 'infra/database/protocols/PrismaTransactionManager';

@Injectable()
class WalletRepository implements IWalletRepository {
  constructor(private prisma: PrismaService) {}

  private getClient() {
    return PrismaTransactionManager.getClient(this.prisma);
  }

  async decrement(wallet_id: string, amount: number): Promise<boolean> {
    const result = await this.getClient().wallet.updateMany({
      where: {
        id: wallet_id,
        balance: {
          gte: amount,
        },
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });
    return result.count > 0;
  }

  async increment(wallet_id: string, amount: number): Promise<void> {
    await this.getClient().wallet.updateMany({
      where: { id: wallet_id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  async find_by_id(id: string): Promise<Wallet | null> {
    const wallet = await this.getClient().wallet.findUnique({
      where: {
        id: id,
      },
    });
    if (!wallet) return null;
    return WalletMapper.toDomain(wallet);
  }

  async find_by_user_id(user_id: string): Promise<Wallet | null> {
    const wallet = await this.getClient().wallet.findFirst({
      where: {
        user_id: user_id,
      },
    });
    if (!wallet) return null;
    return WalletMapper.toDomain(wallet);
  }

  async create(data: Wallet): Promise<void> {
    const raw = WalletMapper.toPrisma(data);
    await this.getClient().wallet.create({
      data: raw,
    });
  }

  async update(data: Wallet): Promise<void> {
    const raw = WalletMapper.toPrisma(data);
    await this.getClient().wallet.update({
      where: { id: data.id },
      data: raw,
    });
  }
}

export { WalletRepository };
