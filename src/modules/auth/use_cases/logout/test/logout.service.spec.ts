import { AppError } from '@modules/utils/app_error';
import { InMemoryRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/test/in-memory-refresh-tokens-repository';
import { makeRefreshTokens } from '@modules/auth/refresh_token/shared/models/test/refresh-tokens-factory';
import { LogoutService } from '../service/logout.service';

describe('Test in route Logout', () => {
  let refresh_token_repository: InMemoryRefreshTokensRepository;
  jest.mock('../../../../utils/functions', () => ({
    Generate_Hash: jest
      .fn()
      .mockResolvedValue(
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$7sH1QxYk6dJ6z9K8Yf5rW1qK9VwV8bTz1CkGm3nQp9I',
      ),
  }));
  beforeEach(() => {
    // Populando os repositórios com dados iniciais
    refresh_token_repository = new InMemoryRefreshTokensRepository();
  });

  it('should not logout, because refresh token is invalid', async () => {
    refresh_token_repository.list_refresh_tokens.push(makeRefreshTokens());
    const logout_service = new LogoutService(refresh_token_repository);
    expect(logout_service.execute('243rg4g4g')).rejects.toThrow(
      new AppError('Token inválido'),
    );
  });

  it('should logout', async () => {
    refresh_token_repository.list_refresh_tokens.push(
      makeRefreshTokens({
        props: {
          token_hash:
            '378f1824b837874ab719df7bed44669d3a376f438b8d8c537a0572fbbf99e71e',
        },
      }),
    );
    const logout_service = new LogoutService(refresh_token_repository);
    await logout_service.execute(
      '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$7sH1QxYk6dJ6z9K8Yf5rW1qK9VwV8bTz1CkGm3nQp9I',
    );
    expect(refresh_token_repository.list_refresh_tokens).toHaveLength(1);
    expect(refresh_token_repository.list_refresh_tokens[0].revoked_at).toBe(
      true,
    );
  });
});
