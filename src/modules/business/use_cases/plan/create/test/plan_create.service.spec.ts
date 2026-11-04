import { InMemoryPlanRepository } from '@modules/business/plan/shared/repositories/test/in-memory-plan-repository';
import { PlanCreateService } from '../service/plan_create.service';
import { AppError } from '@modules/utils/app_error';
import { makePlan } from '@modules/business/plan/shared/models/test/plan-factory';

jest.mock('argon2');
describe('Test in route create plan', () => {
  let plan_repository: InMemoryPlanRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    // Populando os repositórios com dados iniciais
    plan_repository = new InMemoryPlanRepository();
  });
  it('should not add plan, because plan exists', async () => {
    plan_repository.list_plan.push(makePlan());
    const plan_service = new PlanCreateService(plan_repository);
    expect(
      plan_service.execute({
        name: 'free',
        active: true,
        description: 'fdsfs',
        max_appointments: 0,
        max_customers: 0,
        max_members: 0,
        price: 0,
      }),
    ).rejects.toThrow(new AppError('Plano já existe'));
  });

  it('should add plan', async () => {
    const plan_service = new PlanCreateService(plan_repository);
    await plan_service.execute({
      name: 'free',
      active: true,
      description: 'fdsfs',
      max_appointments: 0,
      max_customers: 0,
      max_members: 0,
      price: 0,
    });
    expect(plan_repository.list_plan).toHaveLength(1);
  });
});
