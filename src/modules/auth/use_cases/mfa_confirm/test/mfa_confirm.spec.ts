import { AppError } from '@modules/utils/app_error';
import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { InMemoryMFACodeRepository } from '@modules/auth/mfa/shared/repositories/test/in-memory-mfa-code-repository';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';
import { makeMFACode } from '@modules/auth/mfa/shared/models/test/mfa-code-factory';
import { InMemoryTransactionManager } from 'infra/database/protocols/InMemoryTransactionManager';
import { MFAConfirmService } from '../service/mfa_confirm.service';

describe('Test in route MFA confirm', () => {
  let user_repository: InMemoryUserRepository;
  let mfa_code_repository: InMemoryMFACodeRepository;
  let transaction_manager: InMemoryTransactionManager;
  let mfaConfirmService: MFAConfirmService;

  beforeEach(() => {
    // Populando os repositórios e o transaction manager com dados limpos
    user_repository = new InMemoryUserRepository();
    mfa_code_repository = new InMemoryMFACodeRepository();
    transaction_manager = new InMemoryTransactionManager();

    // Instancia o serviço injetando o transaction manager
    mfaConfirmService = new MFAConfirmService(
      (user_repository = new InMemoryUserRepository()),
      (mfa_code_repository = new InMemoryMFACodeRepository()),
      (transaction_manager = new InMemoryTransactionManager()),
    );
  });

  it('should not mfa confirm, because user not exists', async () => {
    // Adicionado o 'await' essencial para asserções de .rejects
    await expect(
      mfaConfirmService.execute({
        email: 'luisfoco@gmail.com',
        mfa_code: '123',
        enabled_mfa: true,
      }),
    ).rejects.toThrow(new AppError('Credenciais inválidas', 400));
  });

  it('should not mfa confirm, because MFA is used', async () => {
    user_repository.list_users.push(
      makeUser({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        props: {
          user_id: user_repository.list_users[0].id,
          used_at: true,
        },
      }),
    );

    await expect(
      mfaConfirmService.execute({
        email: 'luisfoco@gmail.com',
        mfa_code: '123',
        enabled_mfa: true,
      }),
    ).rejects.toThrow(new AppError('MFA inválido ou já usado', 404));
  });

  it('should not mfa confirm, because MFA is invalid', async () => {
    user_repository.list_users.push(
      makeUser({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        props: {
          user_id: user_repository.list_users[0].id,
          used_at: false,
        },
      }),
    );

    await expect(
      mfaConfirmService.execute({
        email: 'luisfoco@gmail.com',
        mfa_code: '123',
        enabled_mfa: true,
      }),
    ).rejects.toThrow(new AppError('Código do MFA inválido'));
  });

  it('should mfa true confirm', async () => {
    user_repository.list_users.push(
      makeUser({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        props: {
          user_id: user_repository.list_users[0].id,
          used_at: false,
        },
      }),
    );

    const result = await mfaConfirmService.execute({
      email: 'luisfoco@gmail.com',
      mfa_code: '4234tuv',
      enabled_mfa: true,
    });

    expect(result).toBe('MFA atualizado com sucesso');
    expect(user_repository.list_users).toHaveLength(1);
    expect(user_repository.list_users[0].mfa_required).toBe(true);
  });

  it('should mfa false confirm', async () => {
    user_repository.list_users.push(
      makeUser({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        props: {
          user_id: user_repository.list_users[0].id,
          used_at: false,
        },
      }),
    );

    const result = await mfaConfirmService.execute({
      email: 'luisfoco@gmail.com',
      mfa_code: '4234tuv',
      enabled_mfa: false,
    });

    expect(result).toBe('MFA atualizado com sucesso');
    expect(user_repository.list_users).toHaveLength(1);
    expect(user_repository.list_users[0].mfa_required).toBe(false);
  });
});
