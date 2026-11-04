import { User } from '@modules/auth/user/shared/models/user';
import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

interface ISignupRequest {
  email: string;
  password: string;
  name: string;
  document: string;
}

@Injectable()
export class SignUpService {
  constructor(private readonly user_repository: IUserRepository) {}

  public async execute({
    email,
    password,
    name,
    document,
  }: ISignupRequest): Promise<string> {
    const user_exists = await this.user_repository.find_by_email(email);
    if (user_exists) throw new AppError('Credenciais inválidas', 400);
    const user = new User({
      email: email.toLowerCase().trim(),
      name,
      document,
      password_hash: await argon2.hash(password),
      mfa_required: false,
      status: 'ativo',
    });
    await this.user_repository.create(user);
    /*  
    atomicidade quando for criar a carteira
    
    
    this.email_service
      .send({
        to: identity.email,
        subject: 'Bem-vindo! Seu cadastro foi realizado com sucesso',
        html: ` <!DOCTYPE html> <html lang="pt-BR"> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>Cadastro realizado com sucesso</title> </head> <body style=" margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif; color: #18181b; " > <div style=" max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); " > <!-- Header --> <div style=" background-color: #18181b; padding: 32px; text-align: center; " > <h1 style=" margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; " > Bem-vindo! 👋 </h1> <p style=" margin: 10px 0 0; color: #d4d4d8; font-size: 15px; " > Seu cadastro foi realizado com sucesso. </p> </div> <!-- Content --> <div style="padding: 40px 32px;"> <p style=" margin: 0 0 20px; font-size: 18px; line-height: 1.6; " > Olá, <strong>${name}</strong>! </p> <p style=" margin: 0 0 20px; color: #52525b; font-size: 15px; line-height: 1.7; " > É um prazer ter você conosco. Sua conta foi criada com sucesso e já estamos agilizando para que você use a sua conta. </p> <!-- Account information --> <div style=" background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin: 24px 0; " > <p style=" margin: 0 0 12px; font-size: 14px; color: #71717a; " > <strong style="color: #18181b;"> Dados do cadastro </strong> </p> <p style=" margin: 6px 0; font-size: 14px; color: #52525b; " > <strong>Nome:</strong> ${name} </p> <p style=" margin: 6px 0; font-size: 14px; color: #52525b; " > <strong>E-mail:</strong> ${email} </p> <p style=" margin: 6px 0; font-size: 14px; color: #52525b; " > <strong>Empresa:</strong> ${entity_name} </p> </div> <p style=" margin: 0 0 20px; color: #52525b; font-size: 15px; line-height: 1.7; " > Sua conta foi criada com o perfil de <strong>Administrador</strong> da empresa <strong>${entity_name}</strong>. </p> <p style=" margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 1.7; " > A partir de agora, você poderá configurar sua empresa, gerenciar sua equipe, organizar seus serviços e administrar seus clientes através da plataforma. </p> <!-- CTA --> <div style="text-align: center; margin: 32px 0;"> <a href="${process.env.FRONTEND_LOCAL_BARBESHOP}/signin" style=" display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; " > Acessar minha conta </a> </div> <p style=" margin: 0; color: #71717a; font-size: 13px; line-height: 1.6; " > Se você não realizou este cadastro, recomendamos que entre em contato com nossa equipe de suporte imediatamente. </p> </div> <!-- Footer --> <div style=" border-top: 1px solid #e4e4e7; padding: 24px 32px; text-align: center; " > <p style=" margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.6; " > Este é um e-mail automático. Por favor, não responda a esta mensagem. </p> <p style=" margin: 8px 0 0; color: #a1a1aa; font-size: 12px; " > © ${new Date().getFullYear()} Sua Plataforma. Todos os direitos reservados. </p> </div> </div> </body> </html> `,
      })
      .catch((error) => {
        console.error('Erro ao enviar e-mail:', error);
      });*/
    return 'Usuário cadastrado com sucesso';
  }
}
