import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { IPlanRepository } from '@modules/business/plan/shared/repositories/abstract_class/iplan-repository';
import { Subscription } from '@modules/business/subscription/shared/models/subscription';
import { ISubscriptionRepository } from '@modules/business/subscription/shared/repositories/abstract_class/isubscription-repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionGetAllService {
  constructor(
    private readonly plan_repository: IPlanRepository,
    private readonly entity_repository: IEntityRepository,
    private readonly subscription_repository: ISubscriptionRepository,
  ) {}

  public async execute(): Promise<Subscription[]> {
    const list_subscription = await this.subscription_repository.findAll();
    if (list_subscription.length === 0) return [];
    const entityIds = [
      ...new Set(
        list_subscription.map((subscription) => subscription.entity_id),
      ),
    ];
    const planIds = [
      ...new Set(list_subscription.map((subscription) => subscription.plan_id)),
    ];
    const entities = await Promise.all(
      entityIds.map((id) => this.entity_repository.findByIdSelectIdAndName(id)),
    );
    const plans = await Promise.all(
      planIds.map((id) => this.plan_repository.findByIdSelectIdAndName(id)),
    );
    const entityMap = new Map(
      entities.map((entity) => [entity.id, entity.name]),
    );
    const planMap = new Map(plans.map((plan) => [plan.id, plan.name]));
    list_subscription.forEach((subscription) => {
      subscription.entity_name = entityMap.get(subscription.entity_id) ?? null;
      subscription.plan_name = planMap.get(subscription.plan_id) ?? null;
    });
    return list_subscription;
  }
}
