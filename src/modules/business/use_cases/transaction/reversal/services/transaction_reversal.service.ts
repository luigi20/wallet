import { Injectable } from '@nestjs/common';
import { AppError } from '@modules/utils/app_error';
import { ITransactionRepository } from '@modules/business/transaction/shared/repositories/abstract_class/ITransaction-repository';
import { IWalletRepository } from '@modules/business/wallet/shared/repositories/abstract_class/IWallet-repository';
import { ITransactionManager } from 'infra/database/protocols/ITransaction-manager';
import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';

interface ITransactionReverseRequest {
  transaction_id: string;
  user_id: string; // ID do usuário autenticado solicitando o estorno
}

@Injectable()
export class TransactionReversalService {
  constructor(
    private readonly user_repository: IUserRepository,
    private readonly transaction_repository: ITransactionRepository,
    private readonly wallet_repository: IWalletRepository,
    private readonly transaction_manager: ITransactionManager,
  ) {}

  public async execute({
    transaction_id,
    user_id,
  }: ITransactionReverseRequest): Promise<string> {
    const user_exists_id =
      await this.user_repository.find_by_id_select_id(user_id);
    if (!user_exists_id) throw new AppError('Usuário não existe', 404);
    const transaction =
      await this.transaction_repository.find_by_id(transaction_id);
    if (!transaction) throw new AppError('Transação não encontrada', 404);
    if (transaction.status === 'REVERSED')
      throw new AppError('Esta transação já foi revertida anteriormente', 400);
    if (transaction.status === 'FAILED')
      throw new AppError(
        'Não é possível reverter uma transação que falhou',
        400,
      );
    const senderWallet = await this.wallet_repository.find_by_id(
      transaction.sender_wallet_id,
    );
    const receiverWallet = await this.wallet_repository.find_by_id(
      transaction.receiver_wallet_id,
    );
    if (!senderWallet || !receiverWallet)
      throw new AppError(
        'As carteiras associadas a esta transação não foram encontradas',
        404,
      );
    if (senderWallet.user_id !== user_id)
      throw new AppError(
        'Apenas o remetente original pode solicitar o estorno desta transação',
        403,
      );
    if (receiverWallet.balance < transaction.amount)
      throw new AppError(
        'O destinatário não possui saldo suficiente para que o estorno seja realizado',
        400,
      );
    senderWallet.balance = senderWallet.balance + transaction.amount;
    receiverWallet.balance = receiverWallet.balance - transaction.amount;
    transaction.status = 'REVERSED';
    await this.transaction_manager.execute(async () => {
      await this.wallet_repository.update(senderWallet);
      await this.wallet_repository.update(receiverWallet);
      await this.transaction_repository.update(transaction);
    });
    return 'Transação revertida com sucesso';
  }
}
