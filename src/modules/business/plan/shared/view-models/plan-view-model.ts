import { Plan } from '../models/plan';

export class PlanViewModel {
  static toHttp(plan: Plan) {
    return {
      id: plan._id,
      name: plan.name,
      price: plan.price,
      description: plan.description ? plan.description : null,
      max_members: plan.max_members ? plan.max_members : null,
      max_appointments: plan.max_appointments ? plan.max_appointments : null,
      max_customers: plan.max_customers ? plan.max_customers : null,
      active: plan.active,
    };
  }
}
