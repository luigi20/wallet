import { InMemoryPlanRepository } from '@modules/business/plan/shared/repositories/test/in-memory-plan-repository';
import { AppError } from '@modules/utils/app_error';
import { InMemoryEntityRepository } from '@modules/auth/entity/shared/repositories/test/in-memory-entity-repository';
import { InMemorySubscriptionRepository } from '@modules/business/subscription/shared/repositories/test/in-memory-subscription-repository';
import { randomUUID } from 'crypto';
import { makeEntity } from '@modules/auth/entity/shared/models/test/entity-factory';
import { makePlan } from '@modules/business/plan/shared/models/test/plan-factory';
import { makeSubscription } from '@modules/business/subscription/shared/models/test/subscription-factory';
import { SubscriptionGetAllService } from '../service/subscription_get_all.service';

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

  it('should get two subscriptions', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '1235',
      }),
    );
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
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
    subscription_repository.list_subscription.push(
      makeSubscription({
        props: {
          entity_id: '123',
          plan_id: '123',
        },
      }),
    );
    const subscriptionGetAllService = new SubscriptionGetAllService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    const result = await subscriptionGetAllService.execute();
    expect(result.length).toEqual(2);
  });

  it('should get zero subscriptions', async () => {
    entity_repository.list_entity.push(
      makeEntity({
        id: '1235',
      }),
    );
    entity_repository.list_entity.push(
      makeEntity({
        id: '123',
      }),
    );
    plan_repository.list_plan.push(
      makePlan({
        id: '123',
      }),
    );
    const subscriptionGetAllService = new SubscriptionGetAllService(
      plan_repository,
      entity_repository,
      subscription_repository,
    );
    const result = await subscriptionGetAllService.execute();
    expect(result.length).toEqual(0);
  });
});
