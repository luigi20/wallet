import { randomUUID } from 'crypto';
import { Entity_Customer, Entity_Customer_Props } from '../entity_customer';

type Override = Partial<Entity_Customer_Props>;
type FactoryParams = {
  id?: string;
  props?: Override;
};
export function makeEntityMembershipCustomer({
  id,
  props,
}: FactoryParams = {}) {
  return new Entity_Customer(
    {
      entity_id: randomUUID(),
      customer_id: randomUUID(),
      created_at: new Date(),
      notes: 'role',
      status: 'ativo',
      updated_at: new Date(),
      ...props,
    },
    id,
  );
}
