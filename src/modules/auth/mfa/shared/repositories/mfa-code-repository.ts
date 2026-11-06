import { Injectable } from '@nestjs/common';
import { IMFACodeRepository } from './abstract_class/imfa-code-repository';
import { MFA_Code } from '../models/mfa_code';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { MFACodeMapper } from 'infra/database/mappers/MFACodeMapper';
import { PrismaTransactionManager } from 'infra/database/protocols/PrismaTransactionManager';

@Injectable()
class MFACodeRepository implements IMFACodeRepository {
  constructor(private prisma: PrismaService) {}

  private getClient() {
    return PrismaTransactionManager.getClient(this.prisma);
  }

  async create(data: MFA_Code): Promise<void> {
    const raw = MFACodeMapper.toPrisma(data);
    await this.getClient().mfaCode.create({
      data: raw,
    });
  }

  async update_used(id: string): Promise<void> {
    await this.getClient().mfaCode.update({
      where: {
        id: id,
      },
      data: {
        used_at: true,
      },
    });
  }

  async update(data: MFA_Code): Promise<void> {
    const raw = MFACodeMapper.toPrisma(data);
    await this.getClient().mfaCode.update({
      where: {
        id: data.id,
      },
      data: raw,
    });
  }

  async find_one(
    user_id: string,
    used: boolean,
    now: Date,
  ): Promise<MFA_Code | null> {
    const mfa_code = await this.getClient().mfaCode.findFirst({
      where: {
        user_id: user_id,
        used_at: used,
        expires_at: {
          gt: now,
        },
      },
    });
    if (!mfa_code) return null;
    return MFACodeMapper.toDomain(mfa_code);
  }

  async find_one_code_and_expires_at(
    code: string,
    used: boolean,
    now: Date,
  ): Promise<MFA_Code | null> {
    const mfa_code = await this.getClient().mfaCode.findFirst({
      where: {
        code: code,
        used_at: used,
        expires_at: {
          gt: now,
        },
      },
    });
    if (!mfa_code) return null;
    return MFACodeMapper.toDomain(mfa_code);
  }
}

export { MFACodeRepository };
