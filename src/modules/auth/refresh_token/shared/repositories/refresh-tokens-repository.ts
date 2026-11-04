import { Injectable } from '@nestjs/common';
import { IRefreshTokensRepository } from './abstract_class/irefresh-tokens-repository';
import { Refresh_Tokens } from '../models/refresh-tokens';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { RefreshTokensMapper } from 'infra/database/mappers/RefreshTokensMapper';
import { PasswordResetTokensMapper } from 'infra/database/mappers/PasswordResetTokensMapper';

@Injectable()
class RefreshTokensRepository implements IRefreshTokensRepository {
  constructor(private prisma: PrismaService) {}
  async create(data: Refresh_Tokens): Promise<void> {
    const raw = RefreshTokensMapper.toPrisma(data);
    await this.prisma.getPrismaClient().refreshToken.create({
      data: raw,
    });
  }

  async find_by_hash(token_hash: string): Promise<string | null> {
    const refresh_hash = await this.prisma
      .getPrismaClient()
      .refreshToken.findFirst({
        where: {
          token_hash: token_hash,
        },
        select: {
          id: true,
        },
      });
    if (!refresh_hash) return null;
    return refresh_hash.id;
  }

  async find_one(
    user_id: string,
    revoked: boolean,
    now: Date,
  ): Promise<Refresh_Tokens | null> {
    const refresh_hash = await this.prisma
      .getPrismaClient()
      .refreshToken.findFirst({
        where: {
          user_id: user_id,
          revoked_at: revoked,
          expires_at: {
            gt: now,
          },
        },
      });
    if (!refresh_hash) return null;
    return RefreshTokensMapper.toDomain(refresh_hash);
  }

  async update_revoked(id: string): Promise<void> {
    await this.prisma.getPrismaClient().refreshToken.update({
      where: {
        id: id,
      },
      data: {
        revoked_at: true,
      },
    });
  }
}

export { RefreshTokensRepository };
