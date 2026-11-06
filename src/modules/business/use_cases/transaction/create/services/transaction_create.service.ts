import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { Transaction } from '@modules/business/transaction/shared/models/transaction';
import { ITransactionRepository } from '@modules/business/transaction/shared/repositories/abstract_class/ITransaction-repository';
import { IWalletRepository } from '@modules/business/wallet/shared/repositories/abstract_class/IWallet-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';
import { ITransactionManager } from 'infra/database/protocols/ITransaction-manager';

interface ITransactionCreateRequest {
  sender_id: string;
  recipient_wallet_id: string;
  amount: number;
}

@Injectable()
export class TransactionCreateService {
  constructor(
    private readonly user_repository: IUserRepository,
    private readonly wallet_repository: IWalletRepository,
    private readonly transaction_repository: ITransactionRepository,
    private readonly transactionManager: ITransactionManager,
  ) {}

  public async execute({
    sender_id,
    recipient_wallet_id,
    amount,
  }: ITransactionCreateRequest): Promise<string> {
    const user_id_exists =
      await this.user_repository.find_by_id_select_id(sender_id);
    if (!user_id_exists)
      throw new AppError('Emissor da transferência não encontrado', 404);
    const sender_wallet =
      await this.wallet_repository.find_by_user_id(user_id_exists);
    const receiver_wallet =
      await this.wallet_repository.find_by_id(recipient_wallet_id);
    if (!sender_wallet)
      throw new AppError('Carteira de origem não encontrada', 404);
    if (!receiver_wallet)
      throw new AppError('Carteira de destino não encontrada', 404);
    if (sender_wallet.id === receiver_wallet.id)
      throw new AppError(
        'Não é permitido transferir fundos para a mesma carteira',
        400,
      );
    if (sender_wallet.balance < amount)
      throw new AppError(
        'Saldo da carteira é insuficiente para realizar a transferência',
        400,
      );
    await this.transactionManager.execute(async () => {
      const success = await this.wallet_repository.decrement(
        sender_wallet.id,
        amount,
      );
      if (!success) {
        throw new AppError(
          'Saldo da carteira é insuficiente para realizar a transferência',
          400,
        );
      }
      await this.wallet_repository.increment(receiver_wallet.id, amount);
      const transaction = new Transaction({
        status: 'COMPLETED',
        amount: amount,
        sender_wallet_id: sender_wallet.id,
        receiver_wallet_id: receiver_wallet.id,
      });
      await this.transaction_repository.create(transaction);
    });
    return 'Transação realizada com sucesso';
  }
}
