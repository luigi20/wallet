import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { AppError } from '@modules/utils/app_error';
import { InMemoryRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/test/in-memory-refresh-tokens-repository';
import { RefreshTokenService } from '../service/refresh-token.service';
import { makeRefreshTokens } from '@modules/auth/refresh_token/shared/models/test/refresh-tokens-factory';
import { generateHash } from '@modules/utils/functions';
import { InMemoryTransactionManager } from 'infra/database/protocols/InMemoryTransactionManager';

describe('RefreshTokenService Unit Tests', () => {
  let user_repository: InMemoryUserRepository;
  let refresh_token_repository: InMemoryRefreshTokensRepository;
  let jwt_service: any;
  let refresh_token_service: RefreshTokenService;
  let transaction_manager: InMemoryTransactionManager;

  beforeEach(() => {
    user_repository = new InMemoryUserRepository();
    refresh_token_repository = new InMemoryRefreshTokensRepository();
    jwt_service = {
      sign: jest.fn().mockImplementation((payload) => {
        if (payload.type === 'access') return 'fake-access-token';
        return 'fake-refresh-token';
      }),
      verify: jest.fn(),
    };
    transaction_manager = new InMemoryTransactionManager();
    refresh_token_service = new RefreshTokenService(
      jwt_service,
      user_repository,
      refresh_token_repository,
      transaction_manager,
    );
  });

  it('should not allow refresh when token is missing', async () => {
    await expect(refresh_token_service.execute('')).rejects.toThrow(
      new AppError('Refresh token ausente', 401),
    );
  });

  it('should not allow refresh when jwt verification fails or token is expired', async () => {
    jwt_service.verify.mockImplementation(() => {
      throw new Error('Token expired or invalid signature');
    });
    await expect(
      refresh_token_service.execute('invalid-or-expired-token'),
    ).rejects.toThrow(new AppError('Refresh token inválido ou expirado', 401));
  });

  it('should not allow refresh when payload type is not refresh, sub is missing, or issuer is wrong', async () => {
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'access',
      iss: 'saas-auth',
    });
    await expect(
      refresh_token_service.execute('valid-jwt-wrong-type'),
    ).rejects.toThrow(new AppError('Refresh token inválido', 401));
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'refresh',
      iss: 'wrong-issuer',
    });
    await expect(
      refresh_token_service.execute('valid-jwt-wrong-issuer'),
    ).rejects.toThrow(new AppError('Refresh token inválido', 401));
    jwt_service.verify.mockReturnValue({
      sub: '',
      type: 'refresh',
      iss: 'saas-auth',
    });
    await expect(
      refresh_token_service.execute('valid-jwt-no-sub'),
    ).rejects.toThrow(new AppError('Refresh token inválido', 401));
  });

  it('should not allow refresh when token is not found in repository, belongs to another user, or is revoked', async () => {
    const tokenString = 'valid-jwt-token';
    const hashedToken = generateHash(tokenString);
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'refresh',
      iss: 'saas-auth',
    });
    await expect(refresh_token_service.execute(tokenString)).rejects.toThrow(
      new AppError('Refresh token revogado ou inválido', 401),
    );
    const tokenOtherUser = makeRefreshTokens({
      id: 'token-id-1',
      props: {
        user_id: 'other-user-id',
        token_hash: hashedToken,
        revoked_at: false,
      },
    });
    refresh_token_repository.list_refresh_tokens.push(tokenOtherUser);
    await expect(refresh_token_service.execute(tokenString)).rejects.toThrow(
      new AppError('Refresh token revogado ou inválido', 401),
    );
    refresh_token_repository.list_refresh_tokens = [];
    const revokedToken = makeRefreshTokens({
      id: 'token-id-2',
      props: {
        user_id: 'user-id-123',
        token_hash: hashedToken,
        revoked_at: true, // Revogado
      },
    });
    refresh_token_repository.list_refresh_tokens.push(revokedToken);
    await expect(refresh_token_service.execute(tokenString)).rejects.toThrow(
      new AppError('Refresh token revogado ou inválido', 401),
    );
  });

  it('should not allow refresh when user does not exist or is not active', async () => {
    const tokenString = 'valid-jwt-token';
    const hashedToken = generateHash(tokenString);
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'refresh',
      iss: 'saas-auth',
    });
    const activeToken = makeRefreshTokens({
      id: 'token-id-1',
      props: {
        user_id: 'user-id-123',
        token_hash: hashedToken,
        revoked_at: false,
      },
    });
    refresh_token_repository.list_refresh_tokens.push(activeToken);
    await expect(refresh_token_service.execute(tokenString)).rejects.toThrow(
      new AppError('Credenciais inválidas', 401),
    );
    const inactiveUser = makeUser({
      id: 'user-id-123',
      props: {
        status: 'Inativo',
      },
    });
    user_repository.list_users.push(inactiveUser);
    await expect(refresh_token_service.execute(tokenString)).rejects.toThrow(
      new AppError('Credenciais inválidas', 401),
    );
  });

  it('should successfully refresh tokens, revoke the old one, and return new access and refresh tokens', async () => {
    const tokenString = 'valid-jwt-token';
    const hashedToken = generateHash(tokenString);
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'refresh',
      iss: 'saas-auth',
    });
    const activeToken = makeRefreshTokens({
      id: 'token-id-1',
      props: {
        user_id: 'user-id-123',
        token_hash: hashedToken,
        revoked_at: false,
      },
    });
    refresh_token_repository.list_refresh_tokens.push(activeToken);
    const activeUser = makeUser({
      id: 'user-id-123',
      props: {
        status: 'Ativo',
        email: 'test@saas.com',
        name: 'John Doe',
        mfa_required: false,
      },
    });
    user_repository.list_users.push(activeUser);
    const spyFindActive = jest.spyOn(
      refresh_token_repository,
      'find_active_by_hash',
    );
    const spyUpdateRevoked = jest.spyOn(
      refresh_token_repository,
      'update_revoked',
    );
    const spyCreate = jest.spyOn(refresh_token_repository, 'create');
    const result = await refresh_token_service.execute(tokenString);
    expect(result).toEqual({
      access_token: 'fake-access-token',
      new_refresh_token: 'fake-refresh-token',
    });
    expect(spyFindActive).toHaveBeenCalledWith(hashedToken, expect.any(Date));
    expect(spyUpdateRevoked).toHaveBeenCalledWith('token-id-1');
    expect(jwt_service.sign).toHaveBeenCalledTimes(2);
    expect(jwt_service.sign).toHaveBeenNthCalledWith(
      1,
      {
        sub: 'user-id-123',
        email: 'test@saas.com',
        name: 'John Doe',
        mfa_required: false,
        type: 'access',
        iss: 'saas-auth',
      },
      { expiresIn: '15m' },
    );
    expect(jwt_service.sign).toHaveBeenNthCalledWith(
      2,
      {
        sub: 'user-id-123',
        type: 'refresh',
        iss: 'saas-auth',
      },
      { expiresIn: '7d' },
    );
    expect(spyCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-id-123',
        token_hash: generateHash('fake-refresh-token'),
        revoked_at: false,
      }),
    );
  });
});
