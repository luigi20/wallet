import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { IPlanRepository } from '@modules/business/plan/shared/repositories/abstract_class/iplan-repository';
import { Subscription } from '@modules/business/subscription/shared/models/subscription';
import { ISubscriptionRepository } from '@modules/business/subscription/shared/repositories/abstract_class/isubscription-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';

interface ISubscriptionRequest {
  entity_id: string;
  plan_id: string;
}

@Injectable()
export class SubscriptionCreateService {
  constructor(
    private readonly plan_repository: IPlanRepository,
    private readonly entity_repository: IEntityRepository,
    private readonly subscription_repository: ISubscriptionRepository,
  ) {}

  public async execute({
    entity_id,
    plan_id,
  }: ISubscriptionRequest): Promise<Subscription> {
    const plan = await this.plan_repository.find_one(plan_id);
    if (!plan) throw new AppError('Plano não existe', 404);
    const entity = await this.entity_repository.findById(entity_id);
    if (!entity) throw new AppError('Empresa não existe', 404);
    const subscription_exists =
      await this.subscription_repository.find_one_by_entity_id(entity_id);
    if (subscription_exists)
      throw new AppError('Plano para está empresa já está cadastrado', 400);
    const subscription = new Subscription({
      entity_id: entity_id,
      plan_id: plan_id,
      plan_name: plan.name,
      entity_name: entity.name,
      started_at: new Date(),
      status: 'ativo',
    });
    await this.subscription_repository.create(subscription);
    return subscription;
  }
}
