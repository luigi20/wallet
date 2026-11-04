import { InMemoryPlanRepository } from '@modules/business/plan/shared/repositories/test/in-memory-plan-repository';
import { SubscriptionGetOneService } from '../service/subscription_get_one.service';
import { AppError } from '@modules/utils/app_error';
import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { InMemorySubscriptionRepository } from '@modules/business/subscription/shared/repositories/test/in-memory-subscription-repository';
import { randomUUID } from 'crypto';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';
import { makePlan } from '@modules/business/plan/shared/models/test/plan-factory';
import { makeSubscription } from '@modules/business/subscription/shared/models/test/subscription-factory';

jest.mock('argon2');
describe('Test in route get one subscription', () => {
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

  it(`should not get subscription, because entity don't exists`, async () => {
    const subscriptionGetOneService = new SubscriptionGetOneService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    expect(subscriptionGetOneService.execute(randomUUID())).rejects.toThrow(
      new AppError('Empresa não existe', 404),
    );
  });

  it(`should not get subscription, because subscription don't exists`, async () => {
    plan_repository.list_plan.push(
      makePlan({
        id: '123',
      }),
    );
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    const subscriptionGetOneService = new SubscriptionGetOneService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    expect(subscriptionGetOneService.execute('123')).rejects.toThrow(
      new AppError('Empresa não tem inscrição', 404),
    );
  });

  it(`should not get subscription, because plan don't exists`, async () => {
    subscription_repository.list_subscription.push(
      makeSubscription({
        props: {
          entity_id: '123',
        },
      }),
    );
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    const subscriptionGetOneService = new SubscriptionGetOneService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    expect(subscriptionGetOneService.execute('123')).rejects.toThrow(
      new AppError('Plano não existe', 404),
    );
  });

  it('should get one subscription', async () => {
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
          entity_id: '1235',
          plan_id: '123',
        },
      }),
    );
    const subscriptionGetOneService = new SubscriptionGetOneService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    const result = await subscriptionGetOneService.execute('1235');
    expect(subscription_repository.list_subscription[0]).toEqual(result);
  });
});
