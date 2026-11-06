import { TransactionCreateService } from '../services/transaction_create.service';
import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { AppError } from '@modules/utils/app_error';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryWalletRepository } from '@modules/business/wallet/shared/repositories/test/in-memory-wallet-repository';
import { InMemoryTransactionRepository } from '@modules/business/transaction/shared/repositories/test/in-memory-transaction-repository';
import { InMemoryTransactionManager } from 'infra/database/protocols/InMemoryTransactionManager';
import { makeWallet } from '@modules/business/wallet/shared/models/test/wallet-factory';

describe('TransactionCreateService Unit Tests', () => {
  let user_repository: InMemoryUserRepository;
  let wallet_repository: InMemoryWalletRepository;
  let transaction_repository: InMemoryTransactionRepository;
  let transaction_manager: InMemoryTransactionManager;
  let transactionCreateService: TransactionCreateService;

  beforeEach(() => {
    user_repository = new InMemoryUserRepository();
    wallet_repository = new InMemoryWalletRepository();
    transaction_repository = new InMemoryTransactionRepository();
    transaction_manager = new InMemoryTransactionManager();
    transactionCreateService = new TransactionCreateService(
      user_repository,
      wallet_repository,
      transaction_repository,
      transaction_manager,
    );
  });

  it('should not transfer funds because sender and receiver wallet are the same', async () => {
    const sender = makeUser({ id: 'user-1' });
    user_repository.list_users.push(sender);
    const sharedWallet = makeWallet({
      id: 'wallet-1',
      props: { user_id: 'user-1', balance: 500 },
    });
    wallet_repository.list_wallets.push(sharedWallet);
    await expect(
      transactionCreateService.execute({
        sender_id: 'user-1',
        recipient_wallet_id: 'wallet-1',
        amount: 100,
      }),
    ).rejects.toThrow(
      new AppError(
        'Não é permitido transferir fundos para a mesma carteira',
        400,
      ),
    );
  });

  it('should not transfer funds because sender user does not exist', async () => {
    await expect(
      transactionCreateService.execute({
        sender_id: 'non-existent-sender',
        recipient_wallet_id: 'wallet-2',
        amount: 100,
      }),
    ).rejects.toThrow(
      new AppError('Emissor da transferência não encontrado', 404),
    );
  });

  it('should not transfer funds because sender wallet does not exist', async () => {
    const sender = makeUser({ id: 'user-1' });
    user_repository.list_users.push(sender);
    await expect(
      transactionCreateService.execute({
        sender_id: 'user-1',
        recipient_wallet_id: 'wallet-2',
        amount: 100,
      }),
    ).rejects.toThrow(new AppError('Carteira de origem não encontrada', 404));
  });

  it('should not transfer funds because receiver wallet does not exist', async () => {
    const sender = makeUser({ id: 'user-1' });
    user_repository.list_users.push(sender);
    wallet_repository.list_wallets.push(
      makeWallet({
        id: 'wallet-1',
        props: { user_id: 'user-1', balance: 500 },
      }),
    );
    await expect(
      transactionCreateService.execute({
        sender_id: 'user-1',
        recipient_wallet_id: 'non-existent-wallet',
        amount: 100,
      }),
    ).rejects.toThrow(new AppError('Carteira de destino não encontrada', 404));
  });

  it('should not transfer funds because sender has insufficient balance', async () => {
    const sender = makeUser({ id: 'user-1' });
    user_repository.list_users.push(sender);
    wallet_repository.list_wallets.push(
      makeWallet({ id: 'wallet-1', props: { user_id: 'user-1', balance: 50 } }), // Saldo insuficiente
      makeWallet({
        id: 'wallet-2',
        props: {
          user_id: 'user-2',
          balance: 200,
        },
      }),
    );
    await expect(
      transactionCreateService.execute({
        sender_id: 'user-1',
        recipient_wallet_id: 'wallet-2',
        amount: 100,
      }),
    ).rejects.toThrow(
      new AppError(
        'Saldo da carteira é insuficiente para realizar a transferência',
        400,
      ),
    );
  });

  it('should successfully transfer funds between wallets and record the transaction', async () => {
    const sender = makeUser({ id: 'user-1' });
    user_repository.list_users.push(sender);
    const senderWallet = makeWallet({
      id: 'wallet-1',
      props: {
        user_id: 'user-1',
        balance: 500,
      },
    });
    const receiverWallet = makeWallet({
      id: 'wallet-2',
      props: {
        user_id: 'user-2',
        balance: 200,
      },
    });
    wallet_repository.list_wallets.push(senderWallet, receiverWallet);
    const result = await transactionCreateService.execute({
      sender_id: 'user-1',
      recipient_wallet_id: 'wallet-2',
      amount: 150,
    });
    expect(result).toBe('Transação realizada com sucesso');
    expect(senderWallet.balance).toBe(350);
    expect(receiverWallet.balance).toBe(350);
    expect(transaction_repository.list_transactions).toHaveLength(1);
    const createdTransaction = transaction_repository.list_transactions[0];
    expect(createdTransaction.sender_wallet_id).toBe('wallet-1');
    expect(createdTransaction.receiver_wallet_id).toBe('wallet-2');
    expect(createdTransaction.amount).toBe(150);
    expect(createdTransaction.status).toBe('COMPLETED');
  });
});
