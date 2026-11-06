import { AppError } from '@modules/utils/app_error';
import { IMFACodeRepository } from '@modules/auth/mfa/shared/repositories/abstract_class/imfa-code-repository';
import { InMemoryMFACodeRepository } from '@modules/auth/mfa/shared/repositories/test/in-memory-mfa-code-repository';
import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { GenerateMFAService } from '../service/generate-mfa.service';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';

describe('Test in route generate mfa', () => {
  let user_repository: InMemoryUserRepository;
  let mfa_code_repository: IMFACodeRepository;
  const email_service_mock = {
    send: jest.fn().mockResolvedValue(undefined),
  };
  beforeEach(() => {
    // Populando os repositórios com dados iniciais
    user_repository = new InMemoryUserRepository();
    mfa_code_repository = new InMemoryMFACodeRepository();
  });

  it('should not generate MFA, because identity not exists', async () => {
    const generateMFAService = new GenerateMFAService(
      mfa_code_repository,
      user_repository,
      email_service_mock,
    );
    expect(
      generateMFAService.execute({
        email: 'luisfoco@gmail.com',
        type: 'login',
      }),
    ).rejects.toThrow(new AppError('Credenciais inválidas', 400));
  });

  it('should generate MFA', async () => {
    user_repository.list_users.push(
      makeUser({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    const generateMFAService = new GenerateMFAService(
      mfa_code_repository,
      user_repository,
      email_service_mock,
    );
    const result = await generateMFAService.execute({
      email: 'luisfoco@gmail.com',
      type: 'login',
    });
    expect(result).toBe(undefined);
    expect(user_repository.list_users).toHaveLength(1);
  });
});
