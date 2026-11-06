import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { ITransactionRepository } from '@modules/business/transaction/shared/repositories/abstract_class/ITransaction-repository';
import { IWalletRepository } from '@modules/business/wallet/shared/repositories/abstract_class/IWallet-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetTransactionHistoryService {
  constructor(
    private readonly wallet_repository: IWalletRepository,
    private readonly transaction_repository: ITransactionRepository,
    private readonly user_repository: IUserRepository,
  ) {}

  async execute(user_id: string) {
    const user_id_exists =
      await this.user_repository.find_by_id_select_id(user_id);
    if (!user_id_exists) throw new AppError('Usuário não encontrado', 404);
    const wallet = await this.wallet_repository.find_by_user_id(user_id);
    if (!wallet) throw new AppError('Carteira não encontrada', 404);
    const transactions = await this.transaction_repository.find_by_wallet_id(
      wallet.id,
    );
    return transactions.map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      status: tx.status,
      type: tx.sender_wallet_id === wallet.id ? 'DEBIT' : 'CREDIT',
      sender_wallet_id: tx.sender_wallet_id,
      receiver_wallet_id: tx.receiver_wallet_id,
      created_at: tx.created_at,
    }));
  }
}
