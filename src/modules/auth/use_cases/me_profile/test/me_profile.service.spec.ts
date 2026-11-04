import { AppError } from '@modules/utils/app_error';
import { InMemoryProfileRepository } from '@modules/auth/profile/shared/repositories/test/in-memory-profile-repository';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';
import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';
import { makeProfile } from '@modules/auth/profile/shared/models/test/profile-factory';
import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import argon2 from 'argon2';
import { MeProfileService } from '../service/me_profile.service';
import { InMemoryEntityMembershipRepository } from '@modules/business/entity_membership/shared/repositories/test/in-memory-entitymembership-repository';
import { InMemoryEntityCustomerRepository } from '@modules/business/entity_customer/shared/repositories/test/in-memory-entitycustomer-repository';
import { makeEntityMembership } from '@modules/business/entity_membership/shared/models/test/entity-membership-factory';
import { makeEntityMembershipCustomer } from '@modules/business/entity_customer/shared/models/test/entity-customer-factory';
import { InMemoryCustomerRepository } from '@modules/business/customer/shared/repositories/test/in-memory-customer-repository';
import { makeCustomer } from '@modules/business/customer/shared/models/test/customer-factory';

describe('Test in route Me Profile', () => {
  let profile_repository: InMemoryProfileRepository;
  let entity_membership_repository: InMemoryEntityMembershipRepository;
  let entity_customer_repository: InMemoryEntityCustomerRepository;
  let entity_repository: InMemoryEntityRepository;
  let identity_repository: InMemoryIdentityRepository;
  let customer_repository: InMemoryCustomerRepository;
  beforeEach(() => {
    jest.clearAllMocks();
    // Populando os repositórios com dados iniciais
    profile_repository = new InMemoryProfileRepository();
    entity_membership_repository = new InMemoryEntityMembershipRepository();
    entity_customer_repository = new InMemoryEntityCustomerRepository();
    entity_repository = new InMemoryEntityRepository();
    identity_repository = new InMemoryIdentityRepository();
    customer_repository = new InMemoryCustomerRepository();
  });

  it('should not get profile, because profile not exists', async () => {
    const me_profile_service = new MeProfileService(
      profile_repository,
      entity_membership_repository,
      entity_customer_repository,
      customer_repository,
    );
    expect(
      me_profile_service.execute({
        profile_id: 'academia',
        entity_id: '1',
      }),
    ).rejects.toThrow(new AppError('Perfil não existe', 404));
  });
  it('should not get profile, because user not exists', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    identity_repository.list_identity.push(
      makeIdentity({
        id: '123',
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        id: '123',
        props: {
          user_id: identity_repository.list_identity[0].id,
        },
      }),
    );
    const me_profile_service = new MeProfileService(
      profile_repository,
      entity_membership_repository,
      entity_customer_repository,
      customer_repository,
    );
    expect(
      me_profile_service.execute({
        profile_id: '123',
        entity_id: '1',
      }),
    ).rejects.toThrow(
      new AppError('Usuário não pertence a esta organização', 403),
    );
  });

  it('should get profile, because is membership', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    identity_repository.list_identity.push(
      makeIdentity({
        id: '123',
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        id: '123',
        props: {
          user_id: identity_repository.list_identity[0].id,
        },
      }),
    );
    entity_membership_repository.list_membership.push(
      makeEntityMembership({
        id: '123',
        props: {
          entity_id: entity_repository.list_entity[0]._id,
          profile_id: profile_repository.list_profile[0].id,
        },
      }),
    );
    const me_profile_service = new MeProfileService(
      profile_repository,
      entity_membership_repository,
      entity_customer_repository,
      customer_repository,
    );

    const result = await me_profile_service.execute({
      profile_id: '123',
      entity_id: '123',
    });
    expect(result).toEqual(profile_repository.list_profile[0]);
    expect(entity_repository.list_entity).toHaveLength(1);
    expect(identity_repository.list_identity).toHaveLength(1);
    expect(entity_membership_repository.list_membership).toHaveLength(1);
    expect(entity_customer_repository.list_customer).toHaveLength(0);
    expect(result.roles.length).toEqual(1);
  });

  it('should get profile, because is membercostumer', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    identity_repository.list_identity.push(
      makeIdentity({
        id: '123',
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        id: '123',
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
        id: '123',
        props: {
          entity_id: entity_repository.list_entity[0]._id,
          customer_id: customer_repository.list_customer[0]._id,
        },
      }),
    );
    const me_profile_service = new MeProfileService(
      profile_repository,
      entity_membership_repository,
      entity_customer_repository,
      customer_repository,
    );

    const result = await me_profile_service.execute({
      profile_id: '123',
      entity_id: '123',
    });
    expect(result).toEqual(profile_repository.list_profile[0]);
    expect(entity_repository.list_entity).toHaveLength(1);
    expect(identity_repository.list_identity).toHaveLength(1);
    expect(entity_membership_repository.list_membership).toHaveLength(0);
    expect(entity_customer_repository.list_customer).toHaveLength(1);
    expect(result.roles[0]).toEqual('cliente');
  });

  it('should get profile, because is membercostumer and membership', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    identity_repository.list_identity.push(
      makeIdentity({
        id: '123',
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        id: '123',
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
        id: '123',
        props: {
          entity_id: entity_repository.list_entity[0]._id,
          customer_id: customer_repository.list_customer[0]._id,
        },
      }),
    );
    entity_membership_repository.list_membership.push(
      makeEntityMembership({
        id: '123',
        props: {
          entity_id: entity_repository.list_entity[0]._id,
          profile_id: profile_repository.list_profile[0].id,
        },
      }),
    );
    const me_profile_service = new MeProfileService(
      profile_repository,
      entity_membership_repository,
      entity_customer_repository,
      customer_repository,
    );

    const result = await me_profile_service.execute({
      profile_id: '123',
      entity_id: '123',
    });

    expect(result).toEqual(profile_repository.list_profile[0]);
    expect(entity_repository.list_entity).toHaveLength(1);
    expect(identity_repository.list_identity).toHaveLength(1);
    expect(entity_membership_repository.list_membership).toHaveLength(1);
    expect(entity_customer_repository.list_customer).toHaveLength(1);
    expect(result.roles.length).toEqual(2);
  });
});
