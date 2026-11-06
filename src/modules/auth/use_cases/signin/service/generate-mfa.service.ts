import { MFA_Code } from '@modules/auth/mfa/shared/models/mfa_code';
import { IMFACodeRepository } from '@modules/auth/mfa/shared/repositories/abstract_class/imfa-code-repository';
import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { AppError } from '@modules/utils/app_error';
import {
  generateCode,
  generateSecurityCodeEmailHtml,
} from '@modules/utils/functions';
import { Injectable } from '@nestjs/common';
import { IEmailService } from 'infra/email/abstract class/IEmailService';

interface IGenerateMFARequest {
  email: string;
  type: string;
}

@Injectable()
export class GenerateMFAService {
  constructor(
    private readonly mfa_code_repository: IMFACodeRepository,
    private readonly user_repository: IUserRepository,
    private readonly email_service: IEmailService,
  ) {}

  async execute({ email, type }: IGenerateMFARequest): Promise<void> {
    const user_exists = await this.user_repository.find_by_email(email);
    if (!user_exists) throw new AppError('Credenciais inválidas');
    const generate_code = generateCode();
    const mfa = new MFA_Code({
      code: generate_code,
      used_at: false,
      attempts: 0,
      user_id: user_exists.id,
      type: type,
    });
    await this.mfa_code_repository.create(mfa);
    this.email_service
      .send({
        to: user_exists.email,
        subject: 'Código para acesso à sua conta',
        html: generateSecurityCodeEmailHtml({ code: mfa.code }),
      })
      .catch((error) => {
        console.error('Erro ao enviar e-mail:', error);
      });
  }
}
