import { Refresh_Tokens } from '@modules/auth/refresh_token/shared/models/refresh-tokens';
import { IRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/abstract_class/irefresh-tokens-repository';
import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { AppError } from '@modules/utils/app_error';
import { generateHash } from '@modules/utils/functions';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITransactionManager } from 'infra/database/protocols/ITransaction-manager';

interface IRefreshTokenPayload {
  sub: string;
  type: 'refresh';
  iss: string;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwt_service: JwtService,
    private readonly user_repository: IUserRepository,
    private readonly refresh_token_repository: IRefreshTokensRepository,
    private readonly transactionManager: ITransactionManager,
  ) {}

  async execute(
    refresh_token: string,
  ): Promise<{ access_token: string; new_refresh_token: string }> {
    if (!refresh_token) throw new AppError('Refresh token ausente', 401);
    let payload: IRefreshTokenPayload;
    try {
      payload = this.jwt_service.verify<IRefreshTokenPayload>(refresh_token, {
        algorithms: ['RS256'],
        issuer: 'saas-auth',
      });
    } catch {
      throw new AppError('Refresh token inválido ou expirado', 401);
    }
    if (
      payload.type !== 'refresh' ||
      !payload.sub ||
      payload.iss !== 'saas-auth'
    )
      throw new AppError('Refresh token inválido', 401);
    const refresh_token_active =
      await this.refresh_token_repository.find_active_by_hash(
        generateHash(refresh_token),
        new Date(),
      );
    if (
      !refresh_token_active ||
      refresh_token_active.user_id !== payload.sub ||
      refresh_token_active.revoked_at
    )
      throw new AppError('Refresh token revogado ou inválido', 401);
    const user = await this.user_repository.find_by_id(payload.sub);
    if (!user || user.status.toLowerCase() !== 'ativo')
      throw new AppError('Credenciais inválidas', 401);
    const access_token = this.jwt_service.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        mfa_required: user.mfa_required,
        type: 'access',
        iss: 'saas-auth',
      },
      {
        expiresIn: '15m',
      },
    );
    const new_refresh_token = this.jwt_service.sign(
      {
        sub: user.id,
        type: 'refresh',
        iss: 'saas-auth',
      },
      {
        expiresIn: '7d',
      },
    );
    const token_hash = generateHash(new_refresh_token);
    const refreshToken = new Refresh_Tokens({
      user_id: user.id,
      token_hash,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked_at: false,
    });
    await this.transactionManager.execute(async () => {
      await this.refresh_token_repository.update_revoked(
        refresh_token_active.id,
      );
      await this.refresh_token_repository.create(refreshToken);
    });
    return { access_token, new_refresh_token };
  }
}
