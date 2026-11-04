import { AppError } from '@modules/utils/app_error';
import { GenerateMFAService } from '../services/generate-mfa-service';
import { IMFACodeRepository } from '@modules/auth/mfa/shared/repositories/abstract_class/imfa-code-repository';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryMFACodeRepository } from '@modules/auth/mfa/shared/repositories/test/in-memory-mfa-code-repository';

describe('Test in route generate mfa', () => {
  let identity_repository: InMemoryIdentityRepository;
  let mfa_code_repository: IMFACodeRepository;
  const email_service_mock = {
    send: jest.fn().mockResolvedValue(undefined),
  };
  beforeEach(() => {
    // Populando os repositórios com dados iniciais
    identity_repository = new InMemoryIdentityRepository();
    mfa_code_repository = new InMemoryMFACodeRepository();
  });

  it('should not generate MFA, because identity not exists', async () => {
    const generateMFAService = new GenerateMFAService(
      mfa_code_repository,
      identity_repository,
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
    identity_repository.list_identity.push(
      makeIdentity({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    const generateMFAService = new GenerateMFAService(
      mfa_code_repository,
      identity_repository,
      email_service_mock,
    );
    const result = await generateMFAService.execute({
      email: 'luisfoco@gmail.com',
      type: 'login',
    });
    expect(result).toBe('Email enviado com Sucesso');
    expect(identity_repository.list_identity).toHaveLength(1);
  });
});
