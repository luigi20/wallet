import { InMemoryPlanRepository } from '@modules/business/plan/shared/repositories/test/in-memory-plan-repository';
import { PlanUpdateService } from '../service/plan_update.service';
import { AppError } from '@modules/utils/app_error';
import { makePlan } from '@modules/business/plan/shared/models/test/plan-factory';

jest.mock('argon2');
describe('Test in route update plan', () => {
  let plan_repository: InMemoryPlanRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    // Populando os repositórios com dados iniciais
    plan_repository = new InMemoryPlanRepository();
  });
  it(`should not update plan, because plan don't exists`, async () => {
    plan_repository.list_plan.push(makePlan());
    const plan_service = new PlanUpdateService(plan_repository);
    expect(
      plan_service.execute({
        name: 'free',
        active: true,
        description: 'fdsfs',
        max_appointments: 0,
        max_customers: 0,
        max_members: 0,
        price: 0,
        id: '123',
      }),
    ).rejects.toThrow(new AppError('Plano não existe', 404));
  });

  it(`should not update plan, because plan name exists`, async () => {
    plan_repository.list_plan.push(
      makePlan({
        id: '123',
        props: {
          name: 'free',
        },
      }),
    );
    plan_repository.list_plan.push(
      makePlan({
        id: '1237',
        props: {
          name: 'free2',
        },
      }),
    );
    const plan_service = new PlanUpdateService(plan_repository);
    expect(
      plan_service.execute({
        name: 'free2',
        active: true,
        description: 'fdsfs',
        max_appointments: 0,
        max_customers: 0,
        max_members: 0,
        price: 0,
        id: '123',
      }),
    ).rejects.toThrow(new AppError('Nome de plano já existe', 404));
  });

  it('should update plan', async () => {
    plan_repository.list_plan.push(
      makePlan({
        id: '123',
        props: {
          name: 'free',
        },
      }),
    );
    const plan_service = new PlanUpdateService(plan_repository);
    const result = await plan_service.execute({
      name: 'free2',
      active: false,
      description: 'fdsfs',
      max_appointments: 0,
      max_customers: 0,
      max_members: 0,
      price: 0,
      id: '123',
    });
    expect(result.name).toEqual('free2');
    expect(result.active).toEqual(false);
    expect(plan_repository.list_plan).toHaveLength(1);
  });
});
