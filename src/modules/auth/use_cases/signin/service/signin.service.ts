import { Refresh_Tokens } from '@modules/auth/refresh_token/shared/models/refresh-tokens';
import { IRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/abstract_class/irefresh-tokens-repository';
import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { AppError } from '@modules/utils/app_error';
import { generateHash } from '@modules/utils/functions';
import { entity_name } from '@modules/utils/types/types';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';

interface ISignInRequest {
  email: string;
  password: string;
}

export interface ISelectEntityResponse {
  mfa_required: boolean;
  mfa_token?: string;
  access_token?: string;
  refresh_token?: string;
}

@Injectable()
export class SignInService {
  constructor(
    private readonly user_repository: IUserRepository,
    private readonly jwt_service: JwtService,
    private readonly refresh_token_repository: IRefreshTokensRepository,
  ) {}

  public async execute({
    email,
    password,
  }: ISignInRequest): Promise<ISelectEntityResponse> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.user_repository.find_by_email(normalizedEmail);
    if (!user) throw new AppError('Credenciais inválidas', 401);
    if (user.status.toLowerCase() !== 'ativo')
      throw new AppError('Credenciais inválidas', 401);
    const validPassword = await argon2.verify(user.password_hash, password);
    if (!validPassword) throw new AppError('Credenciais inválidas', 401);
    if (user.mfa_required) {
      const mfa_token = this.jwt_service.sign(
        {
          sub: user.id,
          type: 'mfa',
          mfa_pending: true,
          iss: 'saas-auth',
        },
        {
          expiresIn: '10m',
        },
      );
      //mandar email
      return {
        mfa_required: true,
        mfa_token: mfa_token,
      };
    } else {
      const mfa_token = this.jwt_service.sign(
        {
          sub: user.id,
          email: user.email,
          name: user.name,
          mfa_required: user.mfa_required,
          type: 'access',
          mfa_pending: false,
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
      await this.refresh_token_repository.create(refreshToken);
      return {
        mfa_required: false,
        access_token: mfa_token,
        refresh_token: refresh_token,
      };
    }
  }
}
