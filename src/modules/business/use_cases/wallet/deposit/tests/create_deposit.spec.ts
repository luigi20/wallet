import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { CreateDepositService } from '../services/create_deposit.services';
import { InMemoryWalletRepository } from '@modules/business/wallet/shared/repositories/test/in-memory-wallet-repository';
import { InMemoryTransactionRepository } from '@modules/business/transaction/shared/repositories/test/in-memory-transaction-repository';
import { ITransactionManager } from 'infra/database/protocols/ITransaction-manager';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';
import { makeWallet } from '@modules/business/wallet/shared/models/test/wallet-factory';
import { AppError } from '@modules/utils/app_error';

describe('CreateDepositService', () => {
  let sut: CreateDepositService;
  let userRepository: InMemoryUserRepository;
  let walletRepository: InMemoryWalletRepository;
  let transactionRepository: InMemoryTransactionRepository;
  let transactionManager: ITransactionManager;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    walletRepository = new InMemoryWalletRepository();
    transactionRepository = new InMemoryTransactionRepository();
    transactionManager = {
      execute: async (fn: () => Promise<any>) => {
        return await fn();
      },
    };
    sut = new CreateDepositService(
      walletRepository,
      transactionRepository,
      userRepository,
      transactionManager,
    );
  });

  it('should be able to deposit money into a wallet successfully', async () => {
    const userId = 'user-123';
    const walletId = 'wallet-123';
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
          balance: 500.0,
        },
      }),
    );
    const result = await sut.execute({
      user_id: userId,
      amount: 250.0,
    });
    expect(result).toBe('Depósito realizado com sucesso');
    const updatedWallet = await walletRepository.find_by_id(walletId);
    expect(updatedWallet?.balance).toBe(750.0); // 500 + 250
  });

  it('should not be able to deposit if user does not exist', async () => {
    await expect(
      sut.execute({
        user_id: 'non-existent-user',
        amount: 100.0,
      }),
    ).rejects.toEqual(new AppError('Usuário não encontrado', 404));
  });

  it('should not be able to deposit if wallet does not exist for the user', async () => {
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
    await expect(
      sut.execute({
        user_id: userId,
        amount: 150.0,
      }),
    ).rejects.toEqual(
      new AppError('Carteira não encontrada para este usuário', 404),
    );
  });
});
