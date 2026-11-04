import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';
import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { InMemoryProfileRepository } from '@modules/auth/profile/shared/repositories/test/in-memory-profile-repository';
import { makeProfile } from '@modules/auth/profile/shared/models/test/profile-factory';
import { AppError } from '@modules/utils/app_error';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { EntityMembershipUpdateService } from '../services/entity_membership_update.service';
import { InMemoryEntityMembershipRepository } from '@modules/business/entity_membership/shared/repositories/test/in-memory-entitymembership-repository';
import { makeEntityMembership } from '@modules/business/entity_membership/shared/models/test/entity-membership-factory';
import { MemberRole } from '@modules/utils/enum';

jest.mock('argon2');
describe('Test in route update membership', () => {
  let entity_repository: InMemoryEntityRepository;
  let profile_repository: InMemoryProfileRepository;
  let identity_repository: InMemoryIdentityRepository;
  let entity_membership_repository: InMemoryEntityMembershipRepository;
  const prismaMock = {
    getPrismaClient: jest.fn().mockReturnValue({
      $transaction: jest.fn(async (callback) => callback({})),
    }),
  } as unknown as PrismaService;
  beforeEach(() => {
    jest.clearAllMocks();
    // Populando os repositórios com dados iniciais
    entity_repository = new InMemoryEntityRepository();
    profile_repository = new InMemoryProfileRepository();
    entity_membership_repository = new InMemoryEntityMembershipRepository();
    identity_repository = new InMemoryIdentityRepository();
  });

  it('should not update member, because tenant not exists', async () => {
    const entityMembershipUpdateService = new EntityMembershipUpdateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
    );
    expect(
      entityMembershipUpdateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: randomUUID(),
        mfa_required: false,
        name: 'Luis',
        status: 'ativo',
        phone: '55793843738',
        photo: null,
        roles: ['barbeiro'],
        roles_auth: [MemberRole.RECEPCIONISTA],
        user_id: '123',
      }),
    ).rejects.toThrow(new AppError('Empresa não existe', 404));
  });

  it('should not update member, because credentials invalid', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    const entityMembershipUpdateService = new EntityMembershipUpdateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
    );
    expect(
      entityMembershipUpdateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: '123',
        mfa_required: false,
        name: 'Luis',
        status: 'ativo',
        phone: '55793843738',
        photo: null,
        roles: ['barbeiro'],
        roles_auth: [MemberRole.RECEPCIONISTA],
        user_id: '123',
      }),
    ).rejects.toThrow(new AppError('Credenciais inválidas', 400));
  });

  it('should not update member, because profile not exists', async () => {
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
    const entityMembershipUpdateService = new EntityMembershipUpdateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
    );
    expect(
      entityMembershipUpdateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: '123',
        mfa_required: false,
        name: 'Luis',
        status: 'ativo',
        phone: '55793843738',
        photo: null,
        roles: ['barbeiro'],
        roles_auth: [MemberRole.RECEPCIONISTA],
        user_id: '123',
      }),
    ).rejects.toThrow(new AppError('Perfil não existe', 404));
  });

  it('should not update member, because membership not exists', async () => {
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
    const entityMembershipUpdateService = new EntityMembershipUpdateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
    );
    expect(
      entityMembershipUpdateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: '123',
        mfa_required: false,
        name: 'Luis',
        status: 'ativo',
        phone: '55793843738',
        photo: null,
        roles: ['barbeiro'],
        roles_auth: [MemberRole.RECEPCIONISTA],
        user_id: '123',
      }),
    ).rejects.toThrow(
      new AppError('Usuário não pertence a essa organização', 404),
    );
  });

  it('should not update member, because user not permission', async () => {
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
          profile_id: '123',
          entity_id: '123',
          roles: ['barbeiro'],
        },
      }),
    );
    const entityMembershipUpdateService = new EntityMembershipUpdateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
    );
    expect(
      entityMembershipUpdateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: '123',
        mfa_required: false,
        name: 'Luis',
        status: 'ativo',
        phone: '55793843738',
        photo: null,
        roles: ['recepcionista'],
        roles_auth: [MemberRole.BARBEIRO],
        user_id: '123',
      }),
    ).rejects.toThrow(
      new AppError('Usuário não tem permissão para mudar esse perfil', 400),
    );
  });

  it('should not update member, because transaction failed', async () => {
    const prismaMock = {
      getPrismaClient: jest.fn(),
      $transaction: jest.fn().mockRejectedValue(new Error('Erro na transação')),
    } as unknown as PrismaService;
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
          profile_id: '123',
          entity_id: '123',
        },
      }),
    );
    const entityMembershipUpdateService = new EntityMembershipUpdateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
    );
    expect(
      entityMembershipUpdateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: '123',
        mfa_required: false,
        name: 'Luis',
        status: 'ativo',
        phone: '55793843738',
        photo: null,
        roles: ['recepcionista'],
        roles_auth: [MemberRole.RECEPCIONISTA],
        user_id: '123',
      }),
    ).rejects.toThrow(
      new AppError(
        'Não foi possível concluir o cadastro. Tente novamente.',
        400,
      ),
    );
  });

  it('should update member', async () => {
    const prismaMock = {
      getPrismaClient: jest.fn().mockReturnValue({
        $transaction: jest.fn(async (callback) => callback({})),
      }),
    } as unknown as PrismaService;
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
          profile_id: '123',
          entity_id: '123',
          roles: ['administrador'],
        },
      }),
    );
    const entityMembershipUpdateService = new EntityMembershipUpdateService(
      entity_membership_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
    );
    const result = await entityMembershipUpdateService.execute({
      birth_date: '12/06/1965',
      email: 'l@gmail.com',
      entity_id: '123',
      mfa_required: false,
      name: 'Luis',
      phone: '55793843738',
      photo: null,
      roles: ['recepcionista'],
      status: 'inativo',
      roles_auth: [MemberRole.ADMINISTRADOR],
      user_id: '123',
    });
    expect(result).not.toBe(null);
    expect(result.status).toEqual('inativo');
    expect(identity_repository.list_identity.length).toEqual(1);
    expect(profile_repository.list_profile.length).toEqual(1);
    expect(entity_membership_repository.list_membership.length).toEqual(1);
  });
});
