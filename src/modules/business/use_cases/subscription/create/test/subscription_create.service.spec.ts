import { InMemoryPlanRepository } from '@modules/business/plan/shared/repositories/test/in-memory-plan-repository';
import { SubscriptionCreateService } from '../service/subscription_create.service';
import { AppError } from '@modules/utils/app_error';
import { makeSubscription } from '@modules/business/subscription/shared/models/test/subscription-factory';
import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { InMemorySubscriptionRepository } from '@modules/business/subscription/shared/repositories/test/in-memory-subscription-repository';
import { randomUUID } from 'crypto';
import { makePlan } from '@modules/business/plan/shared/models/test/plan-factory';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';

jest.mock('argon2');
describe('Test in route create subscription', () => {
  let plan_repository: InMemoryPlanRepository;
  let entity_repository: InMemoryEntityRepository;
  let subscription_repository: InMemorySubscriptionRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    // Populando os repositórios com dados iniciais
    plan_repository = new InMemoryPlanRepository();
    entity_repository = new InMemoryEntityRepository();
    subscription_repository = new InMemorySubscriptionRepository();
  });

  it(`should not add subscription, because plan don't exists`, async () => {
    const subscriptionCreateService = new SubscriptionCreateService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    expect(
      subscriptionCreateService.execute({
        entity_id: randomUUID(),
        plan_id: randomUUID(),
      }),
    ).rejects.toThrow(new AppError('Plano não existe', 404));
  });

  it(`should not add subscription, because entity don't exists`, async () => {
    plan_repository.list_plan.push(
      makePlan({
        id: '123',
      }),
    );
    const subscriptionCreateService = new SubscriptionCreateService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    expect(
      subscriptionCreateService.execute({
        entity_id: randomUUID(),
        plan_id: '123',
      }),
    ).rejects.toThrow(new AppError('Empresa não existe', 404));
  });

  it(`should not add subscription, because plan exists to entity`, async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '1235',
      }),
    );
    plan_repository.list_plan.push(
      makePlan({
        id: '123',
      }),
    );
    subscription_repository.list_subscription.push(
      makeSubscription({
        props: {
          plan_id: '123',
          entity_id: '1235',
        },
      }),
    );
    const subscriptionCreateService = new SubscriptionCreateService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    expect(
      subscriptionCreateService.execute({
        entity_id: '1235',
        plan_id: '123',
      }),
    ).rejects.toThrow(
      new AppError('Plano para está empresa já está cadastrado', 400),
    );
  });

  it('should add subscription', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '1235',
      }),
    );
    plan_repository.list_plan.push(
      makePlan({
        id: '123',
      }),
    );
    const subscriptionCreateService = new SubscriptionCreateService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    await subscriptionCreateService.execute({
      entity_id: '1235',
      plan_id: '123',
    });
    expect(subscription_repository.list_subscription).toHaveLength(1);
  });
});
