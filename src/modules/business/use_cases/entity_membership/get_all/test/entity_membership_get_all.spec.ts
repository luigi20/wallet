import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';
import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { InMemoryProfileRepository } from '@modules/auth/profile/shared/repositories/test/in-memory-profile-repository';
import { makeProfile } from '@modules/auth/profile/shared/models/test/profile-factory';
import { AppError } from '@modules/utils/app_error';
import { EntityMembershipGetAllService } from '../services/entity_membership_get_all.service';
import { InMemoryEntityMembershipRepository } from '@modules/business/entity_membership/shared/repositories/test/in-memory-entitymembership-repository';
import { makeEntityMembership } from '@modules/business/entity_membership/shared/models/test/entity-membership-factory';

describe('Test in route get all membership', () => {
  let entity_repository: InMemoryEntityRepository;
  let profile_repository: InMemoryProfileRepository;
  let identity_repository: InMemoryIdentityRepository;
  let entity_membership_repository: InMemoryEntityMembershipRepository;

  beforeEach(() => {
    // Populando os repositórios com dados iniciais
    entity_repository = new InMemoryEntityRepository();
    profile_repository = new InMemoryProfileRepository();
    entity_membership_repository = new InMemoryEntityMembershipRepository();
    identity_repository = new InMemoryIdentityRepository();
  });

  it('should not get members, because tenant not exists', async () => {
    const entityMembershipGetService = new EntityMembershipGetAllService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
    );
    expect(
      entityMembershipGetService.execute({
        entity_id: '343',
        is_superuser: false,
      }),
    ).rejects.toThrow(new AppError('Empresa não existe', 404));
  });

  it('should not get members, because count members equal 0', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    const membersService = new EntityMembershipGetAllService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
    );
    const result = await membersService.execute({
      entity_id: '123',
      is_superuser: false,
    });
    expect(result.length).toBe(0);
  });

  it('should list members in tenant', async () => {
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
    const members_service = new EntityMembershipGetAllService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
    );
    const result = await members_service.execute({
      entity_id: '123',
      is_superuser: false,
    });
    expect(result.length).toBe(1);
  });

  it('should all members', async () => {
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
    entity_membership_repository.list_membership.push(
      makeEntityMembership({
        id: '124',
        props: {
          entity_id: entity_repository.list_entity[1]._id,
          profile_id: profile_repository.list_profile[1].id,
        },
      }),
    );
    const members_service = new EntityMembershipGetAllService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
    );
    const result = await members_service.execute({
      entity_id: '123',
      is_superuser: true,
    });
    expect(result.length).toBe(2);
  });
});
