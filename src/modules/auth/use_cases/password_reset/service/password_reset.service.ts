import { AppError } from '@modules/utils/app_error';
import { Password_Reset_Tokens } from '@modules/auth/password_reset_tokens/shared/models/password-reset-tokens';
import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { IPasswordResetTokensRepository } from '@modules/auth/password_reset_tokens/shared/repositories/abstract_class/ipassword-reset-tokens-repository';
import { userPasswordValidator } from '@modules/utils/functions';
import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { ITransactionManager } from 'infra/database/protocols/ITransaction-manager';

interface IPasswordReset {
  email: string;
  token: string;
  new_password: string;
}

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly user_repository: IUserRepository,
    private readonly password_reset_tokens_repository: IPasswordResetTokensRepository,
    private readonly transactionManager: ITransactionManager,
  ) {}

  public async execute({
    email,
    token,
    new_password,
  }: IPasswordReset): Promise<string> {
    const errors = userPasswordValidator().validate(new_password, {
      list: true,
    });
    if (Array.isArray(errors) && errors.length > 0)
      throw new AppError('Senha inválida', 400);
    const user = await this.user_repository.find_by_email(
      email.toLowerCase().trim(),
    );
    if (!user) throw new AppError('Token inválido ou expirado', 401);
    const tokenRecords = await this.password_reset_tokens_repository.find_valid(
      user.id,
      new Date(),
    );
    let tokenRecord: Password_Reset_Tokens | null = null;
    for (const candidate of tokenRecords) {
      if (await argon2.verify(candidate.token_hash, token)) {
        tokenRecord = candidate;
        break;
      }
    }
    if (!tokenRecord) throw new AppError('Token inválido ou expirado', 401);
    const passwordHash = await argon2.hash(new_password, {
      type: argon2.argon2id,
    });
    await this.transactionManager.execute(async () => {
      await this.user_repository.set_password_hash(user.id, passwordHash);
      await this.password_reset_tokens_repository.update_used(tokenRecord.id);
    });
    return 'Senha atualizada com sucesso';
  }
}
