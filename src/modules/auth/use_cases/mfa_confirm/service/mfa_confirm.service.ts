import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';
import { IMFACodeRepository } from '@modules/auth/mfa/shared/repositories/abstract_class/imfa-code-repository';
import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { ITransactionManager } from 'infra/database/protocols/ITransaction-manager';

interface IMFAConfirmRequest {
  email: string;
  mfa_code: string;
  enabled_mfa: boolean;
}

@Injectable()
export class MFAConfirmService {
  constructor(
    private readonly user_repository: IUserRepository,
    private readonly mfa_code_repository: IMFACodeRepository,
    private readonly transactionManager: ITransactionManager,
  ) {}

  public async execute({
    email,
    mfa_code,
    enabled_mfa,
  }: IMFAConfirmRequest): Promise<string> {
    const user = await this.user_repository.find_by_email(
      email.toLowerCase().trim(),
    );
    if (!user) throw new AppError('Credenciais inválidas');
    const mfa = await this.mfa_code_repository.find_one(
      user.id,
      false,
      new Date(),
    );
    if (!mfa) throw new AppError('MFA inválido ou já usado', 404);
    if (mfa.code !== mfa_code) throw new AppError('Código do MFA inválido');
    mfa.used_at = true;
    mfa.attempts = mfa.attempts + 1;
    user.mfa_required = enabled_mfa;
    await this.transactionManager.execute(async () => {
      await this.mfa_code_repository.update_used(mfa.id);
      await this.user_repository.set_update_mfa_required(user.id, enabled_mfa);
    });

    return 'MFA atualizado com sucesso';
  }
}
