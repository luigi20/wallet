import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';
import { IIdentityRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { IMFACodeRepository } from '@modules/auth/mfa/shared/repositories/abstract_class/imfa-code-repository';

interface IMFAConfirmRequest {
  email: string;
  mfa_code: string;
  enabled_mfa: boolean;
}

@Injectable()
export class MFAConfirmService {
  constructor(
    private readonly identity_repository: IIdentityRepository,
    private readonly mfa_code_repository: IMFACodeRepository,
  ) {}

  public async execute({
    email,
    mfa_code,
    enabled_mfa,
  }: IMFAConfirmRequest): Promise<string> {
    const identity = await this.identity_repository.find_by_email(
      email.toLowerCase().trim(),
    );
    if (!identity) throw new AppError('Credenciais inválidas');
    const mfa = await this.mfa_code_repository.find_one(
      identity.id,
      false,
      new Date(),
    );
    if (!mfa) throw new AppError('MFA inválido ou já usado', 404);
    if (mfa.code !== mfa_code) throw new AppError('Código do MFA inválido');
    mfa.used_at = true;
    mfa.attempts = mfa.attempts + 1;
    await this.mfa_code_repository.update_used(mfa.id);
    identity.mfa_required = enabled_mfa;
    await this.identity_repository.set_update_mfa_required(
      identity.id,
      enabled_mfa,
    );
    return 'MFA atualizado com sucesso';
  }
}
