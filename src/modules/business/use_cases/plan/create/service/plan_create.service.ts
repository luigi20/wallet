import { Plan } from '@modules/business/plan/shared/models/plan';
import { IPlanRepository } from '@modules/business/plan/shared/repositories/abstract_class/iplan-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';

interface IPlanRequest {
  name: string;
  price: number;
  max_members: number;
  max_customers: number;
  max_appointments: number;
  description: string;
  active: boolean;
}

@Injectable()
export class PlanCreateService {
  constructor(private readonly plan_repository: IPlanRepository) {}

  public async execute({
    max_appointments,
    max_customers,
    max_members,
    active,
    name,
    price,
    description,
  }: IPlanRequest): Promise<Plan> {
    const existingPlan = await this.plan_repository.find_one_name(name);
    if (existingPlan) throw new AppError('Plano já existe', 400);
    const plan = new Plan({
      active: active,
      name: name,
      price: price,
      max_members: max_members,
      max_appointments: max_appointments,
      description: description ? description : null,
      max_customers: max_customers,
    });
    await this.plan_repository.create(plan);
    return plan;
  }
}
