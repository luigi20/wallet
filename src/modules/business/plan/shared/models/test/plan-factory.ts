import { Plan, Plan_Props } from '../plan';

type FactoryParams = {
  id?: string;
  props?: Override;
};
type Override = Partial<Plan_Props>;
export function makePlan({ id, props }: FactoryParams = {}) {
  return new Plan(
    {
      active: true,
      name: 'free',
      price: 0,
      ...props,
    },
    id,
  );
}
