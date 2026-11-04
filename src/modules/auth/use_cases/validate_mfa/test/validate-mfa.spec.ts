import { AppError } from '@modules/utils/app_error';
import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';
import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryMFACodeRepository } from '@modules/auth/mfa/shared/repositories/test/in-memory-mfa-code-repository';
import { ValidateMFAService } from '../services/validate-MFA-service';
import { makeMFACode } from '@modules/auth/mfa/shared/models/test/mfa-code-factory';
import { InMemoryRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/test/in-memory-refresh-tokens-repository';
import { InMemoryProfileRepository } from '@modules/auth/profile/shared/repositories/test/in-memory-profile-repository';
import { makeProfile } from '@modules/auth/profile/shared/models/test/profile-factory';
import * as argon2 from 'argon2';
import { InMemoryEntityCustomerRepository } from '@modules/business/entity_customer/shared/repositories/test/in-memory-entitycustomer-repository';
import { InMemoryEntityMembershipRepository } from '@modules/business/entity_membership/shared/repositories/test/in-memory-entitymembership-repository';
import { makeEntityMembership } from '@modules/business/entity_membership/shared/models/test/entity-membership-factory';
import { makeEntityMembershipCustomer } from '@modules/business/entity_customer/shared/models/test/entity-customer-factory';

jest.mock('argon2');
describe('Test in route validate mfa', () => {
  let entity_repository: InMemoryEntityRepository;
  let entity_membership_repository: InMemoryEntityMembershipRepository;
  let entity_customer_repository: InMemoryEntityCustomerRepository;
  let identity_repository: InMemoryIdentityRepository;
  let mfa_code_repository: InMemoryMFACodeRepository;
  let refresh_token_repository: InMemoryRefreshTokensRepository;
  let profile_repository: InMemoryProfileRepository;

  const jwt_service = {
    sign: jest.fn().mockReturnValue('fake-jwt-token'),
    verify: jest.fn().mockResolvedValue({
      sub: 'entity-id',
      context_id: 'academia',
      type: 'mfa',
    }),
  };
  beforeEach(() => {
    // Populando os repositórios com dados iniciais
    entity_repository = new InMemoryEntityRepository();
    identity_repository = new InMemoryIdentityRepository();
    mfa_code_repository = new InMemoryMFACodeRepository();
    refresh_token_repository = new InMemoryRefreshTokensRepository();
    profile_repository = new InMemoryProfileRepository();
    entity_membership_repository = new InMemoryEntityMembershipRepository();
    entity_customer_repository = new InMemoryEntityCustomerRepository();
  });

  it('should not validate MFA, because token is invalid', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(false);
    (jwt_service.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt inválido');
    });
    const validateMFAService = new ValidateMFAService(
      entity_membership_repository,
      entity_customer_repository,
      mfa_code_repository,
      identity_repository,
      jwt_service as any,
      refresh_token_repository,
      profile_repository,
    );
    expect(
      validateMFAService.execute({
        code: '13LvRY',
        mfa_token: null,
      }),
    ).rejects.toThrow(new AppError('Token inválido ou expirado', 401));
  });

  it('should not validate MFA, because MFA is invalid', async () => {
    (jwt_service.verify as jest.Mock).mockReturnValue({
      sub: 'identity-id',
      profile_id: 'profile-id',
      entity_id: 'entity-id',
      code: '434343',
      type: 'access',
      mfa_pending: false,
      iss: 'saas-auth',
    });
    const validateMFAService = new ValidateMFAService(
      entity_membership_repository,
      entity_customer_repository,
      mfa_code_repository,
      identity_repository,
      jwt_service as any,
      refresh_token_repository,
      profile_repository,
    );
    expect(
      validateMFAService.execute({
        code: '13LvRY',
        mfa_token: null,
      }),
    ).rejects.toThrow(new AppError('MFA inválido ou expirado', 401));
  });

  it('should not validate MFA, because MFA is invalid', async () => {
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        id: '123',
        props: {
          type: 'mfa',
          used_at: true,
        },
      }),
    );
    (jwt_service.verify as jest.Mock).mockReturnValue({
      sub: 'identity-id',
      profile_id: 'profile-id',
      entity_id: 'entity-id',
      code: '434343',
      type: 'mfa',
      mfa_pending: true,
      iss: 'saas-auth',
    });
    const validateMFAService = new ValidateMFAService(
      entity_membership_repository,
      entity_customer_repository,
      mfa_code_repository,
      identity_repository,
      jwt_service as any,
      refresh_token_repository,
      profile_repository,
    );
    expect(
      validateMFAService.execute({
        code: '13LvRY',
        mfa_token: null,
      }),
    ).rejects.toThrow(new AppError('MFA inválido ou expirado', 401));
  });

  it('should not validate MFA, because code is invalid', async () => {
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        id: '123',
        props: {
          type: 'mfa',
          used_at: false,
          code: '13LvRY',
        },
      }),
    );
    (jwt_service.verify as jest.Mock).mockReturnValue({
      sub: 'identity-id',
      profile_id: 'profile-id',
      entity_id: 'entity-id',
      code: '13LvRY',
      type: 'mfa',
      mfa_pending: true,
      iss: 'saas-auth',
    });
    const validateMFAService = new ValidateMFAService(
      entity_membership_repository,
      entity_customer_repository,
      mfa_code_repository,
      identity_repository,
      jwt_service as any,
      refresh_token_repository,
      profile_repository,
    );
    expect(
      validateMFAService.execute({
        code: '13LvRY1',
        mfa_token: null,
      }),
    ).rejects.toThrow(new AppError('Código do MFA inválido', 401));
  });

  it('should not validate MFA, because identity is not exists', async () => {
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        id: '123',
        props: {
          type: 'mfa',
          used_at: false,
          code: '434343',
        },
      }),
    );
    (jwt_service.verify as jest.Mock).mockReturnValue({
      sub: 'identity-id',
      profile_id: 'profile-id',
      entity_id: 'entity-id',
      code: '434343',
      type: 'mfa',
      mfa_pending: true,
      iss: 'saas-auth',
    });
    const validateMFAService = new ValidateMFAService(
      entity_membership_repository,
      entity_customer_repository,
      mfa_code_repository,
      identity_repository,
      jwt_service as any,
      refresh_token_repository,
      profile_repository,
    );
    expect(
      validateMFAService.execute({
        code: '434343',
        mfa_token: null,
      }),
    ).rejects.toThrow(new AppError('Identidade não encontrada', 404));
  });

  it('should not validate MFA, because profile is not exists', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        id: 'identity-id',
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        id: '123',
        props: {
          type: 'mfa',
          used_at: false,
          code: '434343',
        },
      }),
    );
    (jwt_service.verify as jest.Mock).mockReturnValue({
      sub: 'identity-id',
      profile_id: 'profile-id',
      entity_id: 'entity-id',
      code: '434343',
      type: 'mfa',
      mfa_pending: true,
      iss: 'saas-auth',
    });
    const validateMFAService = new ValidateMFAService(
      entity_membership_repository,
      entity_customer_repository,
      mfa_code_repository,
      identity_repository,
      jwt_service as any,
      refresh_token_repository,
      profile_repository,
    );
    expect(
      validateMFAService.execute({
        code: '434343',
        mfa_token: null,
      }),
    ).rejects.toThrow(new AppError('Perfil não encontrado', 404));
  });

  it('should not validate MFA, because user is not exists', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        id: 'identity-id',
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        id: '12345',
        props: {
          user_id: identity_repository.list_identity[0].id,
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        id: '123',
        props: {
          type: 'mfa',
          used_at: false,
          code: '434343',
        },
      }),
    );
    (jwt_service.verify as jest.Mock).mockReturnValue({
      sub: 'identity-id',
      profile_id: 'profile-id',
      entity_id: 'entity-id',
      code: '434343',
      type: 'mfa',
      mfa_pending: true,
      iss: 'saas-auth',
    });
    const validateMFAService = new ValidateMFAService(
      entity_membership_repository,
      entity_customer_repository,
      mfa_code_repository,
      identity_repository,
      jwt_service as any,
      refresh_token_repository,
      profile_repository,
    );
    expect(
      validateMFAService.execute({
        code: '434343',
        mfa_token: null,
      }),
    ).rejects.toThrow(
      new AppError('Usuário não pertence a esta organização', 403),
    );
  });

  it('should validate MFA, because is membership', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        id: 'identity-id',
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        id: 'profile-id',
        props: {
          user_id: identity_repository.list_identity[0].id,
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        id: '123',
        props: {
          type: 'mfa',
          used_at: false,
          code: '434343',
        },
      }),
    );
    entity_membership_repository.list_membership.push(
      makeEntityMembership({
        props: {
          entity_id: 'entity-id',
          profile_id: 'profile-id',
        },
      }),
    );
    (jwt_service.verify as jest.Mock).mockReturnValue({
      sub: 'identity-id',
      profile_id: 'profile-id',
      entity_id: 'entity-id',
      code: '434343',
      type: 'mfa',
      mfa_pending: true,
      iss: 'saas-auth',
    });
    const validateMFAService = new ValidateMFAService(
      entity_membership_repository,
      entity_customer_repository,
      mfa_code_repository,
      identity_repository,
      jwt_service as any,
      refresh_token_repository,
      profile_repository,
    );
    const result = await validateMFAService.execute({
      code: '434343',
      mfa_token: null,
    });
    expect(result.access_token).toBeTruthy();
    expect(result.mfa_required).toBe(true);
    expect(result.refresh_token).toBeTruthy();
    expect(entity_membership_repository.list_membership.length).toEqual(1);
    expect(entity_customer_repository.list_customer.length).toEqual(0);
  });

  it('should validate MFA, because is client', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        id: 'identity-id',
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        id: 'profile-id',
        props: {
          user_id: identity_repository.list_identity[0].id,
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        id: '123',
        props: {
          type: 'mfa',
          used_at: false,
          code: '434343',
        },
      }),
    );
    entity_customer_repository.list_customer.push(
      makeEntityMembershipCustomer({
        props: {
          entity_id: 'entity-id',
          customer_id: 'profile-id',
        },
      }),
    );
    (jwt_service.verify as jest.Mock).mockReturnValue({
      sub: 'identity-id',
      profile_id: 'profile-id',
      entity_id: 'entity-id',
      code: '434343',
      type: 'mfa',
      mfa_pending: true,
      iss: 'saas-auth',
    });
    const validateMFAService = new ValidateMFAService(
      entity_membership_repository,
      entity_customer_repository,
      mfa_code_repository,
      identity_repository,
      jwt_service as any,
      refresh_token_repository,
      profile_repository,
    );
    const result = await validateMFAService.execute({
      code: '434343',
      mfa_token: null,
    });
    expect(result.access_token).toBeTruthy();
    expect(result.mfa_required).toBe(true);
    expect(result.refresh_token).toBeTruthy();
    expect(entity_membership_repository.list_membership.length).toEqual(0);
    expect(entity_customer_repository.list_customer.length).toEqual(1);
  });

  it('should validate MFA, because is client and membership', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        id: 'identity-id',
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        id: 'profile-id',
        props: {
          user_id: identity_repository.list_identity[0].id,
        },
      }),
    );
    mfa_code_repository.list_MFA_Code.push(
      makeMFACode({
        id: '123',
        props: {
          type: 'mfa',
          used_at: false,
          code: '434343',
        },
      }),
    );
    entity_customer_repository.list_customer.push(
      makeEntityMembershipCustomer({
        props: {
          entity_id: 'entity-id',
          customer_id: 'profile-id',
        },
      }),
    );
    entity_membership_repository.list_membership.push(
      makeEntityMembership({
        props: {
          entity_id: 'entity-id',
          profile_id: 'profile-id',
        },
      }),
    );
    (jwt_service.verify as jest.Mock).mockReturnValue({
      sub: 'identity-id',
      profile_id: 'profile-id',
      entity_id: 'entity-id',
      code: '434343',
      type: 'mfa',
      mfa_pending: true,
      iss: 'saas-auth',
    });
    const validateMFAService = new ValidateMFAService(
      entity_membership_repository,
      entity_customer_repository,
      mfa_code_repository,
      identity_repository,
      jwt_service as any,
      refresh_token_repository,
      profile_repository,
    );
    const result = await validateMFAService.execute({
      code: '434343',
      mfa_token: null,
    });
    expect(result.access_token).toBeTruthy();
    expect(result.mfa_required).toBe(true);
    expect(result.refresh_token).toBeTruthy();
    expect(entity_membership_repository.list_membership.length).toEqual(1);
    expect(entity_customer_repository.list_customer.length).toEqual(1);
  });
});
