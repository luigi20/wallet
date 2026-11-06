import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { ITransactionRepository } from '@modules/business/transaction/shared/repositories/abstract_class/ITransaction-repository';
import { IWalletRepository } from '@modules/business/wallet/shared/repositories/abstract_class/IWallet-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';
import { ITransactionManager } from 'infra/database/protocols/ITransaction-manager';

interface IDepositRequest {
  user_id: string;
  amount: number;
}

@Injectable()
export class CreateDepositService {
  constructor(
    private readonly wallet_repository: IWalletRepository,
    private readonly transaction_repository: ITransactionRepository,
    private readonly user_repository: IUserRepository,
    private readonly transaction_manager: ITransactionManager,
  ) {}

  async execute({ user_id, amount }: IDepositRequest): Promise<string> {
    const user = await this.user_repository.find_by_id_select_id(user_id);
    if (!user) throw new AppError('Usuário não encontrado', 404);
    const wallet = await this.wallet_repository.find_by_user_id(user_id);
    if (!wallet)
      throw new AppError('Carteira não encontrada para este usuário', 404);
    await this.transaction_manager.execute(async () => {
      await this.wallet_repository.increment(wallet.id, amount);
    });
    return 'Depósito realizado com sucesso';
  }
}
