import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { IMFACodeRepository } from '@modules/auth/mfa/shared/repositories/abstract_class/imfa-code-repository';
import { Refresh_Tokens } from '@modules/auth/refresh_token/shared/models/refresh-tokens';
import { IRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/abstract_class/irefresh-tokens-repository';
import { AppError } from '@modules/utils/app_error';
import { generateHash } from '@modules/utils/functions';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITransactionManager } from 'infra/database/protocols/ITransaction-manager';

interface IRequest {
  code: string;
  mfa_token: string;
}

interface IMFATokenPayload {
  sub: string;
  type: string;
  mfa_required: boolean;
  iss: string;
}

@Injectable()
export class ValidateMFAService {
  constructor(
    private readonly mfa_code_repository: IMFACodeRepository,
    private readonly user_repository: IUserRepository,
    private readonly jwt_service: JwtService,
    private readonly refresh_token_repository: IRefreshTokensRepository,
    private readonly transactionManager: ITransactionManager,
  ) {}

  async execute({ code, mfa_token }: IRequest): Promise<{
    access_token: string;
    mfa_required: boolean;
    refresh_token: string;
  }> {
    let payload: IMFATokenPayload;
    try {
      payload = this.jwt_service.verify<IMFATokenPayload>(mfa_token, {
        algorithms: ['RS256'],
        issuer: 'saas-auth',
      });
    } catch {
      throw new AppError('Token inválido ou expirado', 401);
    }
    if (
      payload.type !== 'mfa' ||
      payload.mfa_required !== true ||
      payload.iss !== 'saas-auth' ||
      !payload.sub
    )
      throw new AppError('MFA inválido ou expirado', 401);
    const mfa = await this.mfa_code_repository.find_one(
      payload.sub,
      false,
      new Date(),
    );
    if (!mfa || mfa.attempts >= 2)
      throw new AppError('MFA inválido ou expirado', 401);
    if (mfa.code !== code) {
      mfa.attempts += 1;
      await this.mfa_code_repository.update(mfa);
      throw new AppError('Código do MFA inválido', 401);
    }
    const user = await this.user_repository.find_by_id(payload.sub);
    if (!user) throw new AppError('Usuário não encontrado', 404);
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
    const refresh_token = this.jwt_service.sign(
      {
        sub: user.id,
        type: 'refresh',
        iss: 'saas-auth',
      },
      {
        expiresIn: '7d',
      },
    );
    const token_hash = generateHash(refresh_token);
    const refreshToken = new Refresh_Tokens({
      user_id: user.id,
      token_hash,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked_at: false,
    });
    await this.transactionManager.execute(async () => {
      await this.mfa_code_repository.update_used(mfa.id);
      await this.refresh_token_repository.create(refreshToken);
      await this.user_repository.update_last_login_at(user.id, new Date());
    });
    return {
      access_token,
      mfa_required: true,
      refresh_token,
    };
  }
}
