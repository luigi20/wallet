import { IRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/abstract_class/irefresh-tokens-repository';
import { AppError } from '@modules/utils/app_error';
import { generateHash } from '@modules/utils/functions';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LogoutService {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokensRepository,
  ) {}

  async execute(refresh_token: string): Promise<void> {
    const token_hash = generateHash(refresh_token);
    const token = await this.refreshTokenRepository.find_by_hash(token_hash);
    if (!token) throw new AppError('Token inválido');
    await this.refreshTokenRepository.update_revoked(token);
  }
}
