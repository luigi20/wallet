import { randomUUID } from 'crypto';
import { Customer, Customer_Props } from '../customer';

type Override = Partial<Customer_Props>;
type FactoryParams = {
  id?: string;
  props?: Override;
};
export function makeCustomer({ id, props }: FactoryParams = {}) {
  return new Customer(
    {
      profile_id: randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
      ...props,
    },
    id,
  );
}
