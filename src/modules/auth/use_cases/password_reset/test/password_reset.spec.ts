import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { AppError } from '@modules/utils/app_error';
import { InMemoryPasswordResetTokensRepository } from '@modules/auth/password_reset_tokens/shared/repositories/test/in-memory-password-reset-tokens-repository';
import { PasswordResetService } from '../service/password_reset.service';
import { makePasswordResetTokens } from '@modules/auth/password_reset_tokens/shared/models/test/password-reset-tokens-factory';
import * as argon2 from 'argon2';
import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryIdentityCredentialRepository } from '@modules/auth/identity_credential/shared/repositories/test/in-memory-identity-credential-repository';
import { makeIdentityCredential } from '@modules/auth/identity_credential/shared/models/test/identity_credential-factory';

jest.mock('argon2');
describe('Test in route password reset', () => {
  let entity_repository: InMemoryEntityRepository;
  let identity_repository: InMemoryIdentityRepository;
  let password_reset_tokens_repository: InMemoryPasswordResetTokensRepository;
  let identity_credential_repository: InMemoryIdentityCredentialRepository;
  jest.mock('argon2');

  beforeEach(() => {
    // Populando os repositórios com dados iniciais
    entity_repository = new InMemoryEntityRepository();
    identity_repository = new InMemoryIdentityRepository();
    password_reset_tokens_repository =
      new InMemoryPasswordResetTokensRepository();
    identity_credential_repository = new InMemoryIdentityCredentialRepository();
  });

  it('should not password reset, because password is invalid', async () => {
    const password_reset_tokens_service = new PasswordResetService(
      identity_repository,
      password_reset_tokens_repository,
      identity_credential_repository,
    );
    expect(
      password_reset_tokens_service.execute({
        email: 'luisfoco@gmail.com',
        token: '123',
        new_password: '1234',
      }),
    ).rejects.toThrow(new AppError('Senha inválida', 400));
  });

  it('should not password reset, because email not exists', async () => {
    const password_reset_tokens_service = new PasswordResetService(
      identity_repository,
      password_reset_tokens_repository,
      identity_credential_repository,
    );
    expect(
      password_reset_tokens_service.execute({
        email: 'luisfoco@gmail.com',
        token: '123',
        new_password: 'ccbdKCDCDUD"!!&1234',
      }),
    ).rejects.toThrow(new AppError('Email não encontrado', 400));
  });

  it('should not password reset, because credential not exists', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    const password_reset_tokens_service = new PasswordResetService(
      identity_repository,
      password_reset_tokens_repository,
      identity_credential_repository,
    );
    expect(
      password_reset_tokens_service.execute({
        email: 'luisfoco@gmail.com',
        token: '123',
        new_password: 'ccbdKCDCDUD"!!&1234',
      }),
    ).rejects.toThrow(new AppError('Credencial não existe', 404));
  });

  it('should not password reset, because token not exists or expired', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        id: '123',
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    identity_credential_repository.list_identity_credential.push(
      makeIdentityCredential({
        id: '123',
        props: {
          user_id: '123',
        },
      }),
    );
    const password_reset_tokens_service = new PasswordResetService(
      identity_repository,
      password_reset_tokens_repository,
      identity_credential_repository,
    );
    expect(
      password_reset_tokens_service.execute({
        email: 'luisfoco@gmail.com',
        token: '123',
        new_password: 'ccbdKCDCDUD"!!&1234',
      }),
    ).rejects.toThrow(new AppError('Token inválido ou expirado', 400));
  });

  it('should not password reset, because token is invalid', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        id: '123',
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    identity_credential_repository.list_identity_credential.push(
      makeIdentityCredential({
        id: '123',
        props: {
          user_id: '123',
        },
      }),
    );
    password_reset_tokens_repository.list_password_reset_tokens.push(
      makePasswordResetTokens({
        props: {
          user_id: identity_repository.list_identity[0].id,
          used_at: false,
        },
      }),
    );
    (argon2.verify as jest.Mock).mockResolvedValue(false);
    const password_reset_tokens_service = new PasswordResetService(
      identity_repository,
      password_reset_tokens_repository,
      identity_credential_repository,
    );
    expect(
      password_reset_tokens_service.execute({
        email: 'luisfoco@gmail.com',
        token: '123',
        new_password: 'ccbdKCDCDUD"!!&1234',
      }),
    ).rejects.toThrow(new AppError('Token inválido', 400));
  });

  it('should password reset', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        id: '123',
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    identity_credential_repository.list_identity_credential.push(
      makeIdentityCredential({
        id: '123',
        props: {
          user_id: '123',
        },
      }),
    );
    password_reset_tokens_repository.list_password_reset_tokens.push(
      makePasswordResetTokens({
        props: {
          user_id: identity_repository.list_identity[0].id,
          used_at: false,
        },
      }),
    );
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    const password_reset_tokens_service = new PasswordResetService(
      identity_repository,
      password_reset_tokens_repository,
      identity_credential_repository,
    );
    const result = await password_reset_tokens_service.execute({
      email: 'luisfoco@gmail.com',
      token: '123',
      new_password: 'ccbdKCDCDUD"!!&1234',
    });
    expect(result).toBe('Senha atualizada com sucesso');
    expect(identity_repository.list_identity).toHaveLength(1);
  });
});
