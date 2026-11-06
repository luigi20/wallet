import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { GetTransactionHistoryService } from '../services/get_transaction_history.service';
import { InMemoryWalletRepository } from '@modules/business/wallet/shared/repositories/test/in-memory-wallet-repository';
import { InMemoryTransactionRepository } from '@modules/business/transaction/shared/repositories/test/in-memory-transaction-repository';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';
import { makeWallet } from '@modules/business/wallet/shared/models/test/wallet-factory';
import { makeTransaction } from '@modules/business/transaction/shared/models/test/transaction-factory';
import { AppError } from '@modules/utils/app_error';

describe('GetTransactionHistoryService', () => {
  let sut: GetTransactionHistoryService;
  let userRepository: InMemoryUserRepository;
  let walletRepository: InMemoryWalletRepository;
  let transactionRepository: InMemoryTransactionRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    walletRepository = new InMemoryWalletRepository();
    transactionRepository = new InMemoryTransactionRepository();

    sut = new GetTransactionHistoryService(
      walletRepository,
      transactionRepository,
      userRepository,
    );
  });

  it('should be able to get transaction history successfully with DEBIT and CREDIT types', async () => {
    const userId = 'user-123';
    const walletId = 'wallet-123';
    const otherWalletId = 'wallet-456';
    userRepository.list_users.push(
      makeUser({
        id: userId,
        props: {
          name: 'João Silva',
          email: 'joao@example.com',
          password_hash: 'hash',
        },
      }),
    );
    await walletRepository.create(
      makeWallet({
        id: walletId,
        props: {
          user_id: userId,
          balance: 1000.0,
        },
      }),
    );
    await transactionRepository.create(
      makeTransaction({
        id: 'tx-1',
        props: {
          amount: 100.0,
          status: 'COMPLETED',
          sender_wallet_id: walletId,
          receiver_wallet_id: otherWalletId,
          created_at: new Date('2026-11-06T10:00:00.000Z'),
        },
      }),
    );
    await transactionRepository.create(
      makeTransaction({
        id: 'tx-2',
        props: {
          amount: 250.0,
          status: 'COMPLETED',
          sender_wallet_id: otherWalletId,
          receiver_wallet_id: walletId,
          created_at: new Date('2026-11-06T11:00:00.000Z'),
        },
      }),
    );
    const result = await sut.execute(userId);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'tx-2',
      amount: 250.0,
      status: 'COMPLETED',
      type: 'CREDIT',
      sender_wallet_id: otherWalletId,
      receiver_wallet_id: walletId,
      created_at: transactionRepository.list_transactions[1].created_at,
    });
    expect(result[1]).toEqual({
      id: 'tx-1',
      amount: 100.0,
      status: 'COMPLETED',
      type: 'DEBIT',
      sender_wallet_id: walletId,
      receiver_wallet_id: otherWalletId,
      created_at: transactionRepository.list_transactions[0].created_at,
    });
  });

  it('should not be able to get transaction history if user does not exist', async () => {
    await expect(sut.execute('non-existent-user')).rejects.toEqual(
      new AppError('Usuário não encontrado', 404),
    );
  });

  it('should not be able to get transaction history if wallet does not exist for the user', async () => {
    const userId = 'user-123';
    userRepository.list_users.push(
      makeUser({
        id: userId,
        props: {
          name: 'João Silva',
          email: 'joao@example.com',
          password_hash: 'hash',
        },
      }),
    );
    await expect(sut.execute(userId)).rejects.toEqual(
      new AppError('Carteira não encontrada', 404),
    );
  });

  it('should return an empty array if there are no transactions for the wallet', async () => {
    const userId = 'user-123';
    userRepository.list_users.push(
      makeUser({
        id: userId,
        props: {
          name: 'João Silva',
          email: 'joao@example.com',
          password_hash: 'hash',
        },
      }),
    );
    await walletRepository.create(
      makeWallet({
        id: 'wallet-123',
        props: {
          user_id: userId,
          balance: 1000.0,
        },
      }),
    );
    const result = await sut.execute(userId);
    expect(result).toEqual([]);
  });
});
