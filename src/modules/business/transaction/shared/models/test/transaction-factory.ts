import { randomUUID } from 'crypto';
import { Transaction, Transaction_Props } from '../transaction';

type Override = Partial<Transaction_Props>;
type FactoryParams = {
  id?: string;
  props?: Override;
};

export function makeTransaction({ id, props }: FactoryParams = {}) {
  return new Transaction(
    {
      amount: 100.5,
      sender_wallet_id: randomUUID(),
      receiver_wallet_id: randomUUID(),
      status: 'completed',
      created_at: new Date(),
      updated_at: new Date(),
      ...props,
    },
    id,
  );
}
