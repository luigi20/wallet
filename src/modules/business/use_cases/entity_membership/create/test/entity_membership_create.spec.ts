import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';
import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { InMemoryProfileRepository } from '@modules/auth/profile/shared/repositories/test/in-memory-profile-repository';
import { makeProfile } from '@modules/auth/profile/shared/models/test/profile-factory';
import { AppError } from '@modules/utils/app_error';
import { EntityMembershipCreateService } from '../services/entity_membership_create.service';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { InMemoryEntityMembershipRepository } from '@modules/business/entity_membership/shared/repositories/test/in-memory-entitymembership-repository';
import { InMemoryIdentityCredentialRepository } from '@modules/auth/identity_credential/shared/repositories/test/in-memory-identity-credential-repository';
import { makeEntityMembership } from '@modules/business/entity_membership/shared/models/test/entity-membership-factory';

jest.mock('argon2');
describe('Test in route create membership', () => {
  let entity_repository: InMemoryEntityRepository;
  let profile_repository: InMemoryProfileRepository;
  let identity_repository: InMemoryIdentityRepository;
  let entity_membership_repository: InMemoryEntityMembershipRepository;
  let identity_credential_repository: InMemoryIdentityCredentialRepository;
  const prismaMock = {
    getPrismaClient: jest.fn().mockReturnValue({
      $transaction: jest.fn(async (callback) => callback({})),
    }),
    identityCredential: {
      create: jest.fn(),
    },
  } as unknown as PrismaService;
  beforeEach(() => {
    jest.clearAllMocks();
    // Populando os repositórios com dados iniciais
    entity_repository = new InMemoryEntityRepository();
    profile_repository = new InMemoryProfileRepository();
    entity_membership_repository = new InMemoryEntityMembershipRepository();
    identity_repository = new InMemoryIdentityRepository();
    identity_credential_repository = new InMemoryIdentityCredentialRepository();
  });

  it('should not create member, because tenant not exists', async () => {
    const entityMembershipCreateService = new EntityMembershipCreateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      identity_credential_repository,
    );
    expect(
      entityMembershipCreateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: randomUUID(),
        mfa_required: false,
        name: 'Luis',
        password: 'scsLCDCJDVDJ#4324343435',
        phone: '55793843738',
        photo: null,
        roles: ['barbeiro'],
      }),
    ).rejects.toThrow(new AppError('Empresa não existe', 404));
  });

  it('should not create member, because password is invalid', async () => {
    const entityMembershipCreateService = new EntityMembershipCreateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      identity_credential_repository,
    );
    expect(
      entityMembershipCreateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: randomUUID(),
        mfa_required: false,
        name: 'Luis',
        password: '1',
        phone: '55793843738',
        photo: null,
        roles: ['barbeiro'],
      }),
    ).rejects.toThrow(new AppError('Senha inválida', 400));
  });

  it('should not create member, because transaction failed', async () => {
    const prismaMock = {
      getPrismaClient: jest.fn(),
      $transaction: jest.fn().mockRejectedValue(new Error('Erro na transação')),
    } as unknown as PrismaService;
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    const entityMembershipCreateService = new EntityMembershipCreateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      identity_credential_repository,
    );
    expect(
      entityMembershipCreateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: '123',
        mfa_required: false,
        name: 'Luis',
        password: 'scsLCDCJDVDJ#4324343435',
        phone: '55793843738',
        photo: null,
        roles: ['barbeiro'],
      }),
    ).rejects.toThrow(
      new AppError(
        'Não foi possível concluir o cadastro. Tente novamente.',
        400,
      ),
    );
  });

  it('should create identity, profile and member', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    const entityMembershipCreateService = new EntityMembershipCreateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      identity_credential_repository,
    );
    const result = await entityMembershipCreateService.execute({
      birth_date: '12/06/1965',
      email: 'l@gmail.com',
      entity_id: '123',
      mfa_required: false,
      name: 'Luis',
      password: 'scsLCDCJDVDJ#4324343435',
      phone: '55793843738',
      photo: null,
      roles: ['barbeiro'],
    });
    expect(result).not.toBe(null);
    expect(identity_repository.list_identity.length).toEqual(1);
    expect(profile_repository.list_profile.length).toEqual(1);
    expect(entity_membership_repository.list_membership.length).toEqual(1);
  });

  it('should member and not membership before', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    identity_repository.list_identity.push(
      makeIdentity({
        id: '123',
        props: {
          email: 'l@gmail.com',
        },
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        id: '123',
        props: {
          user_id: '123',
        },
      }),
    );
    const entityMembershipCreateService = new EntityMembershipCreateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      identity_credential_repository,
    );
    const result = await entityMembershipCreateService.execute({
      birth_date: '12/06/1965',
      email: 'l@gmail.com',
      entity_id: '123',
      mfa_required: false,
      name: 'Luis',
      password: 'scsLCDCJDVDJ#4324343435',
      phone: '55793843738',
      photo: null,
      roles: ['recepcionista'],
    });
    expect(result).not.toBe(null);
    expect(identity_repository.list_identity.length).toEqual(1);
    expect(profile_repository.list_profile.length).toEqual(1);
    expect(entity_membership_repository.list_membership.length).toEqual(1);
  });

  it('should member and membership before', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    identity_repository.list_identity.push(
      makeIdentity({
        id: '123',
        props: {
          email: 'l@gmail.com',
        },
      }),
    );
    profile_repository.list_profile.push(
      makeProfile({
        id: '123',
        props: {
          user_id: '123',
        },
      }),
    );
    entity_membership_repository.list_membership.push(
      makeEntityMembership({
        props: {
          entity_id: entity_repository.list_entity[0]._id,
          profile_id: profile_repository.list_profile[0].id,
          roles: ['administrador'],
        },
      }),
    );
    const entityMembershipCreateService = new EntityMembershipCreateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      identity_credential_repository,
    );
    const result = await entityMembershipCreateService.execute({
      birth_date: '12/06/1965',
      email: 'l@gmail.com',
      entity_id: '123',
      mfa_required: false,
      name: 'Luis',
      password: 'scsLCDCJDVDJ#4324343435',
      phone: '55793843738',
      photo: null,
      roles: ['barbeiro'],
    });
    expect(result).not.toBe(null);
    expect(identity_repository.list_identity.length).toEqual(1);
    expect(profile_repository.list_profile.length).toEqual(1);
    expect(entity_membership_repository.list_membership.length).toEqual(1);
  });
});
