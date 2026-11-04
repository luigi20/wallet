import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { AppError } from '@modules/utils/app_error';
import { InMemoryRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/test/in-memory-refresh-tokens-repository';
import { RefreshTokenService } from '../service/refresh-token.service';
import { makeRefreshTokens } from '@modules/auth/refresh_token/shared/models/test/refresh-tokens-factory';
import { InMemoryProfileRepository } from '@modules/auth/profile/shared/repositories/test/in-memory-profile-repository';
import { makeProfile } from '@modules/auth/profile/shared/models/test/profile-factory';
import { InMemoryEntityMembershipRepository } from '@modules/business/entity_membership/shared/repositories/test/in-memory-entitymembership-repository';
import { InMemoryEntityCustomerRepository } from '@modules/business/entity_customer/shared/repositories/test/in-memory-entitycustomer-repository';
import { makeEntityMembership } from '@modules/business/entity_membership/shared/models/test/entity-membership-factory';
import { makeEntityMembershipCustomer } from '@modules/business/entity_customer/shared/models/test/entity-customer-factory';
import { InMemoryCustomerRepository } from '@modules/business/customer/shared/repositories/test/in-memory-customer-repository';
import { makeCustomer } from '@modules/business/customer/shared/models/test/customer-factory';
describe('Test in route Refresh Token', () => {
  let identity_repository: InMemoryIdentityRepository;
  let refresh_token_repository: InMemoryRefreshTokensRepository;
  let profile_repository: InMemoryProfileRepository;
  let entity_customer_repository: InMemoryEntityCustomerRepository;
  let entity_membership_repository: InMemoryEntityMembershipRepository;
  let customer_repository: InMemoryCustomerRepository;
  beforeEach(() => {
    // Populando os repositórios com dados iniciais
    identity_repository = new InMemoryIdentityRepository();
    refresh_token_repository = new InMemoryRefreshTokensRepository();
    profile_repository = new InMemoryProfileRepository();
    entity_customer_repository = new InMemoryEntityCustomerRepository();
    entity_membership_repository = new InMemoryEntityMembershipRepository();
    customer_repository = new InMemoryCustomerRepository();
  });

  it('should not send access token, because token is invalid or expired', async () => {
    const jwt_service = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
      verify: jest.fn().mockImplementation(() => {
        throw new AppError('Token inválido ou expirado');
      }),
    };
    refresh_token_repository.list_refresh_tokens.push(makeRefreshTokens());
    const refresh_token_service = new RefreshTokenService(
      jwt_service as any,
      identity_repository,
      profile_repository,
      entity_customer_repository,
      entity_membership_repository,
      customer_repository,
    );
    expect(
      refresh_token_service.execute(
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$7sH1QxYk6dJ6z9K8Yf5rW1qK9VwV8bTz1CkGm3nQp9I',
      ),
    ).rejects.toThrow(new AppError('Token inválido ou expirado'));
  });

  it('should not send access token, because token is not refresh', async () => {
    const jwt_service = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
      verify: jest.fn().mockReturnValue({
        sub: 'entity-id',
        context_id: 'academia',
        type: 'mfa',
      }),
    };
    refresh_token_repository.list_refresh_tokens.push(makeRefreshTokens());
    const refresh_token_service = new RefreshTokenService(
      jwt_service as any,
      identity_repository,
      profile_repository,
      entity_customer_repository,
      entity_membership_repository,
      customer_repository,
    );
    expect(
      refresh_token_service.execute(
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$7sH1QxYk6dJ6z9K8Yf5rW1qK9VwV8bTz1CkGm3nQp9I',
      ),
    ).rejects.toThrow(new AppError('Token inválido'));
  });

  it('should not send access token, because identity not exists', async () => {
    const jwt_service = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
      verify: jest.fn().mockReturnValue({
        sub: 'entity-id',
        context_id: 'academia',
        type: 'refresh',
      }),
    };
    refresh_token_repository.list_refresh_tokens.push(makeRefreshTokens());
    const refresh_token_service = new RefreshTokenService(
      jwt_service as any,
      identity_repository,
      profile_repository,
      entity_customer_repository,
      entity_membership_repository,
      customer_repository,
    );
    expect(
      refresh_token_service.execute(
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$7sH1QxYk6dJ6z9K8Yf5rW1qK9VwV8bTz1CkGm3nQp9I',
      ),
    ).rejects.toThrow(new AppError('Credenciais inválidas', 401));
  });

  it('should not access token, because profile not exists', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        id: 'entity-id',
      }),
    );
    const jwt_service = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
      verify: jest.fn().mockReturnValue({
        sub: 'entity-id',
        context_id: 'academia',
        type: 'refresh',
      }),
    };
    refresh_token_repository.list_refresh_tokens.push(makeRefreshTokens());
    const refresh_token_service = new RefreshTokenService(
      jwt_service as any,
      identity_repository,
      profile_repository,
      entity_customer_repository,
      entity_membership_repository,
      customer_repository,
    );
    expect(
      refresh_token_service.execute(
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$7sH1QxYk6dJ6z9K8Yf5rW1qK9VwV8bTz1CkGm3nQp9I',
      ),
    ).rejects.toThrow(new AppError('Perfil não encontrado', 404));
  });

  it('should not access token, because user not exists in organization', async () => {
    identity_repository.list_identity.push(
      makeIdentity({
        id: 'entity-id',
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        props: {
          user_id: identity_repository.list_identity[0].id,
        },
      }),
    );
    customer_repository.list_customer.push(
      makeCustomer({
        props: {
          profile_id: profile_repository.list_profile[0].id,
        },
      }),
    );
    const jwt_service = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
      verify: jest.fn().mockReturnValue({
        sub: 'entity-id',
        context_id: 'academia',
        type: 'refresh',
      }),
    };
    refresh_token_repository.list_refresh_tokens.push(makeRefreshTokens());
    const refresh_token_service = new RefreshTokenService(
      jwt_service as any,
      identity_repository,
      profile_repository,
      entity_customer_repository,
      entity_membership_repository,
      customer_repository,
    );
    expect(
      refresh_token_service.execute(
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$7sH1QxYk6dJ6z9K8Yf5rW1qK9VwV8bTz1CkGm3nQp9I',
      ),
    ).rejects.toThrow(
      new AppError('Usuário não pertence a esta organização', 403),
    );
  });

  it('should send access token, because is membership', async () => {
    const jwt_service = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
      verify: jest.fn().mockReturnValue({
        sub: 'identity-id',
        type: 'refresh',
        profile_id: 'profile-id',
        entity_id: 'entity-id',
        code: 'rgrgrg',
        mfa_pending: false,
        iss: 'grgrgr55',
      }),
    };
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
    customer_repository.list_customer.push(
      makeCustomer({
        props: {
          profile_id: profile_repository.list_profile[0].id,
        },
      }),
    );
    entity_membership_repository.list_membership.push(
      makeEntityMembership({
        props: {
          entity_id: 'entity-id',
          profile_id: profile_repository.list_profile[0].id,
        },
      }),
    );
    const refresh_token_service = new RefreshTokenService(
      jwt_service as any,
      identity_repository,
      profile_repository,
      entity_customer_repository,
      entity_membership_repository,
      customer_repository,
    );
    const result = await refresh_token_service.execute(
      '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$7sH1QxYk6dJ6z9K8Yf5rW1qK9VwV8bTz1CkGm3nQp9I',
    );
    expect(result.access_token).toBeTruthy();
    expect(entity_membership_repository.list_membership).toHaveLength(1);
  });

  it('should send access token, because is customer', async () => {
    const jwt_service = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
      verify: jest.fn().mockReturnValue({
        sub: 'identity-id',
        type: 'refresh',
        profile_id: 'profile-id',
        entity_id: 'entity-id',
        code: 'rgrgrg',
        mfa_pending: false,
        iss: 'grgrgr55',
      }),
    };
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
    customer_repository.list_customer.push(
      makeCustomer({
        props: {
          profile_id: profile_repository.list_profile[0].id,
        },
      }),
    );

    entity_customer_repository.list_customer.push(
      makeEntityMembershipCustomer({
        props: {
          entity_id: 'entity-id',
          customer_id: customer_repository.list_customer[0]._id,
        },
      }),
    );
    const refresh_token_service = new RefreshTokenService(
      jwt_service as any,
      identity_repository,
      profile_repository,
      entity_customer_repository,
      entity_membership_repository,
      customer_repository,
    );
    const result = await refresh_token_service.execute(
      '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$7sH1QxYk6dJ6z9K8Yf5rW1qK9VwV8bTz1CkGm3nQp9I',
    );
    expect(result.access_token).toBeTruthy();
    expect(entity_customer_repository.list_customer).toHaveLength(1);
  });
});
