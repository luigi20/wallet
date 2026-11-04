import { Plan } from '@modules/business/plan/shared/models/plan';
import { IPlanRepository } from '@modules/business/plan/shared/repositories/abstract_class/iplan-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlanGetOneService {
  constructor(private readonly plan_repository: IPlanRepository) {}

  public async execute(id: string): Promise<Plan> {
    const plan = await this.plan_repository.find_one(id);
    if (!plan) throw new AppError('Plano não existe', 404);
    return plan;
  }
}
