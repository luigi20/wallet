import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';
import { IMFACodeRepository } from '@modules/auth/mfa/shared/repositories/abstract_class/imfa-code-repository';
import { MFA_Code } from '@modules/auth/mfa/shared/models/mfa_code';
import { generateCode } from '@modules/utils/functions';
import { IIdentityRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { IEmailService } from 'infra/email/abstract class/IEmailService';

interface IMFARequest {
  email: string;
}

@Injectable()
export class MFARequestService {
  constructor(
    private readonly mfa_code_repository: IMFACodeRepository,
    private readonly identity_repository: IIdentityRepository,
    private readonly email_service: IEmailService,
  ) {}

  public async execute({ email }: IMFARequest): Promise<string> {
    const identity_exists = await this.identity_repository.find_by_email(
      email.toLowerCase().trim(),
    );
    if (!identity_exists) throw new AppError('Credenciais inválidas');
    const generate_code = generateCode();
    const mfa_code = new MFA_Code({
      code: generate_code,
      used_at: false,
      attempts: 0,
      user_id: identity_exists.id,
      type: 'login',
    });
    await this.mfa_code_repository.create(mfa_code);
    this.email_service
      .send({
        to: email,
        subject: 'Codigo para ativar/desativar MFA',
        html: `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Código de segurança</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f4f4f5;
          font-family: Arial, Helvetica, sans-serif;
          color: #18181b;
        "
      >
        <div
          style="
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          "
        >

          <!-- Header -->
          <div
            style="
              background-color: #18181b;
              padding: 32px;
              text-align: center;
            "
          >
            <h1
              style="
                margin: 0;
                color: #ffffff;
                font-size: 26px;
                font-weight: 700;
              "
            >
              Segurança da sua conta 🔐
            </h1>

            <p
              style="
                margin: 10px 0 0;
                color: #d4d4d8;
                font-size: 15px;
              "
            >
              Código para alterar as configurações de MFA
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 32px;">

            <p
              style="
                margin: 0 0 20px;
                font-size: 18px;
                line-height: 1.6;
              "
            >
              Olá!
            </p>

            <p
              style="
                margin: 0 0 24px;
                color: #52525b;
                font-size: 15px;
                line-height: 1.7;
              "
            >
              Recebemos uma solicitação para alterar as configurações
              de autenticação multifator (MFA) da sua conta.
            </p>

            <p
              style="
                margin: 0 0 24px;
                color: #52525b;
                font-size: 15px;
                line-height: 1.7;
              "
            >
              Para confirmar que essa solicitação foi realizada por
              você, informe o código de segurança abaixo:
            </p>

            <!-- Code -->
            <div
              style="
                margin: 32px 0;
                padding: 28px 20px;
                background-color: #fafafa;
                border: 1px solid #e4e4e7;
                border-radius: 10px;
                text-align: center;
              "
            >
              <p
                style="
                  margin: 0 0 12px;
                  color: #71717a;
                  font-size: 13px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                "
              >
                Código de segurança
              </p>

              <div
                style="
                  font-size: 36px;
                  font-weight: 700;
                  letter-spacing: 10px;
                  color: #18181b;
                "
              >
                ${mfa_code.code}
              </div>
            </div>

            <!-- Warning -->
            <div
              style="
                background-color: #fff7ed;
                border: 1px solid #fed7aa;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 24px;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #9a3412;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                <strong>Importante:</strong> nunca compartilhe
                este código com outras pessoas.
              </p>
            </div>

            <p
              style="
                margin: 0;
                color: #71717a;
                font-size: 13px;
                line-height: 1.6;
              "
            >
              Se você não solicitou essa alteração, ignore este
              e-mail e recomendamos verificar imediatamente a
              segurança da sua conta.
            </p>

          </div>

          <!-- Footer -->
          <div
            style="
              border-top: 1px solid #e4e4e7;
              padding: 24px 32px;
              text-align: center;
            "
          >
            <p
              style="
                margin: 0;
                color: #a1a1aa;
                font-size: 12px;
                line-height: 1.6;
              "
            >
              Este é um e-mail automático. Por favor,
              não responda a esta mensagem.
            </p>

            <p
              style="
                margin: 8px 0 0;
                color: #a1a1aa;
                font-size: 12px;
              "
            >
              © ${new Date().getFullYear()} Sua Plataforma.
              Todos os direitos reservados.
            </p>
          </div>

        </div>
      </body>
    </html>
  `,
      })
      .catch((error) => {
        console.error('Erro ao enviar e-mail:', error);
      });
    return 'Email foi enviado';
  }
}
