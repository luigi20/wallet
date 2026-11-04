import { AppError } from '@modules/utils/app_error';
import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';
import { MFAConfirmService } from '../service/mfa_confirm.service';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { InMemoryMFACodeRepository } from '@modules/auth/mfa/shared/repositories/test/in-memory-mfa-code-repository';
import { makeMFACode } from '@modules/auth/mfa/shared/models/test/mfa-code-factory';

describe('Test in route MFA confirm', () => {
  let identity_repository: InMemoryIdentityRepository;
  let mfa_code_repository: InMemoryMFACodeRepository;

  beforeEach(() => {
    // Populando os repositórios com dados iniciais
    identity_repository = new InMemoryIdentityRepository();
    mfa_code_repository = new InMemoryMFACodeRepository();
  });

  it('should not mfa confirm, because identity not exists', async () => {
    const mfaConfirmService = new MFAConfirmService(
      identity_repository,
      mfa_code_repository,
    );
    expect(
      mfaConfirmService.execute({
        email: 'luisfoco@gmail.com',
        mfa_code: '123',
        enabled_mfa: true,
      }),
    ).rejects.toThrow(new AppError('Credenciais inválidas', 400));
  });

  it('should not mfa confirm, because MFA is used', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        props: {
          user_id: identity_repository.list_identity[0].id,
          used_at: true,
        },
      }),
    );
    const mfaConfirmService = new MFAConfirmService(
      identity_repository,
      mfa_code_repository,
    );
    expect(
      mfaConfirmService.execute({
        email: 'luisfoco@gmail.com',
        mfa_code: '123',
        enabled_mfa: true,
      }),
    ).rejects.toThrow(new AppError('MFA inválido ou já usado', 404));
  });

  it('should not mfa confirm, because MFA is invalid', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        props: {
          user_id: identity_repository.list_identity[0].id,
          used_at: false,
        },
      }),
    );
    const mfaConfirmService = new MFAConfirmService(
      identity_repository,
      mfa_code_repository,
    );
    expect(
      mfaConfirmService.execute({
        email: 'luisfoco@gmail.com',
        mfa_code: '123',
        enabled_mfa: true,
      }),
    ).rejects.toThrow(new AppError('Código do MFA inválido'));
  });
  it('should mfa true confirm', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        props: {
          user_id: identity_repository.list_identity[0].id,
          used_at: false,
        },
      }),
    );
    const mfaConfirmService = new MFAConfirmService(
      identity_repository,
      mfa_code_repository,
    );
    const result = await mfaConfirmService.execute({
      email: 'luisfoco@gmail.com',
      mfa_code: '4234tuv',
      enabled_mfa: true,
    });
    expect(result).toBe('MFA atualizado com sucesso');
    expect(identity_repository.list_identity).toHaveLength(1);
    expect(identity_repository.list_identity[0].mfa_required).toBe(true);
  });

  it('should mfa false confirm', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        props: {
          user_id: identity_repository.list_identity[0].id,
          used_at: false,
        },
      }),
    );
    const mfaConfirmService = new MFAConfirmService(
      identity_repository,
      mfa_code_repository,
    );
    const result = await mfaConfirmService.execute({
      email: 'luisfoco@gmail.com',
      mfa_code: '4234tuv',
      enabled_mfa: false,
    });
    expect(result).toBe('MFA atualizado com sucesso');
    expect(identity_repository.list_identity).toHaveLength(1);
    expect(identity_repository.list_identity[0].mfa_required).toBe(false);
  });
});
