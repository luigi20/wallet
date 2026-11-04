import { InMemoryPlanRepository } from '@modules/business/plan/shared/repositories/test/in-memory-plan-repository';
import { EntityUpdateService } from '../service/entity_update.service';
import { AppError } from '@modules/utils/app_error';
import { makePlan } from '@modules/business/plan/shared/models/test/plan-factory';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';
import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { InMemoryAddressRepository } from '@modules/auth/address/shared/repositories/test/in-memory-address-repository';
import { PrismaService } from 'infra/database/prisma/prisma.service';

jest.mock('argon2');
describe('Test in route update entity', () => {
  let entity_repository: InMemoryEntityRepository;
  let address_repository: InMemoryAddressRepository;
  const prismaMock = {
    getPrismaClient: jest.fn().mockReturnValue({
      $transaction: jest.fn(async (callback) => callback({})),
    }),
  } as unknown as PrismaService;
  const geocoding_service_mock = {
    geocode: jest.fn().mockResolvedValue({
      latitude: -10.9472,
      longitude: -37.0731,
    }),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    // Populando os repositórios com dados iniciais
    entity_repository = new InMemoryEntityRepository();
    address_repository = new InMemoryAddressRepository();
  });
  it(`should not update entity, because entity don't exists`, async () => {
    entity_repository.list_entity.push(makeEntity());
    const entity_service = new EntityUpdateService(
      entity_repository,
      address_repository,
      prismaMock,
      geocoding_service_mock,
    );
    expect(
      entity_service.execute({
        name: 'free',
        document: '23224',
        email: 'rert4t4',
        phone: '324242',
        photo: null,
        status: 'ativo',
        type: 'barbearia',
        id: '123',
        city: 'Aracaju',
        complement: 'opa',
        country: 'Brazil',
        neighborhood: 'opaaa',
        number: '34',
        state: 'SP',
        street: 'rua',
        zip_code: '5656569565',
      }),
    ).rejects.toThrow(new AppError('Empresa não existe', 404));
  });

  it('should update entity', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
        props: {
          name: 'free',
          status: 'ativo',
        },
      }),
    );
    const entity_service = new EntityUpdateService(
      entity_repository,
      address_repository,
      prismaMock,
      geocoding_service_mock,
    );
    const result = await entity_service.execute({
      name: 'free',
      document: '23224',
      email: 'rert4t4',
      phone: '324242',
      photo: null,
      status: 'inativo',
      type: 'barbearia',
      id: '123',
      city: 'Aracaju',
      complement: 'opa',
      country: 'Brazil',
      neighborhood: 'opaaa',
      number: '34',
      state: 'SP',
      street: 'rua',
      zip_code: '5656569565',
    });
    expect(result.name).toEqual('free');
    expect(result.status).toEqual('inativo');
    expect(entity_repository.list_entity).toHaveLength(1);
  });
});
