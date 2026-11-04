import { InMemoryPlanRepository } from '@modules/business/plan/shared/repositories/test/in-memory-plan-repository';
import { SubscriptionUpdateService } from '../service/subscription_update.service';
import { AppError } from '@modules/utils/app_error';
import { makeSubscription } from '@modules/business/subscription/shared/models/test/subscription-factory';
import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { InMemorySubscriptionRepository } from '@modules/business/subscription/shared/repositories/test/in-memory-subscription-repository';
import { randomUUID } from 'crypto';
import { makePlan } from '@modules/business/plan/shared/models/test/plan-factory';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';

jest.mock('argon2');
describe('Test in route update subscription', () => {
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

  it(`should not update subscription, because plan don't exists`, async () => {
    const subscriptionUpdateService = new SubscriptionUpdateService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    expect(
      subscriptionUpdateService.execute({
        entity_id: randomUUID(),
        plan_id: randomUUID(),
        id: randomUUID(),
        status: 'inativo',
      }),
    ).rejects.toThrow(new AppError('Plano não existe', 404));
  });

  it(`should not update subscription, because entity don't exists`, async () => {
    plan_repository.list_plan.push(
      makePlan({
        id: '123',
      }),
    );
    const subscriptionUpdateService = new SubscriptionUpdateService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    expect(
      subscriptionUpdateService.execute({
        entity_id: randomUUID(),
        plan_id: '123',
        id: randomUUID(),
        status: 'inativo',
      }),
    ).rejects.toThrow(new AppError('Empresa não existe', 404));
  });

  it(`should not update subscription, because plan don't exists to entity`, async () => {
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
    const subscriptionUpdateService = new SubscriptionUpdateService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    expect(
      subscriptionUpdateService.execute({
        entity_id: '1235',
        plan_id: '123',
        id: randomUUID(),
        status: 'inativo',
      }),
    ).rejects.toThrow(new AppError('Plano para está empresa não existe', 400));
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
    subscription_repository.list_subscription.push(
      makeSubscription({
        id: '10',
        props: {
          plan_id: '123',
          entity_id: '1235',
        },
      }),
    );
    const subscriptionUpdateService = new SubscriptionUpdateService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    await subscriptionUpdateService.execute({
      entity_id: '1235',
      plan_id: '123',
      id: '10',
      status: 'inativo',
    });
    expect(subscription_repository.list_subscription).toHaveLength(1);
  });
});
