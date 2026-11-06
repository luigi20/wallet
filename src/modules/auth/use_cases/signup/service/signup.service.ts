import { User } from '@modules/auth/user/shared/models/user';
import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { Wallet } from '@modules/business/wallet/shared/models/wallet';
import { IWalletRepository } from '@modules/business/wallet/shared/repositories/abstract_class/IWallet-repository';
import { AppError } from '@modules/utils/app_error';
import { generateWelcomeEmailHtml } from '@modules/utils/functions';
import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { ITransactionManager } from 'infra/database/protocols/ITransaction-manager';
import { IEmailService } from 'infra/email/abstract class/IEmailService';

interface ISignupRequest {
  email: string;
  password: string;
  name: string;
  document: string;
}

@Injectable()
export class SignUpService {
  constructor(
    private readonly user_repository: IUserRepository,
    private readonly wallet_repository: IWalletRepository,
    private readonly email_service: IEmailService,
    private readonly transactionManager: ITransactionManager,
  ) {}

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
    const wallet = new Wallet({
      balance: 0,
      user_id: user.id,
    });
    await this.transactionManager.execute(async () => {
      await this.user_repository.create(user);
      await this.wallet_repository.create(wallet);
    });
    this.email_service
      .send({
        to: user.email,
        subject: 'Bem-vindo! Seu cadastro foi realizado com sucesso',
        html: generateWelcomeEmailHtml({
          document: user.document,
          email: user.email,
          name: user.name,
        }),
      })
      .catch((error) => {
        console.error('Erro ao enviar e-mail:', error);
      });
    return 'Usuário cadastrado com sucesso';
  }
}
