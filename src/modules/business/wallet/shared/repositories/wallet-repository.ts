import { Injectable } from '@nestjs/common';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IWalletRepository } from './abstract_class/IWallet-repository';
import { WalletMapper } from 'infra/database/mappers/WalletMapper';
import { Wallet } from '../models/wallet';

@Injectable()
class WalletRepository implements IWalletRepository {
  constructor(private prisma: PrismaService) {}

  async find_by_id(id: string): Promise<Wallet | null> {
    const wallet = await this.prisma.getPrismaClient().wallet.findUnique({
      where: {
        id: id,
      },
    });
    if (!wallet) return null;
    return WalletMapper.toDomain(wallet);
  }

  async find_by_user_id(user_id: string): Promise<Wallet | null> {
    const wallet = await this.prisma.getPrismaClient().wallet.findFirst({
      where: {
        user_id: user_id,
      },
    });
    if (!wallet) return null;
    return WalletMapper.toDomain(wallet);
  }
  async create(data: Wallet): Promise<void> {
    const raw = WalletMapper.toPrisma(data);
    await this.prisma.getPrismaClient().wallet.create({
      data: raw,
    });
  }

  async update(data: Wallet): Promise<void> {
    const raw = WalletMapper.toPrisma(data);
    await this.prisma.getPrismaClient().wallet.update({
      where: { id: data.id },
      data: raw,
    });
  }
}

export { WalletRepository };
