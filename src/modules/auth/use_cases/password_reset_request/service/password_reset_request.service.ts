import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import argon2 from 'argon2';
import { Password_Reset_Tokens } from '@modules/auth/password_reset_tokens/shared/models/password-reset-tokens';
import { IPasswordResetTokensRepository } from '@modules/auth/password_reset_tokens/shared/repositories/abstract_class/ipassword-reset-tokens-repository';
import { IIdentityRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { IEmailService } from 'infra/email/abstract class/IEmailService';
import { PasswordResetEmailTemplate } from '@modules/utils/functions';

interface IPasswordResetRequest {
  email: string;
}

@Injectable()
export class PasswordResetRequestService {
  constructor(
    private readonly identity_repository: IIdentityRepository,
    private readonly password_reset_tokens_repository: IPasswordResetTokensRepository,
    private readonly email_service: IEmailService,
  ) {}

  public async execute({ email }: IPasswordResetRequest): Promise<string> {
    const identity_exists = await this.identity_repository.find_by_email(
      email.toLowerCase().trim(),
    );
    if (!identity_exists) throw new AppError('Usuário não existe', 404);
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(token);
    const password_reset_tokens = new Password_Reset_Tokens({
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
      used_at: false,
      token_hash: tokenHash,
      user_id: identity_exists.id,
    });
    await this.password_reset_tokens_repository.create(password_reset_tokens);
    this.email_service
      .send({
        to: identity_exists.email,
        subject: 'Redefinição de senha',
        html: PasswordResetEmailTemplate({
          token,
        }),
      })
      .catch((error) => {
        console.error('Erro ao enviar e-mail de redefinição de senha:', error);
      });
    return 'Email foi enviado';
  }
}
