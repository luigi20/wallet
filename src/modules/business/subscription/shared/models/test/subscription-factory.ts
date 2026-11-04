import { randomUUID } from 'crypto';
import { Subscription, Subscription_Props } from '../subscription';

type FactoryParams = {
  id?: string;
  props?: Override;
};
type Override = Partial<Subscription_Props>;
export function makeSubscription({ id, props }: FactoryParams = {}) {
  return new Subscription(
    {
      entity_id: randomUUID(),
      plan_id: randomUUID(),
      started_at: new Date(),
      status: 'ativo',
      ...props,
    },
    id,
  );
}
