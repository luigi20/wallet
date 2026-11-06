import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { AppError } from '@modules/utils/app_error';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryWalletRepository } from '@modules/business/wallet/shared/repositories/test/in-memory-wallet-repository';
import { InMemoryTransactionRepository } from '@modules/business/transaction/shared/repositories/test/in-memory-transaction-repository';
import { InMemoryTransactionManager } from 'infra/database/protocols/InMemoryTransactionManager';
import { makeTransaction } from '@modules/business/transaction/shared/models/test/transaction-factory';
import { makeWallet } from '@modules/business/wallet/shared/models/test/wallet-factory';
import { TransactionReversalService } from '../services/transaction_reversal.service';

describe('TransactionReverseService Unit Tests', () => {
  let user_repository: InMemoryUserRepository;
  let wallet_repository: InMemoryWalletRepository;
  let transaction_repository: InMemoryTransactionRepository;
  let transaction_manager: InMemoryTransactionManager;
  let transactionReverseService: TransactionReversalService;

  beforeEach(() => {
    user_repository = new InMemoryUserRepository();
    wallet_repository = new InMemoryWalletRepository();
    transaction_repository = new InMemoryTransactionRepository();
    transaction_manager = new InMemoryTransactionManager();

    transactionReverseService = new TransactionReversalService(
      user_repository,
      transaction_repository,
      wallet_repository,
      transaction_manager,
    );
  });

  it('should not reverse transaction because user does not exist', async () => {
    await expect(
      transactionReverseService.execute({
        transaction_id: 'tx-1',
        user_id: 'non-existent-user',
      }),
    ).rejects.toThrow(new AppError('Usuário não existe', 404));
  });

  it('should not reverse transaction because transaction does not exist', async () => {
    const user = makeUser({ id: 'user-1' });
    user_repository.list_users.push(user);
    await expect(
      transactionReverseService.execute({
        transaction_id: 'non-existent-tx',
        user_id: 'user-1',
      }),
    ).rejects.toThrow(new AppError('Transação não encontrada', 404));
  });

  it('should not reverse transaction because it is already reversed', async () => {
    const user = makeUser({ id: 'user-1' });
    user_repository.list_users.push(user);
    const transaction = makeTransaction({
      id: 'tx-1',
      props: {
        sender_wallet_id: 'wallet-1',
        receiver_wallet_id: 'wallet-2',
        amount: 100,
        status: 'REVERSED',
      },
    });
    transaction_repository.list_transactions.push(transaction);

    await expect(
      transactionReverseService.execute({
        transaction_id: 'tx-1',
        user_id: 'user-1',
      }),
    ).rejects.toThrow(
      new AppError('Esta transação já foi revertida anteriormente', 400),
    );
  });

  it('should not reverse transaction because its status is FAILED', async () => {
    const user = makeUser({ id: 'user-1' });
    user_repository.list_users.push(user);

    const transaction = makeTransaction({
      id: 'tx-1',
      props: {
        sender_wallet_id: 'wallet-1',
        receiver_wallet_id: 'wallet-2',
        amount: 100,
        status: 'FAILED',
      },
    });
    transaction_repository.list_transactions.push(transaction);
    await expect(
      transactionReverseService.execute({
        transaction_id: 'tx-1',
        user_id: 'user-1',
      }),
    ).rejects.toThrow(
      new AppError('Não é possível reverter uma transação que falhou', 400),
    );
  });

  it('should not reverse transaction if associated wallets are missing', async () => {
    const user = makeUser({ id: 'user-1' });
    user_repository.list_users.push(user);
    const transaction = makeTransaction({
      id: 'tx-1',
      props: {
        sender_wallet_id: 'wallet-1',
        receiver_wallet_id: 'wallet-2',
        amount: 100,
        status: 'COMPLETED',
      },
    });
    transaction_repository.list_transactions.push(transaction);
    await expect(
      transactionReverseService.execute({
        transaction_id: 'tx-1',
        user_id: 'user-1',
      }),
    ).rejects.toThrow(
      new AppError(
        'As carteiras associadas a esta transação não foram encontradas',
        404,
      ),
    );
  });

  it('should not reverse transaction if user is not the original sender', async () => {
    const user = makeUser({ id: 'user-other' });
    user_repository.list_users.push(user);

    const senderWallet = makeWallet({
      id: 'wallet-1',
      props: {
        user_id: 'user-original',
        balance: 200,
      },
    });
    const receiverWallet = makeWallet({
      id: 'wallet-2',
      props: {
        user_id: 'user-receiver',
        balance: 300,
      },
    });
    wallet_repository.list_wallets.push(senderWallet, receiverWallet);

    const transaction = makeTransaction({
      id: 'tx-1',
      props: {
        sender_wallet_id: 'wallet-1',
        receiver_wallet_id: 'wallet-2',
        amount: 100,
        status: 'COMPLETED',
      },
    });
    transaction_repository.list_transactions.push(transaction);
    await expect(
      transactionReverseService.execute({
        transaction_id: 'tx-1',
        user_id: 'user-other',
      }),
    ).rejects.toThrow(
      new AppError(
        'Apenas o remetente original pode solicitar o estorno desta transação',
        403,
      ),
    );
  });

  it('should not reverse transaction if receiver has insufficient balance', async () => {
    const user = makeUser({ id: 'user-original' });
    user_repository.list_users.push(user);
    const senderWallet = makeWallet({
      id: 'wallet-1',
      props: {
        user_id: 'user-original',
        balance: 200,
      },
    });
    const receiverWallet = makeWallet({
      id: 'wallet-2',
      props: {
        user_id: 'user-receiver',
        balance: 50,
      },
    });
    wallet_repository.list_wallets.push(senderWallet, receiverWallet);
    const transaction = makeTransaction({
      id: 'tx-1',
      props: {
        sender_wallet_id: 'wallet-1',
        receiver_wallet_id: 'wallet-2',
        amount: 100,
        status: 'COMPLETED',
      },
    });
    transaction_repository.list_transactions.push(transaction);

    await expect(
      transactionReverseService.execute({
        transaction_id: 'tx-1',
        user_id: 'user-original',
      }),
    ).rejects.toThrow(
      new AppError(
        'O destinatário não possui saldo suficiente para que o estorno seja realizado',
        400,
      ),
    );
  });

  it('should successfully reverse transaction and restore wallet balances', async () => {
    const user = makeUser({ id: 'user-original' });
    user_repository.list_users.push(user);
    const senderWallet = makeWallet({
      id: 'wallet-1',
      props: {
        user_id: 'user-original',
        balance: 200,
      },
    });
    const receiverWallet = makeWallet({
      id: 'wallet-2',
      props: {
        user_id: 'user-receiver',
        balance: 300,
      },
    });
    wallet_repository.list_wallets.push(senderWallet, receiverWallet);
    const transaction = makeTransaction({
      id: 'tx-1',
      props: {
        sender_wallet_id: 'wallet-1',
        receiver_wallet_id: 'wallet-2',
        amount: 100,
        status: 'COMPLETED',
      },
    });
    transaction_repository.list_transactions.push(transaction);
    const result = await transactionReverseService.execute({
      transaction_id: 'tx-1',
      user_id: 'user-original',
    });
    expect(result).toBe('Transação revertida com sucesso');
    expect(senderWallet.balance).toBe(300);
    expect(receiverWallet.balance).toBe(200);
    const updatedTransaction = transaction_repository.list_transactions[0];
    expect(updatedTransaction.status).toBe('REVERSED');
  });
});
