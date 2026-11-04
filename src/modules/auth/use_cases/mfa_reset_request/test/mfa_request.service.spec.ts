import { AppError } from '@modules/utils/app_error';
import { MFARequestService } from '../service/mfa_request.service';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { InMemoryMFACodeRepository } from '@modules/auth/mfa/shared/repositories/test/in-memory-mfa-code-repository';
import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';

describe('Test in route mfa request', () => {
  let mfa_code_repository: InMemoryMFACodeRepository;
  let identity_repository: InMemoryIdentityRepository;
  const email_service_mock = {
    send: jest.fn().mockResolvedValue(undefined),
  };
  beforeEach(() => {
    // Populando os repositórios com dados iniciais
    mfa_code_repository = new InMemoryMFACodeRepository();
    identity_repository = new InMemoryIdentityRepository();
  });

  it('should not mfa request, because identity not exists', async () => {
    const mfa_request_service = new MFARequestService(
      mfa_code_repository,
      identity_repository,
      email_service_mock,
    );
    expect(
      mfa_request_service.execute({
        email: 'luisfoco@gmail.com',
      }),
    ).rejects.toThrow(new AppError('Credenciais inválidas', 404));
  });

  it('should mfa request', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    const mfa_request_service = new MFARequestService(
      mfa_code_repository,
      identity_repository,
      email_service_mock,
    );
    const result = await mfa_request_service.execute({
      email: 'luisfoco@gmail.com',
    });
    expect(result).toBe('Email foi enviado');
    expect(identity_repository.list_identity).toHaveLength(1);
  });
});
