import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';
import { makeIdentity } from '@modules/auth/user/shared/models/test/user-factory';
import { InMemoryIdentityRepository } from '@modules/auth/user/shared/repositories/test/in-memory-user-repository';
import { InMemoryProfileRepository } from '@modules/auth/profile/shared/repositories/test/in-memory-profile-repository';
import { makeProfile } from '@modules/auth/profile/shared/models/test/profile-factory';
import { AppError } from '@modules/utils/app_error';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { EntityCustomerUpdateService } from '../services/entity_customer_update.service';
import { InMemoryEntityCustomerRepository } from '@modules/business/entity_customer/shared/repositories/test/in-memory-entitycustomer-repository';
import { makeEntityMembershipCustomer } from '@modules/business/entity_customer/shared/models/test/entity-customer-factory';
import { InMemoryIdentityCredentialRepository } from '@modules/auth/identity_credential/shared/repositories/test/in-memory-identity-credential-repository';
import { InMemoryCustomerRepository } from '@modules/business/customer/shared/repositories/test/in-memory-customer-repository';
import { makeCustomer } from '@modules/business/customer/shared/models/test/customer-factory';

jest.mock('argon2');
describe('Test in route update customer', () => {
  let entity_repository: InMemoryEntityRepository;
  let profile_repository: InMemoryProfileRepository;
  let identity_repository: InMemoryIdentityRepository;
  let entity_customer_repository: InMemoryEntityCustomerRepository;
  let identity_credential_repository: InMemoryIdentityCredentialRepository;
  let customer_repository: InMemoryCustomerRepository;
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
    entity_customer_repository = new InMemoryEntityCustomerRepository();
    identity_repository = new InMemoryIdentityRepository();
    identity_credential_repository = new InMemoryIdentityCredentialRepository();
    customer_repository = new InMemoryCustomerRepository();
  });

  it('should not update member, because tenant not exists', async () => {
    const entityCustomerUpdateService = new EntityCustomerUpdateService(
      entity_customer_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      customer_repository,
    );
    expect(
      entityCustomerUpdateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: randomUUID(),
        mfa_required: false,
        name: 'Luis',
        status: 'ativo',
        phone: '55793843738',
        photo: null,
        notes: 'barbeiro',
      }),
    ).rejects.toThrow(new AppError('Empresa não existe', 404));
  });

  it('should not update member, because credentials invalid', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    const entityCustomerUpdateService = new EntityCustomerUpdateService(
      entity_customer_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      customer_repository,
    );
    expect(
      entityCustomerUpdateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: '123',
        mfa_required: false,
        name: 'Luis',
        status: 'ativo',
        phone: '55793843738',
        photo: null,
        notes: 'barbeiro',
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
    const entityCustomerUpdateService = new EntityCustomerUpdateService(
      entity_customer_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      customer_repository,
    );
    expect(
      entityCustomerUpdateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: '123',
        mfa_required: false,
        name: 'Luis',
        status: 'ativo',
        phone: '55793843738',
        photo: null,
        notes: 'barbeiro',
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
    customer_repository.list_customer.push(
      makeCustomer({
        props: {
          profile_id: profile_repository.list_profile[0].id,
        },
      }),
    );
    const entityCustomerUpdateService = new EntityCustomerUpdateService(
      entity_customer_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      customer_repository,
    );
    expect(
      entityCustomerUpdateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: '123',
        mfa_required: false,
        name: 'Luis',
        status: 'ativo',
        phone: '55793843738',
        photo: null,
        notes: 'barbeiro',
      }),
    ).rejects.toThrow(
      new AppError('Usuário não pertence a essa organização', 404),
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
          customer_id: '123',
          entity_id: '123',
        },
      }),
    );
    const entityCustomerUpdateService = new EntityCustomerUpdateService(
      entity_customer_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      customer_repository,
    );
    expect(
      entityCustomerUpdateService.execute({
        birth_date: '12/06/1965',
        email: 'l@gmail.com',
        entity_id: '123',
        mfa_required: false,
        name: 'Luis',
        status: 'ativo',
        phone: '55793843738',
        photo: null,
        notes: 'recepcionista',
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
          customer_id: '123',
          entity_id: '123',
        },
      }),
    );
    const entityCustomerUpdateService = new EntityCustomerUpdateService(
      entity_customer_repository,
      profile_repository,
      entity_repository,
      identity_repository,
      prismaMock,
      customer_repository,
    );
    const result = await entityCustomerUpdateService.execute({
      birth_date: '12/06/1965',
      email: 'l@gmail.com',
      entity_id: '123',
      mfa_required: false,
      name: 'Luis',
      phone: '55793843738',
      photo: null,
      notes: 'recepcionista',
      status: 'inativo',
    });
    expect(result).not.toBe(null);
    expect(result.status).toEqual('inativo');
    expect(identity_repository.list_identity.length).toEqual(1);
    expect(profile_repository.list_profile.length).toEqual(1);
    expect(entity_customer_repository.list_customer.length).toEqual(1);
  });
});
