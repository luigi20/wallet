import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { AppError } from '@modules/utils/app_error';
import { InMemoryPasswordResetTokensRepository } from '@modules/auth/password_reset_tokens/shared/repositories/test/in-memory-password-reset-tokens-repository';
import { PasswordResetService } from '../service/password_reset.service';
import { makePasswordResetTokens } from '@modules/auth/password_reset_tokens/shared/models/test/password-reset-tokens-factory';
import * as argon2 from 'argon2';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryTransactionManager } from 'infra/database/protocols/InMemoryTransactionManager';

jest.mock('argon2');

describe('Test in route password reset', () => {
  let user_repository: InMemoryUserRepository;
  let password_reset_tokens_repository: InMemoryPasswordResetTokensRepository;
  let transaction_manager: InMemoryTransactionManager;

  beforeEach(() => {
    jest.clearAllMocks();
    // Populando os repositórios e o transaction manager com dados limpos
    user_repository = new InMemoryUserRepository();
    password_reset_tokens_repository =
      new InMemoryPasswordResetTokensRepository();
    transaction_manager = new InMemoryTransactionManager();
  });

  it('should not password reset, because password is invalid', async () => {
    const password_reset_tokens_service = new PasswordResetService(
      user_repository,
      password_reset_tokens_repository,
      transaction_manager,
    );

    await expect(
      password_reset_tokens_service.execute({
        email: 'luisfoco@gmail.com',
        token: '123',
        new_password: '1234',
      }),
    ).rejects.toThrow(new AppError('Senha inválida', 400));
  });

  it('should not password reset, because email not exists', async () => {
    const password_reset_tokens_service = new PasswordResetService(
      user_repository,
      password_reset_tokens_repository,
      transaction_manager,
    );

    await expect(
      password_reset_tokens_service.execute({
        email: 'luisfoco@gmail.com',
        token: '123',
        new_password: 'ccbdKCDCDUD"!!&1234',
      }),
    ).rejects.toThrow(new AppError('Token inválido ou expirado', 401));
  });

  it('should not password reset, because token not exists or expired', async () => {
    user_repository.list_users.push(
      makeUser({
        id: '123',
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );

    const password_reset_tokens_service = new PasswordResetService(
      user_repository,
      password_reset_tokens_repository,
      transaction_manager,
    );

    await expect(
      password_reset_tokens_service.execute({
        email: 'luisfoco@gmail.com',
        token: '123',
        new_password: 'ccbdKCDCDUD"!!&1234',
      }),
    ).rejects.toThrow(new AppError('Token inválido ou expirado', 400));
  });

  it('should not password reset, because token is invalid', async () => {
    user_repository.list_users.push(
      makeUser({
        id: '123',
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    password_reset_tokens_repository.list_password_reset_tokens.push(
      makePasswordResetTokens({
        props: {
          user_id: user_repository.list_users[0].id,
          used_at: false,
        },
      }),
    );

    (argon2.verify as jest.Mock).mockResolvedValue(false);

    const password_reset_tokens_service = new PasswordResetService(
      user_repository,
      password_reset_tokens_repository,
      transaction_manager,
    );

    await expect(
      password_reset_tokens_service.execute({
        email: 'luisfoco@gmail.com',
        token: '123',
        new_password: 'ccbdKCDCDUD"!!&1234',
      }),
    ).rejects.toThrow(new AppError('Token inválido ou expirado', 400));
  });

  it('should password reset', async () => {
    user_repository.list_users.push(
      makeUser({
        id: '123',
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    password_reset_tokens_repository.list_password_reset_tokens.push(
      makePasswordResetTokens({
        props: {
          user_id: user_repository.list_users[0].id,
          used_at: false,
        },
      }),
    );

    (argon2.verify as jest.Mock).mockResolvedValue(true);
    (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-password');

    const password_reset_tokens_service = new PasswordResetService(
      user_repository,
      password_reset_tokens_repository,
      transaction_manager,
    );

    const result = await password_reset_tokens_service.execute({
      email: 'luisfoco@gmail.com',
      token: '123',
      new_password: 'ccbdKCDCDUD"!!&1234',
    });

    expect(result).toBe('Senha atualizada com sucesso');
    expect(user_repository.list_users).toHaveLength(1);
    expect(argon2.hash).toHaveBeenCalledWith(
      'ccbdKCDCDUD"!!&1234',
      expect.any(Object),
    );
  });
});
