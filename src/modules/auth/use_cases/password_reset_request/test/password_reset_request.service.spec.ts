import { InMemoryPasswordResetTokensRepository } from '@modules/auth/password_reset_tokens/shared/repositories/test/in-memory-password-reset-tokens-repository';
import { AppError } from '@modules/utils/app_error';
import { PasswordResetRequestService } from '../service/password_reset_request.service';
import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';

describe('Test in route password reset request', () => {
  let user_repository: InMemoryUserRepository;
  let password_reset_tokens_repository: InMemoryPasswordResetTokensRepository;
  const email_service_mock = {
    send: jest.fn().mockResolvedValue(undefined),
  };
  beforeEach(() => {
    // Populando os repositórios com dados iniciais
    user_repository = new InMemoryUserRepository();
    password_reset_tokens_repository =
      new InMemoryPasswordResetTokensRepository();
  });

  it('should not passsword reset request, because user not exists', async () => {
    const password_reset_tokens_service = new PasswordResetRequestService(
      user_repository,
      password_reset_tokens_repository,
      email_service_mock,
    );
    expect(
      password_reset_tokens_service.execute({
        email: 'luisfoco@gmail.com',
      }),
    ).rejects.toThrow(new AppError('Usuário não existe', 404));
  });

  it('should reset request', async () => {
    user_repository.list_users.push(
      makeUser({
        props: {
          email: 'luisfoco@gmail.com',
        },
      }),
    );
    const password_reset_tokens_service = new PasswordResetRequestService(
      user_repository,
      password_reset_tokens_repository,
      email_service_mock,
    );
    const result = await password_reset_tokens_service.execute({
      email: 'luisfoco@gmail.com',
    });
    expect(result).toBe('Email foi enviado');
    expect(user_repository.list_users).toHaveLength(1);
  });
});
