import { randomUUID } from 'crypto';
import { Wallet_Props, Wallet } from '../wallet';

type Override = Partial<Wallet_Props>;
type FactoryParams = {
  id?: string;
  props?: Override;
};

export function makeWallet({ id, props }: FactoryParams = {}) {
  return new Wallet(
    {
      balance: 100.5,
      user_id: randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
      ...props,
    },
    id,
  );
}
