import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { AppError } from '@modules/utils/app_error';
import * as argon2 from 'argon2';
import { SignUpService } from '../service/signup.service';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryWalletRepository } from '@modules/business/wallet/shared/repositories/test/in-memory-wallet-repository';
import { InMemoryTransactionManager } from 'infra/database/protocols/InMemoryTransactionManager';

jest.mock('argon2');
describe('Test in route signup', () => {
  let userRepository: InMemoryUserRepository;
  let wallet_repository: InMemoryWalletRepository;
  let transaction_manager: InMemoryTransactionManager;

  const email_service_mock = {
    send: jest.fn().mockResolvedValue(undefined),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new InMemoryUserRepository();
    transaction_manager = new InMemoryTransactionManager();
    wallet_repository = new InMemoryWalletRepository();
    // Populando os repositórios com dados iniciais
  });

  it('should not signup, because email exists', async () => {
    userRepository.list_users.push(
      makeUser({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    const signUpService = new SignUpService(
      userRepository,
      wallet_repository,
      email_service_mock,
      transaction_manager,
    );
    expect(
      signUpService.execute({
        email: 'luisfoco@gmail.com',
        password: '1',
        document: '123456',
        name: 'Luis',
      }),
    ).rejects.toThrow(new AppError('Credenciais inválidas'));
  });
  it('should signup, because email does not exist', async () => {
    const signUpService = new SignUpService(
      userRepository,
      wallet_repository,
      email_service_mock,
      transaction_manager,
    );
    const result = await signUpService.execute({
      email: 'luisfoco@gmail.com',
      password: '123456',
      document: '12345678901',
      name: 'Luis',
    });
    expect(userRepository.list_users).toHaveLength(1);
    expect(argon2.hash).toHaveBeenCalledWith('123456');
    expect(result).toBe('Usuário cadastrado com sucesso');
  });
});
