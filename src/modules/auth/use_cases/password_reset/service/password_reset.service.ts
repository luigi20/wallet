import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { IPasswordResetTokensRepository } from '@modules/auth/password_reset_tokens/shared/repositories/abstract_class/ipassword-reset-tokens-repository';
import { userPasswordValidator } from '@modules/utils/functions';
import { IIdentityRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { IIdentityCredentialRepository } from '@modules/auth/identity_credential/shared/repositories/abstract_class/iidentitycredential-repository';

interface IPasswordReset {
  email: string;
  token: string;
  new_password: string;
}

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly identity_repository: IIdentityRepository,
    private readonly password_reset_tokens_repository: IPasswordResetTokensRepository,
    private readonly identity_credential_repository: IIdentityCredentialRepository,
  ) {}

  public async execute({
    email,
    token,
    new_password,
  }: IPasswordReset): Promise<string> {
    const password_validator = userPasswordValidator();
    const errors = password_validator.validate(new_password, {
      list: true,
    });
    if (Array.isArray(errors) && errors.length > 0)
      throw new AppError('Senha inválida', 400);
    const identity = await this.identity_repository.find_by_email(
      email.toLowerCase().trim(),
    );
    if (!identity) throw new AppError('Email não encontrado', 404);
    const identity_credential =
      await this.identity_credential_repository.find_by_provider(
        'local',
        identity.id,
      );
    if (!identity_credential) throw new AppError('Credencial não existe', 404);
    const token_record = await this.password_reset_tokens_repository.find_one(
      identity.id,
      false,
      new Date(),
    );
    if (!token_record) throw new AppError('Token inválido ou expirado');
    const token_valid = await argon2.verify(token_record.token_hash, token);
    if (!token_valid) throw new AppError('Token inválido');
    const new_hash = await argon2.hash(new_password);
    await this.identity_credential_repository.update_password(
      identity.id,
      new_hash,
    );
    await this.password_reset_tokens_repository.update_used(token_record.id);
    return 'Senha atualizada com sucesso';
  }
}
