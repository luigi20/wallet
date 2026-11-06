import { createHash } from 'crypto';
import PasswordValidator from 'password-validator';
import * as generator from 'generate-password';
import { AppError } from './app_error';

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
  const resetUrl = `${process.env.FRONTEND_LOCAL}/password-reset?token=${encodeURIComponent(token)}`;

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

export function extractTokenFromHtml(html: string): string {
  const match = html.match(/token=([a-zA-Z0-9\-_]+)/);
  if (match && match[1]) return match[1];
  throw new AppError('Token não encontrado no HTML do e-mail');
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

interface ISecurityCodeEmailDTO {
  code: string;
}

export function generateSecurityCodeEmailHtml({
  code,
}: ISecurityCodeEmailDTO): string {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Código de segurança</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif; color: #18181b;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
        
        <!-- Header -->
        <div style="background-color: #18181b; padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">
            Código de Segurança 🔐
          </h1>
          <p style="margin: 10px 0 0; color: #d4d4d8; font-size: 15px;">
            Confirmação de acesso à Carteira Digital.
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px;">
          <p style="margin: 0 0 20px; font-size: 18px; line-height: 1.6;">
            Olá!
          </p>
          
          <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 1.7;">
            Recebemos uma solicitação que requer a confirmação da sua conta. Utilize o código abaixo para continuar:
          </p>

          <!-- MFA Code Box -->
          <div style="margin: 32px 0; padding: 28px 20px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; text-align: center;">
            <p style="margin: 0 0 12px; color: #71717a; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
              Seu código de segurança
            </p>
            <div style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #18181b;">
              ${code}
            </div>
          </div>

          <!-- Expiration Alert -->
          <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #9a3412; font-size: 14px; line-height: 1.6;">
              <strong>Importante:</strong> este código é temporário e deve ser utilizado dentro do prazo de validade.
            </p>
          </div>

          <p style="margin: 0 0 16px; color: #52525b; font-size: 14px; line-height: 1.7;">
            Por segurança, nunca compartilhe este código com outras pessoas.
          </p>

          <p style="margin: 0; color: #71717a; font-size: 13px; line-height: 1.6;">
            Se você não solicitou este código, recomendamos ignorar esta mensagem e verificar a segurança da sua conta imediatamente.
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e4e4e7; padding: 24px 32px; text-align: center;">
          <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.6;">
            Este é um e-mail automático. Por favor, não responda a esta mensagem.
          </p>
          <p style="margin: 8px 0 0; color: #a1a1aa; font-size: 12px;">
            © ${currentYear} Carteira Digital. Todos os direitos reservados.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

interface IWelcomeEmailDTO {
  name: string;
  email: string;
  document: string;
}

export function generateWelcomeEmailHtml({
  name,
  email,
  document,
}: IWelcomeEmailDTO): string {
  const currentYear = new Date().getFullYear();
  const frontendUrl = process.env.FRONTEND_LOCAL || 'http://localhost:3000';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Cadastro realizado com sucesso</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif; color: #18181b;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
        
        <!-- Header -->
        <div style="background-color: #18181b; padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">
            Bem-vindo! 👋
          </h1>
          <p style="margin: 10px 0 0; color: #d4d4d8; font-size: 15px;">
            A sua carteira digital foi criada com sucesso.
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px;">
          <p style="margin: 0 0 20px; font-size: 18px; line-height: 1.6;">
            Olá, <strong>${name}</strong>!
          </p>
          
          <p style="margin: 0 0 20px; color: #52525b; font-size: 15px; line-height: 1.7;">
            É um prazer tê-lo conosco. A sua conta e a sua carteira financeira já estão ativas e prontas para começar a movimentar saldos.
          </p>

          <!-- Account information -->
          <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 12px; font-size: 14px; color: #71717a;">
              <strong style="color: #18181b;">Dados do Registro</strong>
            </p>
            <p style="margin: 6px 0; font-size: 14px; color: #52525b;">
              <strong>Nome:</strong> ${name}
            </p>
            <p style="margin: 6px 0; font-size: 14px; color: #52525b;">
              <strong>E-mail:</strong> ${email}
            </p>
            <p style="margin: 6px 0; font-size: 14px; color: #52525b;">
              <strong>Documento:</strong> ${document}
            </p>
          </div>

          <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 1.7;">
            A partir de agora, pode realizar transferências de saldo para qualquer outro utilizador de forma rápida, segura e transparente através da nossa plataforma.
          </p>

          <!-- CTA -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${frontendUrl}/signin" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 600;">
              Entrar em Minha Carteira
            </a>
          </div>

          <p style="margin: 0; color: #71717a; font-size: 13px; line-height: 1.6;">
            Se não realizou este registro, recomendamos que entre em contato com a nossa equipe de suporte imediatamente.
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e4e4e7; padding: 24px 32px; text-align: center;">
          <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.6;">
            Este é um e-mail automático. Por favor, não responda a esta mensagem.
          </p>
          <p style="margin: 8px 0 0; color: #a1a1aa; font-size: 12px;">
            © ${currentYear} Carteira Digital. Todos os direitos reservados.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}
