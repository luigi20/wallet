import { Injectable } from '@nestjs/common';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IUserRepository } from './abstract_class/IUser-repository';
import { User } from '../models/user';
import { UserMapper } from 'infra/database/mappers/UserMapper';

@Injectable()
class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}
  async update_last_login_at(id: string, last_login_at: Date): Promise<void> {
    await this.prisma.getPrismaClient().user.update({
      where: {
        id: id,
      },
      data: {
        last_login_at: last_login_at,
      },
    });
  }
  async find_by_email(email: string): Promise<User | null> {
    const user = await this.prisma.getPrismaClient().user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  async find_by_id(id: string): Promise<User | null> {
    const user = await this.prisma.getPrismaClient().user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) return null;
    return UserMapper.toDomain(user);
  }
  async create(data: User, tx?: Prisma.TransactionClient): Promise<void> {
    const raw = UserMapper.toPrisma(data);
    const client = tx ?? this.prisma;
    await client.user.create({
      data: raw,
    });
  }

  async update(data: User, tx?: Prisma.TransactionClient): Promise<void> {
    const raw = UserMapper.toPrisma(data);
    const client = tx ?? this.prisma;
    await client.user.update({
      data: raw,
    });
  }

  async set_update_mfa_required(
    user_id: string,
    mfa_required: boolean,
  ): Promise<void> {
    await this.prisma.getPrismaClient().user.update({
      where: {
        id: user_id,
      },
      data: {
        mfa_required: mfa_required,
      },
    });
  }
}

export { UserRepository };
