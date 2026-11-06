import { AppError } from '@modules/utils/app_error';
import { SignInService } from '../service/signin.service';
import { InMemoryUserRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { makeUser } from '@modules/auth/user/shared/models/test/user-factory';
import * as argon2 from 'argon2';
import { InMemoryRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/test/in-memory-refresh-tokens-repository';

jest.mock('argon2');
describe('Test in route signin', () => {
  let user_repository: InMemoryUserRepository;
  let refresh_token_repository: InMemoryRefreshTokensRepository;
  const generate_mfa_service = {
    execute: jest.fn().mockResolvedValue(undefined), // Adicione undefined aqui
  };
  const jwt_service = {
    sign: jest.fn().mockReturnValue('fake-jwt-token'),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    // Populando os repositórios com dados iniciais
    user_repository = new InMemoryUserRepository();
    refresh_token_repository = new InMemoryRefreshTokensRepository();
  });

  it('should not signin, because email not exists', async () => {
    const find_by_email_spy = jest.spyOn(user_repository, 'find_by_email');
    const signInService = new SignInService(
      user_repository,
      jwt_service as any,
      refresh_token_repository,
      generate_mfa_service as any,
    );
    expect(
      signInService.execute({
        email: 'luisfoco@gmail.com',
        password: '1',
      }),
    ).rejects.toThrow(new AppError('Credenciais inválidas'));
    expect(find_by_email_spy).toHaveBeenCalledWith('luisfoco@gmail.com');
    expect(argon2.verify).not.toHaveBeenCalled();
    expect(jwt_service.sign).not.toHaveBeenCalled();
  });

  it('should not signin, because status is not active', async () => {
    user_repository.list_users.push(
      makeUser({
        props: {
          email: 'luisfoco@gmail.com',
          status: 'inativo',
        },
      }),
    );
    const signInService = new SignInService(
      user_repository,
      jwt_service as any,
      refresh_token_repository,
      generate_mfa_service as any,
    );
    expect(
      signInService.execute({
        email: 'luisfoco@gmail.com',
        password: '1',
      }),
    ).rejects.toThrow(new AppError('Credenciais inválidas'));
    expect(argon2.verify).not.toHaveBeenCalled();
    expect(jwt_service.sign).not.toHaveBeenCalled();
  });

  it('should not signin, because password is invalid', async () => {
    const verifySpy = jest.mocked(argon2.verify);
    verifySpy.mockResolvedValue(false);
    user_repository.list_users.push(
      makeUser({
        props: {
          email: 'luisfoco@gmail.com',
          password_hash: 'hashed-password',
        },
      }),
    );
    const signInService = new SignInService(
      user_repository,
      jwt_service as any,
      refresh_token_repository,
      generate_mfa_service as any,
    );
    await expect(
      signInService.execute({
        email: 'luisfoco@gmail.com',
        password: '1',
      }),
    ).rejects.toThrow(new AppError('Credenciais inválidas'));
    expect(verifySpy).toHaveBeenCalledTimes(1);
    expect(verifySpy).toHaveBeenCalledWith('hashed-password', '1');
    expect(jwt_service.sign).not.toHaveBeenCalled();
  });

  it('should signin and mfa is false', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    user_repository.list_users.push(
      makeUser({
        props: {
          email: 'luisfoco@gmail.com',
          password_hash: 'hashed-password',
        },
      }),
    );
    const signInService = new SignInService(
      user_repository,
      jwt_service as any,
      refresh_token_repository,
      generate_mfa_service as any,
    );
    const result = await signInService.execute({
      email: 'luisfoco@gmail.com',
      password: 'hashed-password',
    });
    expect(result.mfa_required).toBe(false);
    expect(result.access_token).toBe('fake-jwt-token');
    expect(result.refresh_token).toBe('fake-jwt-token');
    expect(argon2.verify).toHaveBeenCalledTimes(1);
    expect(argon2.verify).toHaveBeenCalledWith(
      'hashed-password',
      'hashed-password',
    );
    expect(jwt_service.sign).toHaveBeenCalledTimes(2);
    expect(jwt_service.sign).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        sub: expect.any(String),
        type: 'access',
        mfa_required: false,
        iss: 'saas-auth',
        email: 'luisfoco@gmail.com',
        name: 'Pedro',
      }),
      { expiresIn: '15m' },
    );
    expect(jwt_service.sign).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        sub: expect.any(String),
        type: 'refresh',
        iss: 'saas-auth',
      }),
      { expiresIn: '7d' },
    );
  });

  it('should signin and mfa is true', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    user_repository.list_users.push(
      makeUser({
        props: {
          email: 'luisfoco@gmail.com',
          password_hash: 'hashed-password',
          mfa_required: true,
        },
      }),
    );
    const signInService = new SignInService(
      user_repository,
      jwt_service as any,
      refresh_token_repository,
      generate_mfa_service as any,
    );
    const result = await signInService.execute({
      email: 'luisfoco@gmail.com',
      password: 'hashed-password',
    });
    expect(result.mfa_required).toBe(true);
    expect(result.access_token).toBe(undefined);
    expect(result.refresh_token).toBe(undefined);
    expect(result.mfa_token).toBe('fake-jwt-token');
    expect(argon2.verify).toHaveBeenCalledTimes(1);
    expect(argon2.verify).toHaveBeenCalledWith(
      'hashed-password',
      'hashed-password',
    );
    expect(jwt_service.sign).toHaveBeenCalledTimes(1);
  });
});
