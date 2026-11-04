import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { AppError } from '@modules/utils/app_error';
import * as argon2 from 'argon2';
import { SignUpService } from '../service/signup.service';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';

jest.mock('argon2');
describe('Test in route signup', () => {
  let userRepository: InMemoryUserRepository;
  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new InMemoryUserRepository();
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
    const signUpService = new SignUpService(userRepository);
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
    const signUpService = new SignUpService(userRepository);
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
