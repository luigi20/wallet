import { AppError } from '@modules/utils/app_error';
import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { InMemoryMFACodeRepository } from '@modules/auth/mfa/shared/repositories/test/in-memory-mfa-code-repository';
import { ValidateMFAService } from '../services/validate-MFA-service';
import { makeMFACode } from '@modules/auth/mfa/shared/models/test/mfa-code-factory';
import { InMemoryRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/test/in-memory-refresh-tokens-repository';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';
import { generateHash } from '@modules/utils/functions';
import { InMemoryTransactionManager } from 'infra/database/protocols/InMemoryTransactionManager';

describe('ValidateMFAService Unit Tests', () => {
  let user_repository: InMemoryUserRepository;
  let mfa_code_repository: InMemoryMFACodeRepository;
  let refresh_token_repository: InMemoryRefreshTokensRepository;
  let jwt_service: any;
  let validate_mfa_service: ValidateMFAService;
  let transaction_manager: InMemoryTransactionManager;
  beforeEach(() => {
    user_repository = new InMemoryUserRepository();
    mfa_code_repository = new InMemoryMFACodeRepository();
    refresh_token_repository = new InMemoryRefreshTokensRepository();
    ((transaction_manager = new InMemoryTransactionManager()),
      (jwt_service = {
        sign: jest.fn().mockImplementation((payload) => {
          if (payload.type === 'access') return 'fake-access-token';
          return 'fake-refresh-token';
        }),
        verify: jest.fn(),
      }));
    validate_mfa_service = new ValidateMFAService(
      mfa_code_repository,
      user_repository,
      jwt_service,
      refresh_token_repository,
      transaction_manager,
    );
  });

  it('should not validate MFA when JWT verification fails or token is expired', async () => {
    jwt_service.verify.mockImplementation(() => {
      throw new Error('Token expired or invalid signature');
    });
    await expect(
      validate_mfa_service.execute({
        code: '13LvRY',
        mfa_token: 'invalid-token',
      }),
    ).rejects.toThrow(new AppError('Token inválido ou expirado', 401));
  });

  it('should not validate MFA when payload type is not mfa, mfa_required is false, sub is missing, or issuer is wrong', async () => {
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'access',
      mfa_required: true,
      iss: 'saas-auth',
    });
    await expect(
      validate_mfa_service.execute({ code: '13LvRY', mfa_token: 'token' }),
    ).rejects.toThrow(new AppError('MFA inválido ou expirado', 401));

    // Cenário 2: mfa_pending diferente de true
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'mfa',
      mfa_required: false,
      iss: 'saas-auth',
    });
    await expect(
      validate_mfa_service.execute({ code: '13LvRY', mfa_token: 'token' }),
    ).rejects.toThrow(new AppError('MFA inválido ou expirado', 401));
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'mfa',
      mfa_required: true,
      iss: 'wrong-issuer',
    });
    await expect(
      validate_mfa_service.execute({ code: '13LvRY', mfa_token: 'token' }),
    ).rejects.toThrow(new AppError('MFA inválido ou expirado', 401));
    jwt_service.verify.mockReturnValue({
      sub: '',
      type: 'mfa',
      mfa_required: true,
      iss: 'saas-auth',
    });
    await expect(
      validate_mfa_service.execute({ code: '13LvRY', mfa_token: 'token' }),
    ).rejects.toThrow(new AppError('MFA inválido ou expirado', 401));
  });

  it('should not validate MFA when MFA code record is not found or attempts limit (>= 2) is reached', async () => {
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'mfa',
      mfa_required: true,
      iss: 'saas-auth',
    });
    await expect(
      validate_mfa_service.execute({ code: '13LvRY', mfa_token: 'token' }),
    ).rejects.toThrow(new AppError('MFA inválido ou expirado', 401));
    const maxAttemptsMfa = makeMFACode({
      id: 'mfa-id-1',
      props: {
        user_id: 'user-id-123',
        code: '13LvRY',
        attempts: 2,
        used_at: false,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    mfa_code_repository.list_MFA_Code.push(maxAttemptsMfa);
    await expect(
      validate_mfa_service.execute({ code: '13LvRY', mfa_token: 'token' }),
    ).rejects.toThrow(new AppError('MFA inválido ou expirado', 401));
  });

  it('should increment attempts and throw error when provided code does not match stored MFA code', async () => {
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'mfa',
      mfa_required: true,
      iss: 'saas-auth',
    });
    const mfaCodeRecord = makeMFACode({
      id: 'mfa-id-1',
      props: {
        user_id: 'user-id-123',
        code: 'CORRECT-CODE',
        attempts: 0,
        used_at: false,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    mfa_code_repository.list_MFA_Code.push(mfaCodeRecord);
    const spyUpdate = jest.spyOn(mfa_code_repository, 'update');
    await expect(
      validate_mfa_service.execute({ code: 'WRONG-CODE', mfa_token: 'token' }),
    ).rejects.toThrow(new AppError('Código do MFA inválido', 401));
    expect(mfaCodeRecord.attempts).toBe(1);
    expect(spyUpdate).toHaveBeenCalledWith(mfaCodeRecord);
  });

  it('should not validate MFA when user does not exist', async () => {
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'mfa',
      mfa_required: true,
      iss: 'saas-auth',
    });
    const mfaCodeRecord = makeMFACode({
      id: 'mfa-id-1',
      props: {
        user_id: 'user-id-123',
        code: '13LvRY',
        attempts: 0,
        used_at: false,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    mfa_code_repository.list_MFA_Code.push(mfaCodeRecord);
    await expect(
      validate_mfa_service.execute({ code: '13LvRY', mfa_token: 'token' }),
    ).rejects.toThrow(new AppError('Usuário não encontrado', 404));
  });

  it('should successfully validate MFA, mark code as used, generate tokens, create refresh token, update last login, and return credentials', async () => {
    jwt_service.verify.mockReturnValue({
      sub: 'user-id-123',
      type: 'mfa',
      mfa_required: true,
      iss: 'saas-auth',
    });
    const mfaCodeRecord = makeMFACode({
      id: 'mfa-id-1',
      props: {
        user_id: 'user-id-123',
        code: '13LvRY',
        attempts: 0,
        used_at: false,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    mfa_code_repository.list_MFA_Code.push(mfaCodeRecord);
    const activeUser = makeUser({
      id: 'user-id-123',
      props: {
        email: 'test@saas.com',
        name: 'John Doe',
        mfa_required: true,
        status: 'Ativo',
      },
    });
    user_repository.list_users.push(activeUser);
    const spyUpdateUsed = jest.spyOn(mfa_code_repository, 'update_used');
    const spyCreateRefreshToken = jest.spyOn(
      refresh_token_repository,
      'create',
    );
    const spyUpdateLastLogin = jest.spyOn(
      user_repository,
      'update_last_login_at',
    );
    const result = await validate_mfa_service.execute({
      code: '13LvRY',
      mfa_token: 'valid-mfa-token',
    });
    expect(result).toEqual({
      access_token: 'fake-access-token',
      mfa_required: true,
      refresh_token: 'fake-refresh-token',
    });
    expect(spyUpdateUsed).toHaveBeenCalledWith('mfa-id-1');
    expect(jwt_service.sign).toHaveBeenCalledTimes(2);
    expect(jwt_service.sign).toHaveBeenNthCalledWith(
      1,
      {
        sub: 'user-id-123',
        email: 'test@saas.com',
        name: 'John Doe',
        mfa_required: true,
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
    expect(spyCreateRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-id-123',
        token_hash: generateHash('fake-refresh-token'),
        revoked_at: false,
      }),
    );
    expect(spyUpdateLastLogin).toHaveBeenCalledWith(
      'user-id-123',
      expect.any(Date),
    );
  });
});
