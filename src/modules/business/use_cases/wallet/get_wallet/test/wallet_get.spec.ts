import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { GetWalletService } from '../services/wallet_get.service';
import { InMemoryWalletRepository } from '../../../../wallet/shared/repositories/test/in-memory-wallet-repository';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';
import { makeWallet } from '../../../../wallet/shared/models/test/wallet-factory';
import { AppError } from '@modules/utils/app_error';

describe('GetWalletService', () => {
  let sut: GetWalletService;
  let userRepository: InMemoryUserRepository;
  let walletRepository: InMemoryWalletRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    walletRepository = new InMemoryWalletRepository();
    sut = new GetWalletService(walletRepository, userRepository);
  });

  it('should be able to get wallet profile and balance successfully', async () => {
    const user = makeUser({
      id: 'user-123',
      props: {
        name: 'João Silva',
        email: 'joao@example.com',
        password_hash: 'hash123',
        document: '02918740530',
      },
    });
    await userRepository.create(user);
    const wallet = makeWallet({
      id: 'wallet-456',
      props: {
        user_id: 'user-123',
        balance: 1500.0,
      },
    });
    await walletRepository.create(wallet);
    const result = await sut.execute('user-123');
    expect(result).toEqual({
      name: 'João Silva',
      wallet_id: 'wallet-456',
      user_id: 'user-123',
      balance: 1500.0,
    });
  });

  it('should not be able to get wallet if user does not exist', async () => {
    await expect(sut.execute('non-existent-user')).rejects.toEqual(
      new AppError('Usuário não encontrado', 404),
    );
  });

  it('should not be able to get wallet if wallet does not exist for the user', async () => {
    const user = makeUser({
      id: 'user-123',
      props: {
        name: 'João Silva',
        email: 'joao@example.com',
        password_hash: 'hash123',
        document: '02918740531',
      },
    });
    await userRepository.create(user);
    await expect(sut.execute('user-123')).rejects.toEqual(
      new AppError('Carteira não encontrada para este usuário', 404),
    );
  });
});
