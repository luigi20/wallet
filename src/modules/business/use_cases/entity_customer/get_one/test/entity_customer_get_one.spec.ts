import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';
import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { InMemoryProfileRepository } from '@modules/auth/profile/shared/repositories/test/in-memory-profile-repository';
import { makeProfile } from '@modules/auth/profile/shared/models/test/profile-factory';
import { AppError } from '@modules/utils/app_error';
import { EntityCustomerGetOneService } from '../services/entity_customer_get_one.service';
import { InMemoryEntityCustomerRepository } from '@modules/business/entity_customer/shared/repositories/test/in-memory-entitycustomer-repository';
import { makeEntityMembershipCustomer } from '@modules/business/entity_customer/shared/models/test/entity-customer-factory';
import { InMemoryCustomerRepository } from '@modules/business/customer/shared/repositories/test/in-memory-customer-repository';
import { makeCustomer } from '@modules/business/customer/shared/models/test/customer-factory';
describe('Test in route get one customer', () => {
  let entity_repository: InMemoryEntityRepository;
  let profile_repository: InMemoryProfileRepository;
  let identity_repository: InMemoryIdentityRepository;
  let entity_customer_repository: InMemoryEntityCustomerRepository;
  let customer_repository: InMemoryCustomerRepository;
  beforeEach(() => {
    // Populando os repositórios com dados iniciais
    entity_repository = new InMemoryEntityRepository();
    profile_repository = new InMemoryProfileRepository();
    entity_customer_repository = new InMemoryEntityCustomerRepository();
    identity_repository = new InMemoryIdentityRepository();
    customer_repository = new InMemoryCustomerRepository();
  });

  it('should not get members, because user not permission', async () => {
    const entityCustomerGetOneService = new EntityCustomerGetOneService(
      entity_customer_repository,
      profile_repository,
      entity_repository,
      customer_repository,
    );
    expect(
      entityCustomerGetOneService.execute({
        entity_id: '343',
        entity_id_user: '34454',
        profile_id: '123',
        is_superuser: false,
      }),
    ).rejects.toThrow(
      new AppError(
        'Usuário não tem permissão de acessar dados de usuários de outra empresa',
        400,
      ),
    );
  });

  it('should not get members, because client not exists', async () => {
    const entityCustomerGetOneService = new EntityCustomerGetOneService(
      entity_customer_repository,
      profile_repository,
      entity_repository,
      customer_repository,
    );
    expect(
      entityCustomerGetOneService.execute({
        entity_id: '343',
        entity_id_user: '343',
        profile_id: '123',
        is_superuser: false,
      }),
    ).rejects.toThrow(new AppError('Cliente não existe', 404));
  });

  it('should not get members, because user not exists', async () => {
    const entityCustomerGetOneService = new EntityCustomerGetOneService(
      entity_customer_repository,
      profile_repository,
      entity_repository,
      customer_repository,
    );
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
    expect(
      entityCustomerGetOneService.execute({
        entity_id: '343',
        entity_id_user: '343',
        profile_id: '123',
        is_superuser: false,
      }),
    ).rejects.toThrow(new AppError('Usuário não existe', 404));
  });

  it('should one member', async () => {
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

    entity_repository.list_entity.push(
      makeEntity({
        id: '1234',
      }),
    );
    identity_repository.list_identity.push(
      makeIdentity({
        id: '1234',
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        id: '1234',
        props: {
          user_id: identity_repository.list_identity[1].id,
        },
      }),
    );
    customer_repository.list_customer.push(
      makeCustomer({
        props: {
          profile_id: profile_repository.list_profile[1].id,
        },
      }),
    );
    entity_customer_repository.list_customer.push(
      makeEntityMembershipCustomer({
        id: '124',
        props: {
          entity_id: entity_repository.list_entity[1]._id,
          customer_id: customer_repository.list_customer[1]._id,
        },
      }),
    );
    const entityCustomerGetOneService = new EntityCustomerGetOneService(
      entity_customer_repository,
      profile_repository,
      entity_repository,
      customer_repository,
    );
    const result = await entityCustomerGetOneService.execute({
      entity_id: '123',
      entity_id_user: '123',
      profile_id: '123',
      is_superuser: true,
    });
    expect(result).not.toBeNull();
  });
});
