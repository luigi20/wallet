import { Plan } from '@modules/business/plan/shared/models/plan';
import { IPlanRepository } from '@modules/business/plan/shared/repositories/abstract_class/iplan-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';

interface IPlanRequest {
  id: string;
  name: string;
  price: number;
  max_members: number;
  max_customers: number;
  max_appointments: number;
  description: string;
  active: boolean;
}

@Injectable()
export class PlanUpdateService {
  constructor(private readonly plan_repository: IPlanRepository) {}

  public async execute({
    max_appointments,
    max_customers,
    max_members,
    active,
    name,
    price,
    description,
    id,
  }: IPlanRequest): Promise<Plan> {
    const plan_exists = await this.plan_repository.find_one(id);
    if (!plan_exists) throw new AppError('Plano não existe', 404);
    const existingPlan = await this.plan_repository.find_one_name(name);
    if (existingPlan && existingPlan._id !== plan_exists._id)
      throw new AppError('Nome de plano já existe', 404);
    const plan = new Plan(
      {
        active: active,
        name: name,
        price: price,
        max_members: max_members,
        max_appointments: max_appointments,
        description: description ? description : null,
        max_customers: max_customers,
      },
      plan_exists._id,
    );
    await this.plan_repository.update(plan);
    return plan;
  }
}
