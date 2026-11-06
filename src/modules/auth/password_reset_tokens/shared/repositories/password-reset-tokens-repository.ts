import { Injectable } from '@nestjs/common';
import { IPasswordResetTokensRepository } from './abstract_class/ipassword-reset-tokens-repository';
import { Password_Reset_Tokens } from '../models/password-reset-tokens';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { PasswordResetTokensMapper } from 'infra/database/mappers/PasswordResetTokensMapper';

@Injectable()
class PasswordResetTokensRepository implements IPasswordResetTokensRepository {
  constructor(private prisma: PrismaService) {}
  async create(data: Password_Reset_Tokens): Promise<void> {
    const raw = PasswordResetTokensMapper.toPrisma(data);
    await this.prisma.getPrismaClient().passwordResetToken.create({
      data: raw,
    });
  }

  async find_one(
    user_id: string,
    used: boolean,
    now: Date,
  ): Promise<Password_Reset_Tokens | null> {
    const password_reset_token = await this.prisma
      .getPrismaClient()
      .passwordResetToken.findFirst({
        where: {
          user_id: user_id,
          used_at: used,
          expires_at: {
            gt: now,
          },
        },
      });
    if (!password_reset_token) return null;
    return PasswordResetTokensMapper.toDomain(password_reset_token);
  }

  async find_valid(
    user_id: string,
    now: Date,
  ): Promise<Password_Reset_Tokens[]> {
    const records = await this.prisma
      .getPrismaClient()
      .passwordResetToken.findMany({
        where: { user_id, used_at: false, expires_at: { gt: now } },
        orderBy: { created_at: 'desc' },
      });
    return records.map((record) => PasswordResetTokensMapper.toDomain(record));
  }

  async update_used(id: string): Promise<void> {
    await this.prisma.getPrismaClient().passwordResetToken.update({
      where: {
        id: id,
      },
      data: {
        used_at: true,
      },
    });
  }
}
export { PasswordResetTokensRepository };
