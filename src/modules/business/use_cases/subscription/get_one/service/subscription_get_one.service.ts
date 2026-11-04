import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { IPlanRepository } from '@modules/business/plan/shared/repositories/abstract_class/iplan-repository';
import { Subscription } from '@modules/business/subscription/shared/models/subscription';
import { ISubscriptionRepository } from '@modules/business/subscription/shared/repositories/abstract_class/isubscription-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionGetOneService {
  constructor(
    private readonly plan_repository: IPlanRepository,
    private readonly entity_repository: IEntityRepository,
    private readonly subscription_repository: ISubscriptionRepository,
  ) {}

  public async execute(entity_id: string): Promise<Subscription> {
    const entity =
      await this.entity_repository.findByIdSelectIdAndName(entity_id);
    if (!entity) throw new AppError('Empresa não existe', 404);
    const subscription =
      await this.subscription_repository.find_one_by_entity_id(entity_id);
    if (!subscription) throw new AppError('Empresa não tem inscrição', 404);
    const plan = await this.plan_repository.findByIdSelectIdAndName(
      subscription.plan_id,
    );
    if (!plan) throw new AppError('Plano não existe', 404);
    subscription.entity_name = entity.name;
    subscription.plan_name = plan.name;
    return subscription;
  }
}
