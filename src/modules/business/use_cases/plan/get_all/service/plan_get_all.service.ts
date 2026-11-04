import { Plan } from '@modules/business/plan/shared/models/plan';
import { IPlanRepository } from '@modules/business/plan/shared/repositories/abstract_class/iplan-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlanGetAllService {
  constructor(private readonly plan_repository: IPlanRepository) {}

  public async execute(): Promise<Plan[]> {
    const list_plan = await this.plan_repository.list();
    return list_plan;
  }
}
