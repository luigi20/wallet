import { InMemoryPlanRepository } from '@modules/business/plan/shared/repositories/test/in-memory-plan-repository';
import { AppError } from '@modules/utils/app_error';
import { makePlan } from '@modules/business/plan/shared/models/test/plan-factory';
import { PlanGetOneService } from '../service/plan_get_one.service';
jest.mock('argon2');
describe('Test in route get one plan', () => {
  let plan_repository: InMemoryPlanRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    // Populando os repositórios com dados iniciais
    plan_repository = new InMemoryPlanRepository();
  });
  it(`should not add plan, because plan don't exists`, async () => {
    const plan_service = new PlanGetOneService(plan_repository);
    expect(plan_service.execute('123')).rejects.toThrow(
      new AppError('Plano não existe', 404),
    );
  });

  it('should get one plan', async () => {
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
        id: '1234',
        props: {
          name: 'free2',
        },
      }),
    );
    plan_repository.list_plan.push(
      makePlan({
        id: '1235',
        props: {
          name: 'free3',
        },
      }),
    );
    const plan_service = new PlanGetOneService(plan_repository);
    const result = await plan_service.execute('1235');
    expect(result.name).toBe('free3');
  });
});
