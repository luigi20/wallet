import { createHash } from 'crypto';
import PasswordValidator from 'password-validator';
import * as generator from 'generate-password';

export function userPasswordValidator(): PasswordValidator {
  const passwordSchema = new PasswordValidator();

  passwordSchema
    .is()
    .min(10)
    .is()
    .max(100)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits()
    .has()
    .symbols()
    .has()
    .not()
    .spaces();

  return passwordSchema;
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface IPasswordResetEmailTemplate {
  token: string;
}

export function PasswordResetEmailTemplate({
  token,
}: IPasswordResetEmailTemplate): string {
  const resetUrl = `${process.env.FRONTEND_LOCAL_BARBESHOP}/password-reset?token=${encodeURIComponent(token)}`;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Redefinição de senha</title>
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
              Redefinição de senha 🔐
            </h1>

            <p
              style="
                margin: 10px 0 0;
                color: #d4d4d8;
                font-size: 15px;
              "
            >
              Recebemos uma solicitação para alterar sua senha.
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
                margin: 0 0 20px;
                color: #52525b;
                font-size: 15px;
                line-height: 1.7;
              "
            >
              Recebemos uma solicitação para redefinir a senha
              da sua conta.
            </p>

            <p
              style="
                margin: 0 0 24px;
                color: #52525b;
                font-size: 15px;
                line-height: 1.7;
              "
            >
              Clique no botão abaixo para criar uma nova senha:
            </p>

            <!-- CTA -->
            <div style="text-align: center; margin: 32px 0;">
              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  background-color: #18181b;
                  color: #ffffff;
                  text-decoration: none;
                  padding: 14px 28px;
                  border-radius: 8px;
                  font-size: 15px;
                  font-weight: 600;
                "
              >
                Redefinir minha senha
              </a>
            </div>

            <!-- Expiration -->
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
                <strong>Importante:</strong> este link é válido
                por 1 hora e só pode ser utilizado uma vez.
              </p>
            </div>

            <p
              style="
                margin: 0 0 16px;
                color: #71717a;
                font-size: 13px;
                line-height: 1.6;
              "
            >
              Se o botão não funcionar, copie e cole o endereço
              abaixo no seu navegador:
            </p>

            <p
              style="
                margin: 0 0 24px;
                word-break: break-all;
                color: #52525b;
                font-size: 12px;
                line-height: 1.6;
              "
            >
              ${resetUrl}
            </p>

            <p
              style="
                margin: 0;
                color: #71717a;
                font-size: 13px;
                line-height: 1.6;
              "
            >
              Se você não solicitou a redefinição da sua senha,
              ignore este e-mail. Sua senha atual continuará
              inalterada.
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
  `;
}

export function generateValidRandomPassword(): string {
  return generator.generate({
    length: 16,
    numbers: true,
    symbols: true,
    lowercase: true,
    uppercase: true,
    exclude: ' ',
    strict: true,
  });
}

export function generateHash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
